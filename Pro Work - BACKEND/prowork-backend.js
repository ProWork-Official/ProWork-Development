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
import adminUserRoutes from './routes/adminUserRoutes.js';
import contactRoutes from './routes/Contact.js';

import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const proworkBackend = express();
const Port = process.env.PORT;

// Applying middleware to the server
proworkBackend.use(cors({
    origin: [ 
        'http://localhost:4000',
        'http://localhost:4001',
        'http://localhost:5173',
        'http://192.168.1.4:4001',
        'http://localhost:4005', 
        'http://prowork.org.in', 
        'https://prowork.org.in'
    ], 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'params', 'x-admin-key'],
    credentials: true }));
proworkBackend.use(cookieParser());
proworkBackend.use(express.json());
proworkBackend.use(express.urlencoded({ extended: true }));
// Use OS-specific temp directory to store uploads (works on Windows/macOS/Linux)
const uploadTmpDir = path.join(os.tmpdir(), 'prowork-upload-temp');
try { fs.mkdirSync(uploadTmpDir, { recursive: true }); } catch (e) { console.error('Failed to create upload temp dir:', uploadTmpDir, e); }
proworkBackend.use(fileUpload({ useTempFiles: true, tempFileDir: uploadTmpDir }));

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
proworkBackend.use('/ayush-admin/users', adminUserRoutes);
proworkBackend.use('/contact', contactRoutes);






