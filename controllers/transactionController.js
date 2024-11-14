import firebase from "./firebase.js";
import { connection } from "../model/db.js";
import { Transaction,Transactions } from "../model/transaction.js";
import { getCurrentDate } from "../utils/date.js";
import generate from '../utils/generate.js';
const collection_name = {
    points : 'points',
    points_redemptions : 'points_redemptions'
}

//Redeem Points here
const RedeemPoints = async (req,res,next)=>{
    try{
        const {user_id, amount} = req.body;
        //Authenticate User
        //const userConstraint = 
        const user = await firebase.getDocumentById('users',user_id,['role','id']);
        console.log(user);
        if(user == null) {
            const err = new Error('User not found');
            err.status=404;
            throw err;
        }

        if(user.role !== 'user'){
            const err = new Error('Invalid request');
            err.status=400;
            throw err;
        }

        //Check the current points of the user
        const userRef = await firebase.createDocumentReference('users',user_id);
        const userConstraint = firebase.createConstraint('user','==',userRef);
        
        const getPoints = await firebase.getDocumentByParam(collection_name.points,userConstraint,['current_points']);
        const current_points = getPoints[0].current_points;

        if(current_points < amount){
            const err = new Error('Current points insufficient');
            err.status = 400;
            throw err;
        }

        //Check if cash ledger have sufficient amount
        const query = "SELECT * FROM cash_ledger";
        const response = await connection.query(query);
        if(response.rowCount < 1) {
            const err = new Error('Something went wrong, please contact the developer');
            err.status=500;
            throw err;
        }
        const cash_ledger = response.rows;
        let transactions = [];
        for(const transaction of cash_ledger){
            transactions.push(Transaction.createFromObject(transaction));
        }
        transactions = new Transactions(transactions);
        //console.log(transactions.transaction[transactions.transaction.length-1]);
        if(transactions.transaction[transactions.transaction.length-1].balance < amount){
            const err = new Error('Cannot redeem points, please contact your local administrator');
            err.status = 500;
            throw err;
        }

        //Insert to points_redemption
        const reference_number =  generate.generateRandomNumber(1000);
        const setData = {
            created_at : getCurrentDate().toDate(),
            points: amount,
            user: userRef,
            reference_number : reference_number
        }

        const redeemPoints = await firebase.setDocument(collection_name.points_redemptions,setData);
        
        //Insert to cash ledger here
        try{
            const cash_data = Transaction.createForInsert({
                type: 'credit',
                reference_id: redeemPoints,
                amount: amount,
                balance: Number(transactions.transaction[transactions.transaction.length-1].balance) - Number(amount),
                description: 'Points redemption by user',
                created_at: getCurrentDate()
            });
            const current_transaction = transactions.createTransaction(cash_data, connection);
        }catch(error){
            //Rollbacks
            await firebase.deleteDocument(collection_name.points_redemptions,redeemPoints);
        }
        

        res.status(201).json({
            message : 'Points redemption complete',
            amount : amount,
            reference_number : reference_number
        });
    }catch(error){
        next(error);
    }
}

//Transfer Points to another account 
const TransferPoints = async (req,res,next)=>{
    try{
        //TBD
        const {user_id,destination} = req.body;
    }catch(error){
        next(error);
    }

}

export default {
    RedeemPoints,
    TransferPoints
}