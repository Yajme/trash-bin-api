import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './model/db.js';
import user from './routes/user.js';

dotenv.config();
const app = express();

app.use(cors());                        // Enable CORS
app.use(express.json());                 // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form bodies

//Initialization of Database
db.initDatabase();

app.use('/user',user);



const PORT = process.env.PORT;
const isProd = process.env.PRODUCTION;
app.listen(PORT,()=>{
    const message = isProd === 'true' ? 'Server is running on port: ' + PORT : `Server is now listening to http://localhost:${PORT}`;
    console.log(message);
})