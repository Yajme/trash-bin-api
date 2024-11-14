import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './model/db.js';
import user from './routes/user.js';
import waste from './routes/waste.js';
import transaction from './routes/transaction.js';
import firebase from './controllers/firebase.js';
import { getCurrentDate } from './utils/date.js';
import { logEvent } from './utils/logs.js';
dotenv.config();
const app = express();

app.use(cors());                        // Enable CORS
app.use(express.json());                 // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form bodies

//Initialization of Database
db.initDatabase();
firebase.initializeFirebase();
app.use('/user',user);
app.use('/waste',waste);
app.use('/transaction',transaction);
// Prevent the error by responding to /favicon.ico requests with an empty response
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/',(req,res,next)=>{
res.json({message : "API UP"});
});
app.get('/time',(req,res,next)=>{
    const date = getCurrentDate().toDate();
    res.json({
        dateobj : date,
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
        timezone: 'Asia/Manila'
    });
});
//catches non existent url
app.get('*', (req, res, next) => {
    const requestedURL = req.url;
    const error = new Error('Wrong URL ' + requestedURL + " is not existent");
    error.status = 404; // You can set the status to 404 or any other appropriate status code.
    
    next(error); // Pass the error to the error-handling middleware.
});

app.use((err, req, res, next) => {  
    logEvent({

            message : err.message,
            stack : err.stack,

       data: {
            ...err.data }


    })
    res.status(err.status || 500).json({
        message: err.message, 
        stack: isProd ==='false' ? err.stack : undefined,
        status: err.status
    });
});

const PORT = process.env.PORT;
const isProd = process.env.PRODUCTION;
app.listen(PORT,()=>{
    const message = isProd === 'true' ? 'Server is running on port: ' + PORT : `Server is now listening to http://localhost:${PORT}`;
    console.log(message);
})