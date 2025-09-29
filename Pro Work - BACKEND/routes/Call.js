import express from 'express'
const Router = express.Router();

import { HandleMaskCall, HandleVoiceMessage, HandleSMS, VoiceXML } from '../controllers/Call.js';

Router.post("/mask-call", HandleMaskCall);
Router.post("/voice-message", HandleVoiceMessage);
Router.post("/sms", HandleSMS);
Router.get("/voiceXML", VoiceXML);

export default Router


