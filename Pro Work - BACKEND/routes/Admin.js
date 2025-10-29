import express from 'express'
const Router = express.Router();

import isAdmin from '../middleware/isAdmin.js'; 

import { 
    ShowAllUserData, 
    ShowAllWorkerData,
    ShowOneProfile,
    IncompleteWorker,
    ServiceFormEdit,
    ServicePostUpdate,
    adminDeleteWorker,
    adminGetWorkerById,
    adminGetWorkerServices,
    adminUpdateWorker
 } from '../controllers/Admin.js';

Router.get("/user-data", ShowAllUserData);
Router.get("/worker-data", ShowAllWorkerData);
Router.get("/incomplete-worker", IncompleteWorker);
Router.get("/profile/:query", ShowOneProfile);
Router.post("/SpU", ServicePostUpdate);
Router.get("/serviceformedit/:workerID", ServiceFormEdit);
Router.delete("/worker/:id", isAdmin, adminDeleteWorker);
Router.get('/worker/:id', isAdmin, adminGetWorkerById);
Router.get('/worker/:id/services', isAdmin, adminGetWorkerServices);
Router.patch('/worker/:id', isAdmin, adminUpdateWorker);
export default Router


