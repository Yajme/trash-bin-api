import firebase from "./firebase.js";
import { connection } from "../model/db.js";
import { PointRedemptions, Transaction,Transactions } from "../model/transaction.js";
import { getCurrentDate } from "../utils/date.js";
import { UserError } from "../utils/errors.js";
import generate from '../utils/generate.js';
const collection_name = {
    points : 'points',
    points_redemptions : 'points_redemptions'
}
const selectedField = {
    points : ['created_at','current_points','modified_at','user','first_name','last_name'],
    points_redemptions : ['created_at','points','reference_number','user','first_name','last_name']
}
//Redeem Points here
const RedeemPoints = async (req,res,next)=>{
    try{
        const user_id = req.body.user_id;
        const amount = Number(req.body.amount);
        
        //Authenticate User
       
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
        const user_information = await firebase.getDocumentByParam('user_information',userConstraint,['id']);
        const id = user_information[0].id;
        const userInfoRef = await firebase.createDocumentReference('user_information',id);
        const userInfoConstraint = firebase.createConstraint('user','==',userInfoRef);
         //Let's Check if modified_at is a latest

         
        const getPoints = await firebase.getDocumentByParam(collection_name.points,userInfoConstraint,['current_points']);
        const current_points = Number(getPoints[0].current_points);
        console.log(getPoints);
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
            user: userInfoRef,
            reference_number : reference_number
        }

        const redeemPoints = await firebase.setDocument(collection_name.points_redemptions,setData);
        
        //update points
        

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

        

        res.locals.data={
            message : 'Points redemption complete',
            amount : amount,
            reference_number : reference_number
        }
        next();
    }catch(error){
        next(error);
    }
}
const response = async (req,res,next)=>{
    try{
        const data = res.locals.data;
        if(!data) return res.status(404).json({message : "No Data Found"});
        res.status(200).json(data);
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

const getTransactionRecords = async(req,res,next)=>{
    try{
        const {user_id,filter} = req.query;

        if (!user_id || (!filter && (filter !== 'individual' && filter !== 'all')))  throw new UserError('Invalid Request',400,{query : 'Requested for transaction records but did not provide a proper query'});
        const user = await firebase.getDocumentById('users',user_id);
        if(user === null || user === undefined) throw new UserError('User not found',404,{query: 'Requested for transaction records but provided invalid user', user_id: user_id});
        //If filter is all check if user is an admin
        if(filter === 'all' && user.role !== 'admin') throw new UserError('Invalid Request',401,{query: 'Requested for all transaction records but is not an admin', user: user});
        let transactions = [];
        if(filter == 'individual'){
            const userRef = await firebase.createDocumentReference('users',user_id);
            const userConstraint = firebase.createConstraint('user','==',userRef);
            const user_information = await firebase.getDocumentByParam('user_information',userConstraint,['id']);
            const id = user_information[0].id;
    
            const userInfoRef = await firebase.createDocumentReference('user_information',id);
            const userInfoConstraint = firebase.createConstraint('user','==',userInfoRef);
            transactions = await firebase.getDocumentByParam(collection_name.points_redemptions,userInfoConstraint,selectedField.points_redemptions);
        }
        
        if(filter =='all')
        {
            transactions = await firebase.getDocuments(collection_name.points_redemptions,selectedField.points_redemptions);
        }
        if(transactions.length === 0) throw new UserError('No Records Found',404,{query:"Requested for records of transactions",filter: filter, user_id : user_id});
        //console.log(transactions);
        let points = [];
        for(const point of transactions){
            points.push(PointRedemptions.createFromObject(point));
        }
        
        res.status(200).json(points);
    }catch(error){
        next(error);
    }
}
export default {
    RedeemPoints,
    TransferPoints,
    getTransactionRecords,
    response
}