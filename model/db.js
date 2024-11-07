import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
//Get the connection string from the environment variables
const connectionString = process.env.CONNECTION_STRING;
//Initializing the client object
const client = new pg.Client({
    connectionString : connectionString
});
//Initialization of database
//This will be called in the index.js
function initDatabase(){
    client.connect().then(()=>{
        console.log('Connected to the database');
    }).catch(err=>{
        console.log('Connection error', err.stack);
    });
}


export default {
    initDatabase,
    client
}