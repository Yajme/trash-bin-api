import firebase from "./firebase.js";
import { Waste } from "../model/waste.js";
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
        //get the points doc id here
        const stored_points = await firebase.getDocumentByParam("points",userConstraint,['id']);
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
        const getRecords = await firebase.getDocumentByParam(collection_name,userConstraint,wasteSelectedFields);
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
//TODO : Register waste here from Pi
export default {
    dashboardData,
    largestCategory,
    largestPoint,
    recentPoint,
    currentPoints,
    response,
    wasteRecords
}

export {
    dashboardData,
    largestCategory,
    largestPoint,
    recentPoint,
    currentPoints,
    response,
    wasteRecords,
    wasteRecordsAll
}