import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './model/db.js';
import user from './routes/user.js';
import waste from './routes/waste.js';
import firebase from './controllers/firebase.js';

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
app.get('/',(req,res,next)=>{
res.json({message : "API UP"});
});

//catches non existent url
app.get('*', (req, res, next) => {
    const requestedURL = req.url;
    const error = new Error('Wrong URL ' + requestedURL + " is not existent");
    error.status = 404; // You can set the status to 404 or any other appropriate status code.
    
    next(error); // Pass the error to the error-handling middleware.
});

app.use((err, req, res, next) => {  
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