import { getCurrentDate } from './date.js';

const generateRandomNumber = (length=10000)=>{
    const date = getCurrentDate();
    const randomNumber = Math.floor(Math.random() * length);
    const referenceNumber = Math.floor((date.toDate().getTime() + randomNumber) / 2);

    return referenceNumber;
}



export default{
    generateRandomNumber,
}