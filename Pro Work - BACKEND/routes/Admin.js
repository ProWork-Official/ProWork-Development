import express from 'express'
const Router = express.Router();

import { 
    ShowAllUserData, 
    ShowAllWorkerData,
    ShowOneProfile,
    IncompleteWorker,
    ServiceFormEdit,
    ServicePostUpdate
 } from '../controllers/Admin.js';

Router.get("/user-data", ShowAllUserData);
Router.get("/worker-data", ShowAllWorkerData);
Router.get("/incomplete-worker", IncompleteWorker);
Router.get("/profile/:query", ShowOneProfile);
Router.post("/SpU", ServicePostUpdate);
Router.get("/serviceformedit/:workerID", ServiceFormEdit);

export default Router


