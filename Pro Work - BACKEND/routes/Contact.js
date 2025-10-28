import express from 'express';
const Router = express.Router();

import { contactPost, contactGet, contactUsage } from '../controllers/Contact.js';

Router.post('/', contactPost);   // public — saves a message
Router.get('/', contactGet);     // protected — list messages (admin/staff)
Router.get('/usage', contactUsage);  // GET /contact/usage

export default Router;
