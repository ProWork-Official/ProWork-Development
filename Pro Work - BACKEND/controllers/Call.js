import axios from 'axios';

const SID = process.env.EXOTEL_SID;
const API_KEY = process.env.EXOTEL_API;
const TOKEN = process.env.EXOTEL_TOKEN;
const VIRTUAL_NUMBER = process.env.EXOTEL_VIRTUAL_NUMBER;
const SENDER_ID = process.env.EXOTEL_SENDER_ID;

// Route to trigger call with number masking
export async function HandleMaskCall(req, res){
  const { callingPhone, recievingPhone } = req.body;

  console.log("Calling Phone:", callingPhone);
  
  const url = `https://${API_KEY}:${TOKEN}@api.exotel.com/v1/Accounts/${SID}/Calls/connect.json`;
  const data = new URLSearchParams({ From: callingPhone, To: recievingPhone, CallerId: VIRTUAL_NUMBER, TimeLimit: '60', TimeOut: '30', CallType: 'trans' });

  try {
    const response = await axios.post(url, data);
    res.json({ success: true, message: 'Call initiated', details: response.data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Call failed', error: error.response?.data || error.message });
  }
}
  
// Route to trigger voice message to worker on service booking
export async function HandleVoiceMessage(req, res) {
  const { workerPhone } = req.body;

  try {
    // 1. Voice Message to worker
    const voiceParams = new URLSearchParams({
      From: workerPhone,
      CallerId: VIRTUAL_NUMBER,
      Url: `http://my.exotel.com/${SID}/exoml/start_voice/1012855`,
      TimeLimit: '30',
      TimeOut: '30',
      CallType: 'trans',
    });

    await axios.post(`https://${API_KEY}:${TOKEN}@api.exotel.com/v1/Accounts/${SID}/Calls/connect.json`, voiceParams.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } } )
    .then(response => {
      console.log("Call Recieved");
      res.status(201).json({ success: true, message: 'Voice message sent successfully', details: response.data });
    })
    .catch(error => {
      console.log("Error response:", error.response.data);
    });
  } catch (error) {
    console.log('Communication error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to trigger communication' });
  }
}

// Route to trigger SMS to worker on service booking
export async function HandleSMS(req, res) {

  const { workerPhone, Address, Landmark, PinCode, BookingService, UserName } = req.body;

  try{
    // 2. SMS to worker
    const smsParams = new URLSearchParams({
      From: SENDER_ID,
      To: workerPhone,
      Body: `
      Dear Worker,

      You have received a new booking for ${BookingService} on ProWork.

      Customer: ${UserName} 
      Address: ${Address}, Landmark: ${Landmark}, Pincode: ${PinCode}

      Please check your ProWork dashboard for full details.  

      Regards,
      Prowork Team
      `,
    });

    await axios.post( `https://${API_KEY}:${TOKEN}@api.exotel.com/v1/Accounts/${SID}/Sms/send.json`, smsParams.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } } )
    .then(response => {
      console.log("SMS Recieved");
      res.status(200).json({ success: true, message: 'SMS sent successfully', details: response.data });
    })
    .catch(error => {
      console.log("Error response:", error.response.data);
    });
  } catch (error) {
    console.log('Communication error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to trigger communication' });
  }
}

// Route to store XML file to public URL (https://api.prowork.org.in/call/voiceXML)
export async function VoiceXML(req, res){
  res.set('Content-Type', 'text/xml');
  res.send(`
    <Response>
      <Say voice="female">
        Hello! You have a new booking from Pro Work. Please check your SMS for details.
      </Say>
    </Response>
  `);
}



