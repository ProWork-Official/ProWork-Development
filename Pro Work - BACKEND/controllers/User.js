// Importing required modules form external packages
import nodemailer from 'nodemailer';
import JWT from 'jsonwebtoken';

// Importing required modules from local files
import User from '../models/User/User.js'
import UserPersonal from '../models/User/UserPersonal.js'
import UserAddress from '../models/User/UserAddress.js'
import UserBooking from '../models/User/UserBooking.js'

// Importing environment variables
const JWT_Secret = process.env.JWT_SECRET;
const PROWORK_EMAIL = process.env.PROWORK_EMAIL;
const PROWORK_EMAIL_APP_PASSWORD = process.env.PROWORK_EMAIL_APP_PASSWORD;


//--------------------------------------SignIn and Logout Details------------------------

// function to sign up or login user
export async function userSignUpPost(req, res) {
    try {
        const existingUser = await User.find({ PhoneNumber: req.body.PhoneNumber });

            if (existingUser.length === 0) {
                const { PhoneNumber } = req.body;
                const savedUser = await new User({ PhoneNumber }).save();

                console.log(`New user added successfully with Phone Number ${savedUser.PhoneNumber}`);

                // Create JWT token
                const JWT_Token = JWT.sign( { PhoneNumber: savedUser.PhoneNumber, UserObjectID: savedUser._id }, JWT_Secret );
                res.cookie("UserToken", JWT_Token, { httpOnly: true, secure: true,  maxAge: 3600000 * 24 * 21 });

                return res.status(201).send(savedUser); 
            } else {
                const loginUser = existingUser;

                console.log(`User Logged In Successfully with Phone Number ${loginUser[0].PhoneNumber}`);

                // Create JWT token
                let JWT_Token = JWT.sign( { PhoneNumber: loginUser[0].PhoneNumber, UserObjectID: loginUser[0]._id }, JWT_Secret );
                res.cookie("UserToken", JWT_Token, { httpOnly: true, secure: true, maxAge: 3600000 * 24 * 21 });
                
                return res.status(201).send(loginUser);
            }
        
    } catch (error) {
        console.log("Error during user sign up/log in:", error);
        return res.status(500).send({ message: "Error during user sign up/log in:", error });
    }
}
// function to send user data 
export async function userSignUpGet(req, res) {
    const jwtPresent = req.cookies?.UserToken
    if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
    
    try{
        const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
        const currUser = await User.find({_id: currUserID});

        return currUser[0] ? res.status(200).send(currUser) : res.status(204).send();
    } catch (error) {
        console.log("Error in fetching User Details, Please login again", error);
        res.status(500).send({ message: "Error in fetching User Details, Please login again", error });
    }
}
// function to log out user
export async function userLogOut(req, res) {
    const jwtPresent = req.cookies?.UserToken
    if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });

    try {
        const JWT_Token = JWT.verify( jwtPresent, JWT_Secret  );
        if(JWT_Token){
            res.clearCookie("UserToken")
            return res.status(204).send({message: "User logged out successfully"}).end()
        }
    } catch (error) {
        console.log("Error in logging out user, Please try again", error);
        res.status(500).send({ message: "Error in logging out user, Please try again", error });
    }
}

//--------------------------------------Personal Details---------------------------------

// function to add personal details of user
export async function userPersonalPost(req, res){
    const jwtPresent = req.cookies?.UserToken
    if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
    
    try{
        const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
        const { Name, Email } = req.body.LocalPersonalFormData
        const { UserObjectID } = req.body
        if (UserObjectID !== currUserID) return res.status(403).send({ message: "Invalid user ID" });
            
        const checkEmail = await UserPersonal.find({Email: Email});
        if (checkEmail.length > 0) return res.status(401).send({ message: "Email already exists" }); 

        // Sending Email to user's email address to confirm registration
        const transporter = nodemailer.createTransport({ service: 'gmail', host: "smtp.gmail.com", port: 587, secure: false, auth: { user: PROWORK_EMAIL, pass: PROWORK_EMAIL_APP_PASSWORD }, });  
        const mailOptions = {
            from: { name: 'Pro Work', address: PROWORK_EMAIL },
            to: Email,
            subject: "Email added on Pro Work", 
            html: `
                <html>
                    <head>
                        <meta charset="UTF-8" />
                        <title>Email Registration on Pro Work</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="30" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); margin-top: 30px;">                                            
                                        <tr>
                                            <td align="center">
                                                                
                                                <img src="cid:proworklogo" alt="Pro Work Logo" width="150" style="margin-bottom: 20px;" />
                                                <h2 style="margin-bottom: 5px;">Verify your email to sign up for <span style="color: #559C72;">Pro Work</span></h2>
                                                <p style="margin-top: 0;">We have received a signup attempt from <strong>[Your City]</strong> with the following code:</p>

                                                <div style="background-color: #E2D6C6; padding: 15px; font-size: 18px; margin: 20px auto; width: fit-content; border-radius: 5px; font-weight: bold;">Ordinary Elephant</div>

                                                <p>To complete the signup process, please click the button below. By completing your signup, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>

                                                <a href="https://prowork.org.in/verify?token=YOUR_TOKEN" style="display: inline-block; padding: 12px 24px; background-color: #559C72; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify</a>

                                                <p style="margin-top: 30px; font-size: 14px; color: #777;">Or copy and paste this URL into your browser:</p>
                                                <p style="word-break: break-all; font-size: 14px; color: #555;">https://prowork.org.in/verify?token=YOUR_TOKEN</p>

                                                            
                                                <p style="font-size: 13px; color: #999; margin-top: 40px;">If you didn’t request this, you can ignore this email.</p>
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
                console.log("Email sent successfully to ", Email);
            } catch(error){
                console.log("Error in sending email", error);
            }
        }
        sendMail(transporter, mailOptions);

        const savedPersonal = await new UserPersonal({ Name, Email, isPersonal: true, UserObjectID }).save();
            
        console.log("User personal details added Successfully");
        return res.status(201).send(savedPersonal)        
    } catch (error) {
        console.log("Error in adding user's personal details", error);
        return res.status(500).send({ message: "Error in adding user's personal details", error });
    }
    
}
// function to send personal details of user
export async function userPersonalGet(req, res){
    const jwtPresent = req.cookies?.UserToken
    if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });

    try {
        const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
        const userPersonal = await UserPersonal.find({UserObjectID: currUserID});
        if(userPersonal[0] == undefined) return res.status(204).send();
                            
        console.log("Current user's personal details sent successfully");
        return res.status(200).send(userPersonal);
            
    } catch (error) {
        console.log("User Personal Details not found", error);
        return res.status(500).send({ message: "User Personal Details not found", error });
    }
}
// function to edit personal details of user
export async function userPersonalPatch(req, res){
    const jwtPresent = req.cookies?.UserToken
    if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });

    try {
        const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
        const { Name } = req.body.EditPersonalFormData
        const { UserObjectID } = req.body
        if (UserObjectID !== currUserID) return res.status(403).send({ message: "Invalid user ID" });

        const editedPersonal = await UserPersonal.findOneAndUpdate({UserObjectID:UserObjectID}, { Name });

        console.log("User personal details updated successfully")
        return res.status(201).send(editedPersonal)
            
    } catch (error) {
        console.log("Error in Updating Personal Details", error);
        return res.status(500).send({ message: "Error in Updating Personal Details", error });
    }
}

//--------------------------------------Address Details--------------------------------

// function to add address details of user
export async function userAddressPost(req, res){
    const jwtPresent = req.cookies?.UserToken
    if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });

    try {
        const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
        const { Address, Landmark, PinCode } = req.body.LocalAddressFormData;
        const { UserObjectID } = req.body;
        if (UserObjectID !== currUserID) return res.status(403).send({ message: "Invalid user ID" });

        const savedAddress = await new UserAddress({ Address, Landmark, PinCode, isAddress: true, UserObjectID }).save();
        console.log("User address added successfully");
        return res.status(201).send(savedAddress)
               
    } catch (error) {
        console.log("Error in adding user's address", error);
        return res.status(500).send({ message: "Error in adding user's address", error });
    }
}
// function to send address details of user
export async function userAddressGet(req, res){
    const jwtPresent = req.cookies?.UserToken
    if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });

    try {
        const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
        const userAddress = await UserAddress.find({UserObjectID: currUserID});
        if(userAddress[0] == undefined) return res.status(204).send();
            
        console.log("Current user's address sent successfully");
        return res.status(200).send(userAddress)    
    } catch (error) {
        console.log("User Address Details not found", error);
        return res.status(500).send({ message: "User Address Details not found", error });
    }
}
// function to edit address details of user
export async function userAddressPatch(req, res){
    const jwtPresent = req.cookies?.UserToken
    if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });

    try {
        const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
        const { Address, Landmark, PinCode } = req.body.EditAddressFormData
        const { UserObjectID } = req.body
        if (UserObjectID !== currUserID) return res.status(403).send({ message: "Invalid user ID" });

        const updatedAddress = await UserAddress.findOneAndUpdate({UserObjectID:UserObjectID}, { Address, Landmark, PinCode });

        console.log("User address updated successfully");
        return res.status(201).send(updatedAddress)
    } catch (error) {
        console.log("Error in updating user's address", error);
        return res.status(500).send({ message: "Error in updating user's address", error });
    }
}


//--------------------------------------My Bookings Details--------------------------------

// function to add booking details of user
export async function MyBookingPost(req, res){
    const jwtPresent = req.cookies?.UserToken
    if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });

    try {
        const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
        const { BookingCategory, BookingService, ShopName, ServiceAmount, TravelAmount, TotalAmount, WorkerNumber, UserNumber, UserName, UserObjectID, WorkerObjectID } = req.body;
        if (UserObjectID !== currUserID) return res.status(403).send({ message: "Invalid user ID" });

        const savedBooking = await new UserBooking({ PaymentStatus: 'Completed', BookingCategory, BookingService, ShopName, ServiceAmount, TravelAmount, TotalAmount, WorkerNumber, UserNumber, UserName, UserObjectID, WorkerObjectID }).save();

        console.log("Booking have been saved successfully");
        return res.status(201).send(savedBooking);
            
    } catch (error) {
        console.log("Error in Saving Booking details", error);
        return res.status(500).send({ message: "Error in Saving Booking details", error });
    }
}
// function to send booking details of user
export async function MyBookingGet(req, res){
    const jwtPresent = req.cookies?.UserToken
    if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });

    try {
        const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
        const userBooking = await UserBooking.find({UserObjectID: currUserID}).sort({ BookingDateTime: -1 });
        if(userBooking[0] == undefined) return res.status(204).send();
           
        console.log("Current User's Booking Details are sent successfully");
        return res.status(200).send(userBooking);
            
    } catch (error) {
        console.log("Error in fetching User Booking Details, Please Login", error);
        return res.status(500).send({ message: "Error in fetching User Booking Details, Please Login", error });
    }
}

