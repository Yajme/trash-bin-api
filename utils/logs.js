import firebase from "../controllers/firebase.js";
import { getCurrentDate } from "./date.js";
import dotenv from 'dotenv';
dotenv.config();
const isProd = process.env.PRODUCTION;
const logEvent = async (fields)=>{
    const env = isProd === 'true' ? 'production' : isProd === 'false' ? 'development' : 'undefined';
    const field = {
        environment : env,
        error : {
            message : fields.message,
            stack : fields.stack
        },
        identifiers : {
            ...fields.data
        },
        message: fields.message,
        timestamp : getCurrentDate().toDate()
    }

    await firebase.setDocument('logs',field);
}

export {
    logEvent
}
