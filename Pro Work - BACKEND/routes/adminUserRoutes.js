// routes/adminUserRoutes.js
import express from 'express';
const Router = express.Router();

import isAdmin from '../middleware/isAdmin.js';
import {
  adminGetAllUsers,
  adminGetUserById,
  adminUpdateUser,
  adminDeleteUser
} from '../controllers/adminUserController.js';

Router.use(isAdmin); // protect all admin user routes

Router.get('/', adminGetAllUsers);
Router.get('/:id', adminGetUserById);
Router.put('/:id', adminUpdateUser);
Router.delete('/:id', adminDeleteUser);

export default Router;
