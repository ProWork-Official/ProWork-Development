import express from 'express'
const Router = express.Router();

import { paymentStart, paymentVerification } from '../controllers/Payment.js';

Router.post("/start", paymentStart);
Router.post("/verify-payment-signature", paymentVerification);

export default Router