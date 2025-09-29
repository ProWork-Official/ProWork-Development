import express from 'express'
const Router = express.Router();

import { 
    workerRegisterPost, workerRegisterGet, workerRegisterPatch,
    ServicePost, ServiceGet,
    ReviewPost, ReviewGet,
    MyWorkGet,
    WorkerView, OneWorkerView, OneWorkerServiceView,
    CategoryNumber,
    workerBankPost, workerBankGet,
    WorkerWidthdrawalPost, WorkerWidthdrawalGet,
    WorkerBalanceGet, WorkerBalancePatch
} from '../controllers/Worker.js';

Router.post("/register", workerRegisterPost);
Router.get("/register", workerRegisterGet);
Router.patch("/register", workerRegisterPatch);

Router.post("/service", ServicePost)
Router.get("/service", ServiceGet)

Router.post("/review", ReviewPost)
Router.get("/review/:id", ReviewGet)


Router.get("/my-work", MyWorkGet)

Router.post("/register/category", WorkerView)
Router.get("/register/category/:id", OneWorkerView)
Router.get("/register/category/service/:id", OneWorkerServiceView)

Router.get("/category-number", CategoryNumber)

Router.post("/bank", workerBankPost);
Router.get("/bank", workerBankGet);

Router.post("/widthrawal", WorkerWidthdrawalPost);
Router.get("/widthrawal", WorkerWidthdrawalGet);

Router.get("/balance", WorkerBalanceGet);
Router.patch("/balance", WorkerBalancePatch);

export default Router