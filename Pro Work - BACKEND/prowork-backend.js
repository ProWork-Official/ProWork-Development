// Importing required modules form external packages
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';



// Importing required modules from local files
import connectMongoDB from './connect-mongodb.js';
import cloudinaryConnect from './connect-cloudinary.js';

// Importing required modules from routes directory (controllers and routes)
import userRouter from './routes/User.js';
import workerRouter from './routes/Worker.js'
import paymentRouter from './routes/Payment.js'
import callRouter from './routes/Call.js'
import otpRouter from './routes/OTP.js';
import AdminRouter from './routes/Admin.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const proworkBackend = express();
const Port = process.env.PORT;

// Applying middleware to the server
proworkBackend.use(cors({ origin: [ 'http://localhost:4000', 'http://prowork.org.in', 'https://prowork.org.in'], methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization', 'params'],  credentials: true }));
proworkBackend.use(cookieParser());
proworkBackend.use(express.json());
proworkBackend.use(express.urlencoded({ extended: true }));
proworkBackend.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp' }));

// Serve static files from the "assets" folder
proworkBackend.use('/assets', express.static(path.join(__dirname, 'assets')));
proworkBackend.use('/seo', express.static(path.join(__dirname, 'public/seo')));

// Serve sitemap.xml as static file
proworkBackend.use('/sitemap.xml', express.static(path.join(__dirname, 'public', 'sitemap.xml')));
proworkBackend.use('/robots.txt', express.static(path.join(__dirname, 'public', 'robots.txt')));



main()
async function main(){ 
    connectMongoDB();
    cloudinaryConnect();
}

proworkBackend.listen(Port, () =>{ 
    console.log(`Pro Work Production server is running on Port number ${Port}`) 
});

proworkBackend.get('/', ( req, res ) =>{ 
    console.log("This is the official backend server route of prowork.org.in web application");
    res.status(200).json("This is the official backend server route of prowork.org.in web application");
})


// Routing for different API endpoints
proworkBackend.use('/user', userRouter);
proworkBackend.use('/worker', workerRouter);
proworkBackend.use('/payment', paymentRouter);
proworkBackend.use('/call', callRouter);
proworkBackend.use('/otp', otpRouter);
proworkBackend.use('/ayush-admin', AdminRouter);






