import firebase from "./firebase.js";
import { Waste } from "../model/waste.js";
import generate from "../utils/generate.js";
import { getCurrentDate } from "../utils/date.js";
import { UserError } from "../utils/errors.js";
import { connection } from "../model/db.js";
import QRCode from "../model/qrcode.js";
const collection_name = 'waste';
const wasteSelectedFields = [
    'category',
    'created_at',
    'points',
    'weight',
    'user_id',
    'user',
    'first_name',
    'last_name'
];


const currentPoints = async (req,res,next)=>{
    try{
        let currentPoints = 0;
        //check the redeemed points here
        const userConstraint = firebase.createConstraint('user','==',res.locals.userRef);
        const getUserInfo = await firebase.getDocumentByParam('user_information',userConstraint,['id']);
        const id = getUserInfo[0].id;
        const userInfoRef = await firebase.createDocumentReference('user_information',id);
        const userInfoConstraint = firebase.createConstraint('user','==',userInfoRef);
        
        const pointsCollected = await firebase.getDocumentByParam('points_redemptions',userInfoConstraint,['created_at','points',]);
        let points = 0;
        for(const point of pointsCollected){
            points += Number(point.points);

        }
        for(const record of res.locals.records){
            currentPoints += Number(record.points) ?? 0;
        }
        res.locals.data.current_points = currentPoints - points;
        res.locals.data.current_points = Number(res.locals.data.current_points.toFixed(2));
        //get the points doc id here
        const stored_points = await firebase.getDocumentByParam("points",userInfoConstraint,['id']);
        //Set the current points to database
        const setData = {
            current_points : res.locals.data.current_points,
            modified_at : new Date()
        }

        const update_points = await firebase.updateData('points',setData,stored_points[0].id);
        if(!update_points) throw new Error('Something went wrong please try again later');
        next();
    }catch(error){
        next(error);
    }
}

const recentPoint = async(req,res,next)=>{
    try{
        const latestPoints = res.locals.records.reduce((latest,current)=>{
            return current.date > latest.date ? current : latest;
        }).points;
        res.locals.data.recent_points = Number(latestPoints) ?? 0;
        next();
    }catch(error){
        next(error);
    }
}

const largestPoint = async (req,res,next)=>{
    try{
        const largestPoints = res.locals.records.reduce((max, current) => {
            return current.points > max.points ? current : max;
          }).points;
          res.locals.data.largest_point = Number(largestPoints) ?? 0;
          next();
    }catch(error){
        next(error);
    }
}

const largestCategory = async (req,res,next)=>{
    try{
// Step 1: Sum points by category
const categorySums = res.locals.records.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.points;
    return acc;
  }, {});
  
  // Step 2: Find the category with the largest total points
  const largestCategory = Object.keys(categorySums).reduce((max, category) => {
    return categorySums[category] > categorySums[max] ? category : max;
  });

  res.locals.data.largest_category = largestCategory;
  next();
    }catch(error){
        next(error);
    }
}
const dashboardData = async (req,res,next)=>{
    try{
        //Needed data:
        //Current Points of the user
        //Recent Points acquired by the user
        //Largest category obtained 
        //Largest Amount obtained
       
        const user_id = req.query.user_id ?? req.body.user_id;

        console.log(user_id);
        if(!user_id || user_id == null) return res.status(404).json({message : "Missing argument"});
        const userRef = await firebase.createDocumentReference('users',user_id);
        res.locals.userRef = userRef;
        const userConstraint = firebase.createConstraint('user','==',userRef);
        const getUserInformation = await firebase.getDocumentByParam('user_information',userConstraint,['id']);
        const userInfoRef = await firebase.createDocumentReference('user_information',getUserInformation[0].id);
        const userInfoConstraint = firebase.createConstraint('user','==',userInfoRef);
        const wasteRecords = await firebase.getDocumentByParam(collection_name,userInfoConstraint,wasteSelectedFields);
        if(wasteRecords.length === 0) 
            return res.json({
        message : "No Record Found",
       ...res.locals.data
        });
        let records = [];
        //console.log(wasteRecords);
        for(const record of wasteRecords){
            records.push(Waste.createWithObject(record));
        }
        res.locals.records = records;
        res.locals.data = {
            user_id : user_id,
            timestamp : new Date(),
            largest_category: "",
            largest_point: 0,
            recent_points: 0,
            current_points: 0
        };
        //console.log(records);
        next();
        
    }catch(error){
        next(error);
    }
} 
const wasteRecordsAll = async (req,res,next)=>{
    try{
        const {user_id} = req.query;
        
        //check first if user is valid and registered to the database
        const user = await firebase.getDocumentById('users',user_id);
        if(user === null){
            const err = new Error('User not found');
            err.status = 404;
            err.data = {
                user_id : user_id,
                query : 'Requested for all records of waste converted to points by user'
            };
            throw err;
        }
        if(user.role !== 'admin'){
            const err = new Error('Invalid Request');
            err.status = 401;
            err.data = {
                user_id : user_id,
                query : 'Requested for all records of waste converted to points by user but not an admin'
            };
            throw err;
        }
        const getRecords = await firebase.getDocuments(collection_name,wasteSelectedFields);
        console.log(getRecords);
        if(getRecords.length === 0){
            const err = new Error('No record found');
            err.status = 404;
            err.data = {
                user_id : user_id,
                query : 'Requested for all records of waste converted to points by user'
            };
            throw err;
        }
        let records = [];
        for(const record of getRecords){
            records.push(Waste.createWithObject(record));
        }
        res.status(200).json(records);
    }catch(error){
        next(error);
    }
}
const wasteRecords = async (req,res,next)=>{
    try{
        const {user_id} = req.query;
        //check first if user is valid and registered to the database
        const user = await firebase.getDocumentById('users',user_id);
        if(user === null){
            const err = new Error('User not found');
            err.status = 404;
            err.data = {
                user_id : user_id,
                query : 'Requested for all records of waste converted to points by user'
            };
            throw err;
        }
        const userRef = await firebase.createDocumentReference('users',user_id);
        const userConstraint = firebase.createConstraint('user','==',userRef);
        const user_information = await firebase.getDocumentByParam('user_information',userConstraint,['id']);
        const id = user_information[0].id;
        const userInfoRef = await firebase.createDocumentReference('user_information',id);
        const userInfoConstraint = firebase.createConstraint('user','==',userInfoRef);
        const getRecords = await firebase.getDocumentByParam(collection_name,userInfoConstraint,wasteSelectedFields);
        if(getRecords.length === 0){
            const err = new Error('No record found');
            err.status = 404;
            err.data = {
                user_id : user_id,
                query : 'Requested for all records of waste converted to points by user'
            };
            throw err;
        }
        let records = [];
        for(const record of getRecords){
            records.push(Waste.createWithObject(record));
        }
        res.status(200).json(records);
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
        console.log(error);
        next(error);
    }
}
const generateWasteId = async (req,res,next)=>{
    try{
        const id = generate.generateRandomID(256);
        //Persist
        const setData = {
            code : id,
            scanned: false,
            created_at : getCurrentDate().toDate()
        }
        const setQrCode = await firebase.setDocument('qrcode',setData);
        res.json({message : "QR successfully generated", qrcode: id, qr_code_id : setQrCode});
    }catch(error){
        error.data = {
            query: "User wants to generate qr code but something went wrong"
        };
        next(error);
    }
}
const scanQrCode = async (req,res,next)=>{
    try {
        const qrcode = req.query.qrcode;
        const user_id = req.query.user_id;
        if(!qrcode) throw new UserError('Invalid QR Code',402,{query: "Routed here but no qrcode provided"});
        if(!user_id) throw new UserError('Invalid User ID',402,{query: "Provided a qrcode but no user ID"});
        const qrcodeContraint = firebase.createConstraint('code','==',qrcode);
        const getQrCodeID = await firebase.getDocumentByParam('qrcode',qrcodeContraint,['id']);
        if(getQrCodeID.length ===0) throw new UserError('QR not found',404,{query : "QR scanned by user but not found in the database",qrcode : qrcode});
        if(getQrCodeID[0].scanned === true || getQrCodeID[0].scanned===null){
            console.log(getQrCodeID[0].scanned);
            throw new UserError('QR Already Scanned please generate new QR Code',402,{query:" User attempted to scan a QR Code that has been already scanned"});
        }
        const id = getQrCodeID[0].id;
        const userRef = await firebase.createDocumentReference('users',user_id);
        const userConstraint = firebase.createConstraint('user','==',userRef);

        const getUserInformation = await firebase.getDocumentByParam('user_information',userConstraint,['id']);
        const userInfoRef = await firebase.createDocumentReference('user_informtion',getUserInformation[0].id);

        const setData = { 
            scanned : true,
            user : userInfoRef
        }
        const update = await firebase.updateData('qrcode',setData,id);
        if(!update) throw new UserError('Something went wrong please try again',500,{query : "Tried to update scanned field but did not work for some reason"});
        setData.qrcode = qrcode;
        setData.user_id = getUserInformation[0].id
        const qrObj = new QRCode(setData,connection);
        await qrObj.insertScanned();
        res.status(200).json({message : "QR Scanned Successfully!", id : id});
    } catch (error) {
        next(error);
    }
}
const checkScanned = async (req,res,next)=>{
    try {
        const id = req.query.id;
        if(!id) throw new UserError('Invalid ID',401,{query:"Checking if the QR Code has been scanned already but did not provide any id"});
        const qrcode = await firebase.getDocumentById('qrcode',id,['scanned','id','code','user','user_id']);
        const scanned = qrcode.scanned;
        if(scanned || scanned === true) {
            return res.status(200).json({message : "QR Scanned", scanned : scanned, user : qrcode.user_id});
        }else{
            return res.status(200).json({message : "QR is not scanned", scanned : scanned});
        }

    } catch (error) {
        next(error);
    }
}
const registerWasteRecords = async (req, res, next) => {
    try {
        // Validate JSON input
        if (!req.body || !Array.isArray(req.body.records)) {
            throw new UserError("Invalid input. 'records' array is required.");
        }

        const records = req.body.records;
        const userId = req.body.user_id;

        if (!userId) {
            throw new UserError("Missing 'user_id' in request body.",404,{query : 'No user id provided for registration of waste'});
        }

        // Get user reference from Firebase
        const userRef = await firebase.createDocumentReference("user_information", userId);

        // Initialize an array to hold processed records
        const wasteRecords = [];

        for (const record of records) {
            const { category, weight, points } = record;

            if (!category || typeof weight !== "number" || typeof points !== "number") {
                throw new UserError("Each record must include 'category', 'weight', and 'points'.");
            }

            // Create waste record object
            const wasteRecord = {
                category,
                weight,
                points,
                created_at: getCurrentDate().toDate(),
                user: userRef
            };

            // Add record to Firebase
            const addedRecord = await firebase.setDocument("waste", wasteRecord);

            if (!addedRecord) {
                throw new UserError("Failed to register waste record.");
            }

            // Append the added record to the array
            wasteRecords.push(wasteRecord);
        }

        // Respond with success message and added records
        res.status(201).json({
            message: "Waste records registered successfully.",
            records: records
        });
    } catch (error) {
        next(error);
    }
};
const binOverflowing =  async (req,res,next) =>{
    try {
        const category = req.params.category;
        const userConstraint = firebase.createConstraint('role', '==', 'admin');
        const adminAccs = await firebase.getDocumentByParam('users', userConstraint,['id']);
        const adminUserRef = await firebase.createDocumentReference('users',adminAccs[0].id);
        const adminUserConstraint = firebase.createConstraint ('user', '==', adminUserRef);
        const getToken = await firebase.getDocumentByParam('devices', adminUserConstraint, ['token']);

        
        
        const message = {
            body: `The ${category} bin is full.`,
            title : `TRASHBIN FULL`
        };
        //based on category
        const setData = {
            created_at: getCurrentDate().toDate(),
            token : getToken[0].token,
            notification :  message
        }

        const setNotification = await firebase.setDocument('notifications',setData);
        console.log(setNotification);
        console.log(getToken);
        firebase.sendNotification(message, getToken[0].token);

        res.status(200).send({message: 'Notification sent successfully to the Admin User.'});
    } catch (error) {
        console.log(error);
        next(error);
    }
}
export default {
    dashboardData,
    largestCategory,
    largestPoint,
    recentPoint,
    currentPoints,
    response,
    wasteRecords,
    scanQrCode,
    checkScanned,
    registerWasteRecords
}

export {
    dashboardData,
    largestCategory,
    largestPoint,
    recentPoint,
    currentPoints,
    response,
    wasteRecords,
    wasteRecordsAll,
    generateWasteId,
    scanQrCode,
    checkScanned,
    registerWasteRecords,
    binOverflowing
}