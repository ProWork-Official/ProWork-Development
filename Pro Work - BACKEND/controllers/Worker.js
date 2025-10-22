// Importing required modules form external packages
import JWT from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import { algoliasearch } from 'algoliasearch';
import fs from 'fs';



// Importing required modules from local files
import Worker from '../models/Worker/Worker.js'
import WorkerService from '../models/Worker/WorkerService.js'
import WorkerReview from '../models/Worker/WorkerReview.js'
import ServiceNumber from '../models/Admin/ServiceNumber.js';
import UserBooking from '../models/User/UserBooking.js';
import WorkerBank from '../models/Worker/WorkerBank.js';
import WorkerWidthdrawal from '../models/Worker/WorkerWidthrawal.js';
import WorkerMoney from '../models/Worker/WorkerMoney.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET,
  secure: true
});

// Importing environment variables
const JWT_Secret = process.env.JWT_SECRET;
const Algolia_App_ID = process.env.ALGOLIA_APP_ID;
const Algolia_Secret_Key = process.env.ALGOLIA_SECRET_KEY;

// creating algolia instance
const algoliaClient = algoliasearch(Algolia_App_ID, Algolia_Secret_Key);

// helper: normalize uploaded file entry (support array or single file)
function pickFile(uploaded) {
  if (!uploaded) return null;
  if (Array.isArray(uploaded)) return uploaded[0];
  return uploaded;
}

// Upload Worker image to cloudinary
async function uploadFileToCloudinary(file, folder) {
  if (!file) throw new Error("No file provided to uploadFileToCloudinary");

  // file may be an object from express-fileupload (has tempFilePath) or a multer file with path
  const filePath = file.tempFilePath || file.path || file.filepath || null;

  if (!filePath) {
    // If buffer provided (rare), we can upload via upload_stream (advanced). For now throw helpful error.
    throw new Error("Uploaded file does not have a tempFilePath or path. Ensure you use express-fileupload with useTempFiles:true or multer and provide a path.");
  }

  const resourceType = (file.mimetype && file.mimetype.startsWith("video/")) ? "video" : "image";
  const options = { folder: folder || "ProWork", resource_type: resourceType };

  // cloudinary.uploader.upload accepts a local path or URL
  return cloudinary.uploader.upload(filePath, options);
}


//--------------------------------------Count Service-------------------------------- 
// ServiceNumber find this models _id and put it here, line 106
let totalBeautician = 0, totalCarpenter = 0, totalElectrician = 0, totalHousehelp = 0, totalPainter = 0, totalPlumber = 0, totalPriest = 0, totalTutor = 0;
async function CountService(options) {
  const { ServiceCategory } = options;
  if(ServiceCategory === "Beautician") {
    const beauticianCount = await ServiceNumber.find({ _id: { $in: ['68983cd72eeb1b86bbff5d29', '686a3b1e37825f128c0675c9'] } });
    totalBeautician = beauticianCount[0].TotalBeautician + 1;
    const CountService = await ServiceNumber.findOneAndUpdate( { _id: { $in: ['68983cd72eeb1b86bbff5d29', '686a3b1e37825f128c0675c9'] } }, { TotalBeautician: totalBeautician } );
    return CountService.TotalBeautician
  } else if(ServiceCategory === "Carpenter") {
    const carpenterCount = await ServiceNumber.find({ _id: { $in: ['68983cd72eeb1b86bbff5d29', '686a3b1e37825f128c0675c9'] } });
    totalCarpenter = carpenterCount[0].TotalCarpenter + 1;
    const CountService = await ServiceNumber.findOneAndUpdate( {_id: { $in: ['68983cd72eeb1b86bbff5d29', '686a3b1e37825f128c0675c9'] }}, { TotalCarpenter:totalCarpenter });
    return CountService.TotalCarpenter
  } else if(ServiceCategory === "Electrician") {
    const electricianCount = await ServiceNumber.find({ _id: { $in: ['68983cd72eeb1b86bbff5d29', '686a3b1e37825f128c0675c9'] } });
    totalElectrician = electricianCount[0].TotalElectrician + 1;
    const CountService = await ServiceNumber.findOneAndUpdate( {_id: { $in: ['68983cd72eeb1b86bbff5d29', '686a3b1e37825f128c0675c9'] }}, { TotalElectrician:totalElectrician });
    return CountService.TotalElectrician
  } else if(ServiceCategory === "Househelp") {
    const househelpCount = await ServiceNumber.find({ _id: { $in: ['68983cd72eeb1b86bbff5d29', '686a3b1e37825f128c0675c9'] } });
    totalHousehelp = househelpCount[0].TotalHousehelp + 1;
    const CountService = await ServiceNumber.findOneAndUpdate( {_id: { $in: ['68983cd72eeb1b86bbff5d29', '686a3b1e37825f128c0675c9'] }}, { TotalHousehelp: totalHousehelp });
    return CountService.TotalHousehelp
  } else if(ServiceCategory === "Painter") {
    const painterCount = await ServiceNumber.find({ _id: { $in: ['68983cd72eeb1b86bbff5d29', '686a3b1e37825f128c0675c9'] } });
    totalPainter = painterCount[0].TotalPainter + 1;
    const CountService = await ServiceNumber.findOneAndUpdate( {_id: { $in: ['68983cd72eeb1b86bbff5d29', '686a3b1e37825f128c0675c9'] }}, { TotalPainter: totalPainter });
    return CountService.TotalPainter
  } else if(ServiceCategory === "Plumber") {
    const plumberCount = await ServiceNumber.find({ _id: { $in: ['68983cd72eeb1b86bbff5d29', '686a3b1e37825f128c0675c9'] } });
    totalPlumber = plumberCount[0].TotalPlumber + 1;
    const CountService = await ServiceNumber.findOneAndUpdate( {_id: { $in: ['68983cd72eeb1b86bbff5d29', '686a3b1e37825f128c0675c9'] }}, { TotalPlumber: totalPlumber });
    return CountService.TotalPlumber
  } else if(ServiceCategory === "Priest") {
    const priestCount = await ServiceNumber.find({ _id: { $in: ['68983cd72eeb1b86bbff5d29', '686a3b1e37825f128c0675c9'] } });
    totalPriest = priestCount[0].TotalPriest + 1;
    const CountService = await ServiceNumber.findOneAndUpdate( {_id: { $in: ['68983cd72eeb1b86bbff5d29', '686a3b1e37825f128c0675c9'] }}, { TotalPriest: totalPriest });
    return CountService.TotalPriest
  } else if(ServiceCategory === "Tutor") {
    const tutorCount = await ServiceNumber.find({ _id: { $in: ['68983cd72eeb1b86bbff5d29', '686a3b1e37825f128c0675c9'] } });
    totalTutor = tutorCount[0].TotalTutor + 1;
    const CountService = await ServiceNumber.findOneAndUpdate( {_id: { $in: ['68983cd72eeb1b86bbff5d29', '686a3b1e37825f128c0675c9'] }}, { TotalTutor: totalTutor});
    return CountService.TotalTutor
  }
}

//--------------------------------------Worker Details--------------------------------
// function to create new worker/shop 
export async function workerRegisterPost(req, res) {
  const jwtPresent = req.cookies?.UserToken;
  if (!jwtPresent) return res.status(401).send({ message: "Expired or Invalid Token, Please login again" });

  try {
    const currUserID = JWT.verify(jwtPresent, JWT_Secret).UserObjectID;
    const { ShopName, ShopDescription, ShopAddress, ShopCategory, Area, City, FullName, ShopEmail, ShopPhoneNumber, UserObjectID } = req.body;

    if (UserObjectID !== currUserID) return res.status(403).send({ message: "Invalid user ID" });

    console.log("=== workerRegisterPost called ===");
    console.log("req.body keys:", Object.keys(req.body || {}));
    console.log("preview req.body:", { ShopName, ShopAddress, ShopCategory, FullName, ShopEmail, ShopPhoneNumber, UserObjectID });
    console.log("req.files keys:", Object.keys(req.files || {}));
    // small preview of req.files shape
    try {
      const preview = Object.entries(req.files || {}).reduce((acc, [k, v]) => {
        if (!v) acc[k] = null;
        else if (Array.isArray(v)) acc[k] = `${v.length} files`;
        else acc[k] = { name: v.name, mimetype: v.mimetype, hasTemp: !!v.tempFilePath, hasPath: !!v.path };
        return acc;
      }, {});
      console.log("req.files preview:", preview);
    } catch (e) {
      console.log("Could not preview req.files", e);
    }

    // helper - pick first file if it's an array
    const pickFile = (x) => {
      if (!x) return null;
      return Array.isArray(x) ? x[0] : x;
    };

    const AadharFront = pickFile(req.files?.AadharFront);
    const AadharBack  = pickFile(req.files?.AadharBack);
    const PanCard     = pickFile(req.files?.PanCard);
    const ShopPhoto1  = pickFile(req.files?.ShopPhoto1);
    const ShopPhoto2  = pickFile(req.files?.ShopPhoto2);
    const ShopPhoto3  = pickFile(req.files?.ShopPhoto3);

    // Validate presence
    if (!AadharFront) return res.status(400).send({ message: "AadharFront file is missing" });
    if (!AadharBack)  return res.status(400).send({ message: "AadharBack file is missing" });
    if (!PanCard)     return res.status(400).send({ message: "PanCard file is missing" });
    if (!ShopPhoto1)  return res.status(400).send({ message: "ShopPhoto1 file is missing" });
    if (!ShopPhoto2)  return res.status(400).send({ message: "ShopPhoto2 file is missing" });
    if (!ShopPhoto3)  return res.status(400).send({ message: "ShopPhoto3 file is missing" });

    // ensure each file has a path we can upload
    const filesToCheck = { AadharFront, AadharBack, PanCard, ShopPhoto1, ShopPhoto2, ShopPhoto3 };
    for (const [key, file] of Object.entries(filesToCheck)) {
      const filePath = file.tempFilePath || file.path || file.filepath || null;
      if (!filePath) {
        console.error(`File ${key} missing tempFilePath/path. file object:`, file);
        return res.status(400).send({ message: `Uploaded file ${key} has no file path (tempFilePath/path). Ensure express-fileupload useTempFiles:true or multer producing a path.` });
      }
      if (!fs.existsSync(filePath)) {
        console.error(`File ${key} path does not exist on server:`, filePath);
        return res.status(400).send({ message: `Uploaded file ${key} not found on server at ${filePath}` });
      }
    }

    // upload helper that reports which file fails
    async function uploadSingle(file, folderName) {
      try {
        const pathToUpload = file.tempFilePath || file.path || file.filepath;
        const resourceType = (file.mimetype && file.mimetype.startsWith("video/")) ? "video" : "image";
        const result = await cloudinary.uploader.upload(pathToUpload, { folder: folderName, resource_type: resourceType });
        return result;
      } catch (err) {
        // rethrow with context
        err.message = `Cloudinary upload error for file ${file.name || "<unknown>"}: ${err.message}`;
        throw err;
      }
    }

    // upload all files with clear error handling
    const uploadFolder = `ProWork/${FullName || "unknown"}`;
    let uploaded;
    try {
      uploaded = await Promise.all([
        uploadSingle(AadharFront, uploadFolder),
        uploadSingle(AadharBack, uploadFolder),
        uploadSingle(PanCard, uploadFolder),
        uploadSingle(ShopPhoto1, uploadFolder),
        uploadSingle(ShopPhoto2, uploadFolder),
        uploadSingle(ShopPhoto3, uploadFolder)
      ]);
    } catch (uploadError) {
      console.error("Upload failure:", uploadError);
      return res.status(500).send({ message: "File upload failed", error: uploadError.message || uploadError });
    }

    const [uAadharFront, uAadharBack, uPanCard, uShop1, uShop2, uShop3] = uploaded;

    // ensure Area is array when saving (your schema expects Array)
    const normalizedArea = Array.isArray(Area) ? Area : (Area ? [Area] : []);

    // create the worker
    const savedWorker = await new Worker({
      AadharFront: uAadharFront.secure_url,
      AadharBack: uAadharBack.secure_url,
      PanCard: uPanCard.secure_url,
      ShopPhoto1: uShop1.secure_url,
      ShopPhoto2: uShop2.secure_url,
      ShopPhoto3: uShop3.secure_url,
      ShopName,
      ShopDescription,
      ShopAddress,
      ShopCategory,
      Area: normalizedArea,
      City,
      FullName,
      ShopEmail,
      ShopPhoneNumber,
      isWorker: true,
      UserObjectID
    }).save();

    await new WorkerMoney({ WorkerBalance: 0, UserObjectID, WorkerObjectID: savedWorker._id }).save();

    console.log("Worker saved:", savedWorker._id);
    return res.status(201).send(savedWorker);

  } catch (err) {
    console.error("Unhandled error in workerRegisterPost:", err.stack || err);
    return res.status(500).send({ message: "Error in adding worker", error: err.message || err });
  }
}

// function to send saved worker/shop details to frontend
export async function workerRegisterGet(req, res) {
  const jwtPresent = req.cookies?.UserToken
  if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
      
  try{
    const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
    const currWorker = await Worker.find({UserObjectID: currUserID});
    if(currWorker[0] == undefined) return res.status(204).send();
          
    console.log(`Worker details are sent successfully`);
    return res.status(200).send(currWorker)    
  } catch(error) {
    console.log("Worker details not found", error);
    return res.status(500).send({ message: "Worker details not found", error });
  }
}
// function to edit worker/shop details
// function to edit worker/shop details
export async function workerRegisterPatch(req, res) {
  const jwtPresent = req.cookies?.UserToken;
  if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
      
  try {
    const currUserID = JWT.verify(jwtPresent, JWT_Secret).UserObjectID;
    const { 
      ShopName, ShopDescription, ShopAddress, ShopCategory, Area, City, 
      FullName, ShopEmail, ShopPhoneNumber, UserObjectID 
    } = req.body;

    if (UserObjectID !== currUserID) return res.status(403).send({ message: "Invalid user ID" });

    // 1. Start with all the text-based fields
    const updateData = {
      ShopName, ShopDescription, ShopAddress, ShopCategory, Area, City,
      FullName, ShopEmail, ShopPhoneNumber
    };

    // 2. Check req.files and ONLY add image fields if a new file is uploaded
    if (req.files) {
      const uploadFolder = `ProWork/${FullName || "unknown"}`;

      // Helper to check and upload a file
      async function uploadIfPresent(fileKey, fieldName) {
        const file = pickFile(req.files[fileKey]); // Use your existing pickFile helper
        if (file) {
          if (!file.mimetype) {
            throw new Error(`${fileKey} file is invalid`);
          }
          const uploadResult = await uploadFileToCloudinary(file, uploadFolder);
          updateData[fieldName] = uploadResult.secure_url; // Add to updateData
        }
      }

      // 3. Run the helper for all 6 image fields
      // Using Promise.all to run uploads in parallel
      await Promise.all([
        uploadIfPresent('AadharFront', 'AadharFront'),
        uploadIfPresent('AadharBack', 'AadharBack'),
        uploadIfPresent('PanCard', 'PanCard'),
        uploadIfPresent('ShopPhoto1', 'ShopPhoto1'),
        uploadIfPresent('ShopPhoto2', 'ShopPhoto2'),
        uploadIfPresent('ShopPhoto3', 'ShopPhoto3')
      ]);
    }

    // 4. Perform the update with ONLY the fields that changed
    const updatedWorker = await Worker.findOneAndUpdate(
      { UserObjectID: UserObjectID }, 
      { $set: updateData }, // Use $set to apply the changes
      { new: true } // Return the updated document
    );
    
    if (!updatedWorker) {
      return res.status(404).send({ message: "Worker not found to update." });
    }

    console.log(`Worker updated successfully with Name ${updatedWorker.ShopName}`);        
    return res.status(201).send(updatedWorker);

  } catch(error) {
    console.log("Worker details not updated", error);
    // Send a more specific error if it was our validation
    if (error.message.includes("file is invalid")) {
      return res.status(400).send({ message: error.message });
    }
    return res.status(500).send({ message: "Worker details not edited", error: error.message || error });
  }
}


//--------------------------------------Sub Service and its Price Details--------------------------------
// function to create sub service and its price details
export async function ServicePost(req, res) {
  const jwtPresent = req.cookies?.UserToken;
  if (!jwtPresent) {
    return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
  }

  try {
    const currUserID = JWT.verify(jwtPresent, JWT_Secret).UserObjectID;
    const { UserObjectID, WorkerObjectID, FinalServiceFormData } = req.body;

    if (UserObjectID !== currUserID) {
      return res.status(403).send({ message: "Invalid user ID" });
    }

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

    // Save to MongoDB
    const savedWorkerService = await new WorkerService({
      Category,
      Services: servicesWithOvercharges,
      isService: true,
      UserObjectID,
      WorkerObjectID
    }).save();

    // Count the new service category registration
    const findWorker = await Worker.find({ _id: WorkerObjectID });
    await CountService({ ServiceCategory: findWorker[0].ShopCategory });

    // Update worker profile
    const addedService = await Worker.findOneAndUpdate(
      { _id: WorkerObjectID },
      { isService: true },
      { new: true }
    );

    // Add to Algolia
    const Algoliaresponse = await algoliaClient.addOrUpdateObject({
      indexName: 'Production_Worker',
      objectID: addedService._id,
      body: {
        ShopPhoto1: addedService.ShopPhoto1,
        ShopName: addedService.ShopName,
        Area: addedService.Area,
        ShopCategory: addedService.ShopCategory
      }
    });

    if (Algoliaresponse.objectID) {
      console.log(`New worker added to Algolia successfully`);
    } else {
      console.log("Error in adding new worker to Algolia");
    }

    console.log("Services added successfully");
    return res.status(201).send(savedWorkerService);
  } catch (error) {
    console.error("Error in adding services, try again", error);
    return res.status(500).send({ message: "Error in adding service", error });
  }
}

// function to send saved sub category details to frontend to its owner
export async function ServiceGet(req, res) {
  const jwtPresent = req.cookies?.UserToken
  if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
      
  try{
    const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
    const workerService = await WorkerService.find({ UserObjectID: currUserID });  
    if (workerService[0] == undefined) return res.status(204).send();
    
    console.log('Worker service sent successfully');
    return res.status(200).send(workerService);
  } catch (error) {
    console.log("Error in fetching services, try again", error);
    return res.status(500).send({ message: "Error in fetching services, try again", error });
  }
}

export async function ReviewPost(req, res) {
  const jwtPresent = req.cookies?.UserToken
  if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
      
  try{
    const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
    const { StarRating, TextReview } = req.body.LocalReviewFormData;
    const { WorkerObjectID, UserObjectID } = req.body;
    if (UserObjectID !== currUserID) return res.status(403).send({ message: "Invalid user ID" });

    const isBookingDone = await UserBooking.find({ UserObjectID: UserObjectID, WorkerObjectID: WorkerObjectID })
    if (isBookingDone[0] == undefined) return res.status(204).send();
    
    const isReviewDone = await WorkerReview.find({ UserObjectID: UserObjectID, WorkerObjectID: WorkerObjectID })
    if (isReviewDone[0] != undefined) return res.status(200).send({ message: "review is already present" });
      
    const savedReviewAdded = await new WorkerReview({ StarRating, TextReview, UserObjectID, WorkerObjectID }).save();
      
    console.log(`Worker review added successfully`);
    return res.status(201).send(savedReviewAdded);
  } catch (error) {
    console.log("Error in adding worker review", error);
    return res.status(500).send({ message: "Error in adding worker review", error });
  }
}
export async function ReviewGet(req, res) {
  try{
    const { id } = req.params;
    const workerReviews = await WorkerReview.find({WorkerObjectID: id});
    if(workerReviews[0] == undefined) return res.status(204).send();
    
    console.log('Worker all reviews sent successfully');
    return res.status(200).send(workerReviews)
  } catch (error) {
    console.log("Error in fetching worker review", error);
    res.status(500).send({ message: "Error in fetching worker review", error });
  }
}



// function to send details of person who booked this worker for service
export async function MyWorkGet(req, res){
  const jwtPresent = req.cookies?.UserToken
  if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
      
  try{
    const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
    const findWorker = await Worker.find({UserObjectID: currUserID});
    if(findWorker[0] == undefined) return res.status(204).send();
    
    const WorkBooking = await UserBooking.find({WorkerObjectID: findWorker[0]._id}).sort({ BookingDateTime: -1 });
    if(WorkBooking[0] == undefined) return res.status(204).send();
      
    console.log('work booking details sent successfully');
    return res.status(200).send(WorkBooking)      
  } catch (error) {
    console.log("Error in fetching work bookings", error);
    return res.status(500).send({ message: "Error in fetching work bookings", error });
  }
}

//--------------------------------------Worker and Sub Service Details for user viewing (Category and Book Service Page)--------------------------------

// We don't need JWT to view a work profile in service pages, user can see worker profile 
export async function WorkerView(req, res){ 
  try{
    const { ShopCategory } = req.body;
    const selectedCategory = await Worker.find({ ShopCategory: ShopCategory, isService: true });
    if (selectedCategory[0] == undefined) return res.status(204).send();
        
    // This is a Fisher-Yates shuffle algorithm
    const shuffledWorkers = shuffleArray(selectedCategory);
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    return res.status(200).send(shuffledWorkers);
  } catch (error) {
    console.log("Error in fetching category details", error);
    return res.status(500).send({ message: "Error in fetching category details", error });
  } 
}

export async function OneWorkerView(req, res){
  try {
    const { id } = req.params;
    console.log('OneWorkerView called with id =', id);
    const selectedWorker = await Worker.find({ _id: id });
    console.log('Worker.find returned length =', selectedWorker.length);
    if (!selectedWorker[0]) return res.status(404).send({ message: "Worker not found with this ID" });
    return res.status(200).send(selectedWorker);
  } catch (error) {
    console.log("Error in fetching selected worker details", error);
    res.status(500).send({ message: "Error in fetching selected worker details", error });
  }
}

export async function OneWorkerServiceView(req, res){
  try{
    const { id } = req.params;
    const selectedWorkerService = await WorkerService.find({ WorkerObjectID: id });
    if (selectedWorkerService[0] == undefined) return res.status(404).send({ message: "Worker service found with this ID" });
    
    console.log('Selected worker service sent successfully');
    return res.status(200).send(selectedWorkerService);
  } catch (error) {
    console.log("Error in fetching selected worker service", error);
    return res.status(500).send({ message: "Error in fetching selected worker service", error });
  }
}


// count the numbers of workers registered with each category
export async function CategoryNumber(req, res){
  
  // uncomment the following line to make worker count whatever you want
  // const counting = await CountService({ ServiceCategory: 'Beautician' });j
  // uncomment the following line to make worker count zero
  // const newShopServiceAdded = await ServiceNumber.findOneAndUpdate({_id:'68983cd72eeb1b86bbff5d29'}, {TotalBeautician: 0, TotalCarpenter: 1, TotalElectrician: 5, TotalHousehelp: 1, TotalPainter: 11, TotalPlumber: 1, TotalPriest: 1, TotalTutor: 2})

  // const newReviewAdded = new ServiceNumber({TotalBeautician: 0, TotalCarpenter: 0, TotalElectrician: 0, TotalHousehelp: 0, TotalPainter: 0, TotalPlumber: 0, TotalPriest: 0, TotalTutor: 0})
  // const savedReviewAdded = await newReviewAdded.save();
 
  try {
    // const CountedService = await ServiceNumber.find( {_id:'676f6cedbb041cabc515e798'} ) production
    const CountedService = await ServiceNumber.find({ _id: { $in: ['68983cd72eeb1b86bbff5d29', '686a3b1e37825f128c0675c9'] } });
    if (CountedService[0] == undefined) return res.status(204).send();
    
    return res.status(200).send(CountedService);
  } catch (error) {
    console.log("Error in fetching number of worker", error);
    return res.status(500).send({ message: "Error in fetching number of worker", error }); 
  }
}


export async function workerBankPost(req, res){
  const jwtPresent = req.cookies?.UserToken
  if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
      
  try{
    const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
    const { AccountHolderName, BankName, AccountNumber, AccountIFSC_code } = req.body.BankFormData
    const { UserObjectID, WorkerObjectID } = req.body
    if (UserObjectID !== currUserID) return res.status(403).send({ message: "Invalid user ID" });

    const savedBank = await new WorkerBank({ AccountHolderName, BankName, AccountNumber, AccountIFSC_code, isBank: true, UserObjectID, WorkerObjectID }).save();
      
    console.log('Worker bank details added successfully');
    return res.status(201).send(savedBank);
  } catch (error) {
    console.log("Error in adding worker bank details", error);
    return res.status(500).send({ message: "Error in adding worker bank details", error });
  }
  
}
export async function workerBankGet(req, res){
  const jwtPresent = req.cookies?.UserToken
  if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
      
  try{
    const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
    const findWorker = await Worker.find({UserObjectID: currUserID});

    // console.log(findWorker)
    const workerBank = await WorkerBank.find( {WorkerObjectID:findWorker[0]._id} )  
    if(workerBank[0] == undefined) return res.status(204).send();
            
    console.log('Worker bank details sent successfully');
    return res.status(200).send(workerBank);
  } catch(error){
    console.log("Error in fetching worker bank details, Please try again", error);
    return res.status(500).send({ message: "Error in fetching worker bank details, Please try again", error });
  }
}

export async function WorkerWidthdrawalPost(req, res){
  const jwtPresent = req.cookies?.UserToken
  if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
      
  try{
    const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
    const { BankName, AccountNumber } = JSON.parse(req.body.selectedBank)
    const { amount, UserObjectID, WorkerObjectID } = req.body
    if (UserObjectID !== currUserID) return res.status(403).send({ message: "Invalid user ID" });

    const workerWidthdrawal = new WorkerWidthdrawal({ WidthrawalBalance: amount, WidthrawalStatus: 'success', BankName, AccountNumber, UserObjectID, WorkerObjectID }).save();

    console.log('Worker widthdrawal details added successfully');
    return res.status(201).send(workerWidthdrawal);
  } catch(error){
    console.log("Error in Saving Widthrawal details", error);
    return res.status(500).send({ message: "Error in Saving Widthrawal details", error });
  }
}
export async function WorkerWidthdrawalGet(req, res){
  const jwtPresent = req.cookies?.UserToken
  if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
      
  try{
    const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
    const findWorker = await Worker.find({UserObjectID: currUserID });

    const workerWidthdrawal = await WorkerWidthdrawal.find( {WorkerObjectID:findWorker[0]._id} )  

    console.log('Worker widthdrawal data sent successfully');
    return res.status(200).send(workerWidthdrawal); 
  } catch (error){
    console.log("Error in fetching Worker Widthdrawal Details, Please Login", error);
    return res.status(500).send({ message: "Error in fetching Worker Widthdrawal Details, Please Login", error });
  }
  
}

export async function WorkerBalanceGet(req, res){
  const jwtPresent = req.cookies?.UserToken
  if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
      
  try{
    const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
    const findWorker = await Worker.find({UserObjectID: currUserID});

    const workerBalance = await WorkerMoney.find( {WorkerObjectID:findWorker[0]._id} )  

    console.log('Worker current balance sent successfully');
    return res.status(200).send(workerBalance); 
  } catch (error){
    console.log("Error in fetching Worker balance Details, Please Login", error);
    return res.status(500).send({ message: "Error in fetching Worker balance Details, Please Login", error });
  }
}
export async function WorkerBalancePatch(req, res){
 const jwtPresent = req.cookies?.UserToken
  if (!jwtPresent) return res.status(401).send({ message: 'Expired or Invalid Token, Please login again' });
      
  try{
    const currUserID = JWT.verify( jwtPresent, JWT_Secret ).UserObjectID;
    const WorkerBalance = req.body.updatedBalance;
    const updatedWorkerBalance = await WorkerMoney.findOneAndUpdate({UserObjectID: currUserID}, { WorkerBalance: WorkerBalance }); 

    console.log('Worker balance updated successfully');
    return res.status(201).send(updatedWorkerBalance);
  } catch(error) {
    console.log("Worker Balance not Edited", error);
    return res.status(500).send({ message: "Worker Balance not Edited", error });
  }
}