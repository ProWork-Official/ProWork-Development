import express from 'express';
const Router = express.Router();

import { contactPost, contactGet, contactUsage, contactUnreadCount, contactMarkRead } from '../controllers/Contact.js';

Router.post('/', contactPost);   // public — saves a message
Router.get('/', contactGet);     // protected — list messages (admin/staff)
Router.get('/usage', contactUsage);  // public/protected usage
Router.get('/unread-count', contactUnreadCount); // GET unread count
Router.patch('/:id/read', contactMarkRead); // mark message read

export default Router;
