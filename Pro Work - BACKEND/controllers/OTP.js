import axios from 'axios';

const SID = process.env.EXOTEL_SID;
const APP_ID = process.env.EXOTEL_APP_ID;
const SECRET_KEY = process.env.EXOTEL_SECRET_KEY;

const credentials = `${APP_ID}:${SECRET_KEY}`;
const encodedCredentials = Buffer.from(credentials).toString('base64');

// Endpoint to generate and send OTP
export async function GenerateOTP(req, res){
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).send({ message: 'Phone number is required' });
  }
  try {
    console.log("Generating OTP for phone number:", phoneNumber);
    const response = await axios.post( `https://exoverify.exotel.com/v2/accounts/${SID}/verifications/sms`, { application_id: APP_ID, phone_number: phoneNumber}, { headers: { 'Authorization': `Basic ${encodedCredentials}`, 'Content-Type': 'application/json' }});
    const OTP_ID = response.data.response.data.verification_id;
    if (response.status == 200) {
      res.status(200).send({OTP_ID});
      return;
    } else if (response.status == 400) {
      res.status(400).send({ message: 'Invalid phone number' });
      return;
    }
    res.status(500).send({ message: 'Failed to send OTP' });
  } catch (error) {
    console.log("Error sending OTP:", error);
    res.status(500).send({ message: 'Error sending OTP', error: error });
  }
}

// Endpoint to verify OTP (simplified, you may need a DB or cache to store OTP)
export async function VerifyOTP(req, res){
  const { OTPValue, OTP_ID } = req.body;
  if (!OTPValue || !OTP_ID) {
    return res.status(400).send({ message: 'OTP and OTP ID are required' });
  }
  try {
    const OTPString = OTPValue.toString().padStart(6, '0');;
    const response = await axios.post(`https://exoverify.exotel.com/v2/accounts/${SID}/verifications/sms/${OTP_ID}`, { OTP: OTPString }, { headers: { 'Authorization': `Basic ${encodedCredentials}`, 'Content-Type': 'application/json' }});
    if (response.status === 200 && response.data.response.data.status === 'success') {
      res.status(201).send({ message: 'OTP verified successfully' });
      return
    }
    res.status(400).send({ message: 'Invalid OTP' });
  } catch (error) {
    console.log("Error verifying OTP:", error);
    res.status(500).send({ message: 'Error verifying OTP' });
  }
  
};
