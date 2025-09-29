// Importing required modules form external packages
import client from 'twilio'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import JWT from 'jsonwebtoken'

// Importing required modules from local files
import PaymentDetails from '../models/Payment/PaymentDetail.js'
import UserBooking from '../models/User/UserBooking.js'

// Importing environment variables
const JWT_Secret = process.env.JWT_SECRET;
const FrontendURL_Production = process.env.FRONTEND_URl_PRODUCTION
const PROWORK_EMAIL = process.env.PROWORK_EMAIL;
const PROWORK_EMAIL_APP_PASSWORD = process.env.PROWORK_EMAIL_APP_PASSWORD;
const RazorpayKeyIDDEV = process.env.RAZORPAY_KEY_ID_DEV;
const RazorpayKeyIDProduction = process.env.RAZORPAY_KEY_ID_PRODUCTION;
const RazorpayKeySeceretDEV = process.env.RAZORPAY_KEY_SECRET_DEV;
const RazorpayKeySeceretProduction = process.env.RAZORPAY_KEY_SECRET_PRODUCTION;

// creating razorpay instance
const razorpay = new Razorpay({ key_id: RazorpayKeyIDProduction , key_secret: RazorpayKeySeceretProduction });


//--------------------------------------Payment Details--------------------------

// Function to initiate payment process
export async function paymentStart(req, res){
  const jwtPresent = req.cookies?.UserToken
  if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
   
  try {
    const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
    const { NamePayer, AmountPayer } = req.body;
    const order = await razorpay.orders.create({ amount: AmountPayer, currency: "INR" });
    await PaymentDetails.create({ order_id: order.id, name: NamePayer, amount: AmountPayer });
    return res.status(201).json({order});       
  } catch (error) {
    console.log("Error in initializing the payment", error);
    return res.status(500).send({ message: "Error in initializing the payment", error });
  }
}

// Function to verify successfull payment 
export async function paymentVerification(req, res){
  const jwtPresent = req.cookies?.UserToken
  if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
    
  try {
    const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const body_data = razorpay_order_id  + "|" + razorpay_payment_id;
    const verified = crypto.createHmac('sha256', RazorpayKeySeceretDev).update(body_data).digest('hex');
    const doneVerified = verified == razorpay_signature;

    if(doneVerified){      
      const userBooking = await UserBooking.findOneAndUpdate({ _id: req.query.mybooking_id }, { PaymentStatus: "Completed" })
      console.log("Payment successfully completed");                        

      await PaymentDetails.findOneAndUpdate({ order_id:razorpay_order_id }, { razorpay_payment_id:razorpay_payment_id, razorpay_order_id:razorpay_order_id,razorpay_signature:razorpay_signature });
      res.redirect(`${FrontendURL_Production}/payment_success?payment_id=${razorpay_payment_id}`);
    

      // sending email to customer about payment received and new service booked
      const transporter = nodemailer.createTransport({ service: 'gmail', host: "smtp.gmail.com", port: 587, secure: false, auth: { user: PROWORK_EMAIL, pass: PROWORK_EMAIL_APP_PASSWORD } });  
      const mailOptions = {
      from: { name: 'Pro Work', address: PROWORK_EMAIL },
      to: 'prowork24.7customercare@gmail.com', //pass user email dynamically
      subject: "Payment received for booked service", 
      html:`
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>ProWork Service Booking Confirmation</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="30" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); margin-top: 30px;">
                    <tr>
                      <td align="center">
                
                        <img src="cid:proworklogo" alt="Pro Work Logo" width="150" style="margin-bottom: 20px;" />
                        <h2 style="margin-bottom: 5px; font-size: 25px">Thank You for Choosing <span style="color: #559C72;">Pro Work</span></h2>
                        <p style="margin-top: 0;">We're happy to serve you!</p>
                    
                        <table cellpadding="10" cellspacing="0" style="margin-top: 20px; background-color: #f2f2f2; border-radius: 8px; font-size: 16px;">
                          <tr>
                            <td><strong>Service Category:</strong></td>
                            <td><span style="color: #559C72;"><strong>[Service Category]</strong></span></td>
                          </tr>
                          <tr>
                            <td><strong>Amount Paid:</strong></td>
                            <td><span style="color: #559C72;"><strong>₹[Amount]</strong></span></td>
                          </tr>
                        </table>

                        <p style="margin-top: 25px;">A ProWork service professional will reach your location within <strong>2–3 hours</strong>. Please ensure someone is available at home to receive the service.</p>

                        <div style="background-color: #E2D6C6; padding: 15px; margin-top: 30px; border-radius: 5px; font-size: 17px; font-weight: bold;">
                          Thank you for trusting ProWork for your home service needs!
                        </div>

                        <a href="https://prowork.org.in/bookings" style="display: inline-block; padding: 12px 24px; background-color: #559C72; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 25px;">View Your Booking</a>

                        <p style="font-size: 13px; color: #999; margin-top: 40px;">Need help? Visit our <a href="https://prowork.org.in/support" style="color: #559C72;">Support Page</a>.</p>
                      </td>
                    </tr>
                  </table>
                  <p style="font-size: 12px; color: #aaa; margin-top: 20px;">© 2025 Pro Work Ventures Pvt Ltd. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </body>
        </html>                        
      `,
      attachments: [ { filename: 'prowork-logo.png', path: './assets/prowork-logo.png', cid: 'proworklogo' } ]
      } 
      const sendMail = async (transporter, mailOptions) =>{
        try{
          await transporter.sendMail(mailOptions);
          console.log("Email has been sent successfully to confirm payment");
        }
        catch(error){
          console.log("Their was an error in sending Payment received email", error);
        }
      }
      sendMail(transporter, mailOptions);
    } else {
      console.log("Payment Signature do not match, Payment Failed");            
      res.json({ redirectUrl: `${FrontendURL_Production}/payment_failed` });        
    }
  } catch (error) {
    console.log("Payment Signature do not match, Payment Failed", error);
    res.status(500).send({ message: "Payment Signature do not match, Payment Failed", error });
  } 
}