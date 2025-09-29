import nodemailer from 'nodemailer';
import JWT from 'jsonwebtoken';

// Importing required modules from local files
import User from '../models/User/User.js'
import Worker from '../models/Worker/Worker.js'
import WorkerService from '../models/Worker/WorkerService.js';
import UserPersonal from '../models/User/UserPersonal.js'
import UserAddress from '../models/User/UserAddress.js'
import UserBooking from '../models/User/UserBooking.js'

// Importing environment variables
const JWT_Secret = process.env.JWT_SECRET;
const PROWORK_EMAIL = process.env.PROWORK_EMAIL;
const PROWORK_EMAIL_APP_PASSWORD = process.env.PROWORK_EMAIL_APP_PASSWORD;



// function to send user data 
export async function ShowAllUserData(req, res) {
  const jwtPresent = req.cookies?.UserToken
  if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
    
  try{
    const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
    const currUser = await User.find({}).sort({ UserSignUpTime: -1 });;
    return currUser[0] ? res.status(200).send(currUser) : res.status(204).send();
  } catch (error) {
    console.log("Error in fetching User Details, Please login again", error);
    res.status(500).send({ message: "Error in fetching User Details, Please login again", error });
  }
}

// function to send user data 
export async function ShowAllWorkerData(req, res) {
  const jwtPresent = req.cookies?.UserToken
  if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
    
  try{
    const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
    const currWorker = await Worker.find({isService: true}).sort({ createdAt: -1 });
    return currWorker[0] ? res.status(200).send(currWorker) : res.status(204).send();
  } catch (error) {
    console.log("Error in fetching User Details, Please login again", error);
    res.status(500).send({ message: "Error in fetching User Details, Please login again", error });
  }
}

export async function IncompleteWorker(req, res) {
  const jwtPresent = req.cookies?.UserToken
  if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
      
  try{
    const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
    const currWorker = await Worker.find({isService: false}).sort({ createdAt: -1 });;
    if(currWorker[0] == undefined) return res.status(204).send();
          
    console.log(`Worker details are sent successfully`);
    return res.status(200).send(currWorker)    
  } catch(error) {
    console.log("Worker details not found", error);
    return res.status(500).send({ message: "Worker details not found", error });
  }
}

export async function ShowOneProfile(req, res){
  try{
    const { query } = req.params;
    const selectedWorker = await Worker.find({ ShopPhoneNumber: query });
    if (selectedWorker[0] == undefined) return res.status(404).send({ message: "Worker not found with this ID" });
    return res.status(200).send(selectedWorker);
  } catch (error) {
    console.log("Error in fetching selected worker details", error);
    res.status(500).send({ message: "Error in fetching selected worker details", error });
  }
}

export async function ServiceFormEdit(req, res) {
  const jwtPresent = req.cookies?.UserToken;
  if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });

  try {
    const { workerID } = req.params;
    console.log("WorkerID received is: ", workerID);

    const currUserID = JWT.verify(jwtPresent, JWT_Secret).UserObjectID;

    // Step 1: Find the worker
    const currWorker = await WorkerService.find({ WorkerObjectID: workerID });

    if (!currWorker || currWorker.length === 0) {
      return res.status(204).send(); // No Content
    }

    // Step 2: Delete the found worker from WorkerService collection
    await WorkerService.deleteOne({ WorkerObjectID: workerID });
    console.log(`Worker with ID ${workerID} deleted successfully from WorkerService.`);

    // Step 3: Fetch all workers where isService is false
    const selectedWorker = await Worker.updateOne({ _id: workerID }, { isService: false });
    console.log(`Worker with ID ${workerID} updated to isService: false.`);

    // You can return both the deleted worker and the updated list, or just the updated list
    return res.status(200).send({
      message: "Worker deleted and non-service workers fetched successfully.",
      deletedWorker: currWorker[0],
      nonServiceWorkers: selectedWorker
    });

  } catch (error) {
    console.log("Error occurred in ServiceFormEdit:", error);
    return res.status(500).send({ message: "An error occurred", error });
  }
}


export async function ServicePostUpdate(req, res) {
  const jwtPresent = req.cookies?.UserToken;
  if (!jwtPresent) {
    return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
  }

  try {
    const currUserID = JWT.verify(jwtPresent, JWT_Secret).UserObjectID;
    const { UserObjectID, WorkerObjectID, FinalServiceFormData } = req.body;
    console.log("Received data: ", { UserObjectID, WorkerObjectID, FinalServiceFormData });

    // if (UserObjectID !== currUserID) {
    //   return res.status(403).send({ message: "Invalid user ID" });
    // }

    // Utility function to calculate overcharge
    const getRandomOverCharge = (baseValue) => {
      if (isNaN(baseValue)) return 0;
      const min = baseValue + 100;
      const max = baseValue + 250;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const { Category, Services } = FinalServiceFormData;

    // Clean and enrich submitted services with OverCharge
    const servicesWithOvercharges = Services.map(service => ({
      ...service,
      SubServices: service.SubServices.map(sub => ({
        ...sub,
        Details: sub.Details.map(detail => ({
          ...detail,
          OverCharge: getRandomOverCharge(detail.Charge)
        }))
      }))
    }));

    console.log("Final services with overcharges: ", servicesWithOvercharges);

    // Save to MongoDB
    const savedWorkerService = await new WorkerService({
      Category,
      Services: servicesWithOvercharges,
      isService: true,
      UserObjectID,
      WorkerObjectID
    }).save();

    

    // Update worker profile
    const addedService = await Worker.findOneAndUpdate(
      { _id: WorkerObjectID },
      { isService: true },
      { new: true }
    );

    


    console.log("Services added successfully");
    return res.status(201).send(savedWorkerService);
  } catch (error) {
    console.error("Error in adding services, try again", error);
    return res.status(500).send({ message: "Error in adding service", error });
  }
}