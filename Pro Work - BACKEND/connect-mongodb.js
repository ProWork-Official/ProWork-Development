import mongoose from 'mongoose';

const MongoDevURL = process.env.MONGO_ATLAS_DEV_URL;
const MongoProductionURL = process.env.MONGO_ATLAS_PRODUCTION_URL;

const connectMongoDB = async () =>{
    await mongoose.connect(MongoProductionURL)
    .then(() => { 
        console.log("Pro Work Production Server has been Connected from MongoDB Atlas Successfully");
    })
    .catch((error) =>{ 
        console.log("Error Connecting to MongoDB Atlas Server \n", error);
        process.exit(1);
    })
}

export default connectMongoDB