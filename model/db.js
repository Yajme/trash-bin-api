import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
//Get the connection string from the environment variables
const connectionString = process.env.CONNECTION_STRING;
//Initializing the client object
export const connection = new pg.Client({
    connectionString : connectionString
});
//Initialization of database
//This will be called in the index.js
function initDatabase(){
    connection.connect().then(()=>{
        console.log('Connected to the database');
    }).catch(err=>{
        console.log('Connection error', err.stack);
    });
}


export default {
    initDatabase,
    connection
}

