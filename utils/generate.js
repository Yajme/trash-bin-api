import { getCurrentDate } from './date.js';

const generateRandomNumber = (length=10000)=>{
    const date = getCurrentDate();
    const randomNumber = Math.floor(Math.random() * length);
    const referenceNumber = Math.floor((date.toDate().getTime() + randomNumber) / 2);

    return referenceNumber;
}

const generateRandomID = (length=100) =>{
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomID = '';
    for (let i = 0; i < length; i++) {
        randomID += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomID;
}

export default{
    generateRandomNumber,
    generateRandomID
}