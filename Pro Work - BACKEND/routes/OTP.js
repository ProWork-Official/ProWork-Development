import express from 'express'
const Router = express.Router();

import { GenerateOTP, VerifyOTP  } from '../controllers/OTP.js';

Router.post("/generate-otp", GenerateOTP);
Router.post("/verify-otp", VerifyOTP);


export default Router


