import firebase from "./firebase.js";
import { formatDate } from "../utils/date.js";
const COLLECTION_NAME = 'users';
const userSelectedFields = [
    'username',
    'password',
    'role'
];
//GET Request

const getAllUsers = async (req, res, next) => {
    try {
        //check here if the request is from a admin
        const {user_id} = req.query;

        if(!user_id) return res.status(401).json({message : "Invalid Request"});

        const getUser = await firebase.getDocumentById(COLLECTION_NAME,user_id,['role']);

        if(getUser.role !=='admin') return res.status(401).json({message : "Invalid Request"});
        const collection = "user_information";
        const selectedFields = [
            'first_name',
            'last_name',
            'address',
            'birthday',
        ]
        const users = await firebase.getDocuments(collection, selectedFields);
        if (users.length === 0) return res.status(404).json({ message: "No User Found" });
        let data = [];
        for (const user of users) {
            const birthday = formatDate(user.birthday.seconds, user.birthday.nanoseconds).toLocaleDateString();
            user.birthday = birthday;
            data.push(user);
        }

        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        next(error);
    }
}


//POST request
const registerAccount = async (req, res, next) => {
    try {

        const {
            username,
            password,
            first_name,
            last_name,
            birthday,
            address,
            role
        } = req.body;
        if (!username || !password) return res.status(406).json({ message: "Invalid Username or Password" });
        //Check if the username is already existing
        const checkUsername = await firebase.getDocumentByParam(COLLECTION_NAME, firebase.createConstraint('username', '==', username), ['id']);
        if (checkUsername.length > 0) return res.status(406).json({ message: "Username already exists" });
        //first register the user account to collection users
        const setUserData = {
            username: username,
            password: password,
            role: role !== null ? role : 'user'
        }

        const setUser = await firebase.setDocument(COLLECTION_NAME, setUserData);
        //Create a userReference
        try {
            const userRef = await firebase.createDocumentReference(COLLECTION_NAME, setUser);

            const setUserInformation = {
                first_name: first_name,
                last_name: last_name,
                address: address,
                birthday: new Date(birthday),
                user: userRef
            }

            //setUserInformation
            const setUserInfo = await firebase.setDocument('user_information', setUserInformation);
        } catch (error) {
            await firebase.deleteDocument(COLLECTION_NAME, setUser);
            return res.status(500).json({ message: "something went wrong please try again later" });
        }

        res.status(201).json({ message: "User Successfully Registered!", user_id: setUser });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const changePassword = async (req,res,next)=>{
    try{
        const {username, old_password, new_password} = req.body;
        if(!username || username == null) return res.status(400).json({message : "Invalid Username"});
        //check if oldPassword matches to the server
        const userConstraint = firebase.createConstraint('username','==',username);
        const user = await firebase.getDocumentByParam(COLLECTION_NAME,userConstraint,userSelectedFields);
        if(user.length === 0) return res.status(401).json({message : "Invalid Username"});
        if(old_password == null || !old_password) return res.status(400).json({message : "Invalid Password"});
        const password = user[0].password;
        if(password !== old_password) return res.status(401).json({message : "Invalid Password"});
        if(new_password == null || !new_password) return res.status(400).json({message : "Invalid Password"});
        const setData = {
            password : new_password
        }
        const update = await firebase.updateData(COLLECTION_NAME,setData,user[0].id);
        if(!update) return res.status(502).json({message : "Something went wrong, try again later."});

        res.status(201).json({message : "Password Successfully Updated!"});
    }catch(error){
        console.log(error);
        next(error);
    }
}

const changeInformation = async(req,res,next)=>{
    try{
        const {first_name,last_name,birthday,address,user_id} = req.body;
        if(!first_name || !last_name) return res.status(400).json({message: "Invalid Name"});
        if(!birthday) return res.status(400).json({message: "Invalid Name"});
        if(!address || !new Date(address) instanceof Date) return res.status(400).json({message : "Invalid Address"});

        if(!user_id) return res.status(401).json({message : "Invalid user id"});

       
        const userRef = await firebase.createDocumentReference(COLLECTION_NAME,user_id);
        const userConstraint = firebase.createConstraint('user','==',userRef);
        const user_information = await firebase.getDocumentByParam('user_information',userConstraint,['id']);
        const userInfoId = user_information[0].id;
        
        const setData = {
            first_name : first_name,
            last_name : last_name,
            address : address,
            birthday : new Date(birthday)
        }

        const update = await firebase.updateData('user_information',setData,userInfoId);
        if(!update) return res.status(500).json({message : "Something went wrong, try again later"});

        res.status(201).json({message : "User Information Updated Successfully"});
    }catch(error){
        console.log(error);
        next(error);
    }
}
const logout = async (req, res, next) => {
    try {
        //Delete Tokens Here
        const token = req.body.token;
        const tokenConstraint = firebase.createConstraint('token', '==', token);
        const getToken = await firebase.getDocumentByParam('devices', tokenConstraint, ['id']);
        if (getToken.length > 0) {
            for (const tokens of getToken) {
                await firebase.deleteDocument('devices', tokens.id);
            }
        } else {
            return res.status(401).json({ message: "Invalid Token" });
        }


        res.status(200).json({ message: "Device successfully logged out" });
    } catch (error) {
        console.log(error);
    }
}
const authenticateUser = async (req, res, next) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const token = req.body.token;

        const constraint = firebase.createConstraint('username', '==', username);
        const data = await firebase.getDocumentByParam(COLLECTION_NAME, constraint, userSelectedFields);
        if (data.length === 0) return res.status(402).json({ message: "Invalid Username or Password" });

        const userPassword = data[0].password;
        if (userPassword !== password) return res.status(402).json({ message: "Invalid Username or Password" });
        let user = {};
        const userRef = await firebase.createDocumentReference(COLLECTION_NAME, data[0].id);
        const userConstraint = firebase.createConstraint('user', '==', userRef);

        if (data[0].role === 'user') {

            const userInformation = await firebase.getDocumentByParam('user_information', userConstraint, ['first_name', 'last_name', 'birthday', 'address']);

            //const milliseconds = userInformation[0].birthday.seconds * 1000 + userInformation[0].birthday.nanoseconds / 1000000;
            const userBirthday = formatDate(userInformation[0].birthday.seconds, userInformation[0].birthday.nanoseconds / 1000000);
            user = {
                name:
                {
                    first: userInformation[0].first_name,
                    last: userInformation[0].last_name
                },
                address: userInformation[0].address,
                birthday: userBirthday.toLocaleDateString()
            }

        }


        if(!token) return res.status(400).json({message : "Invalid Token"});
        //insert or update here the token of the user
        const getToken = await firebase.getDocumentByParam('devices', userConstraint, ['token']);
        if (getToken.length > 0) {
            for (const token of getToken) {
                await firebase.deleteDocument('devices', token.id);
            }
        }
        if (token !== null || token) {
            const setData = {
                token: token,
                user: userRef
            }

            await firebase.setDocument('devices', setData);
        }
        res.json(
            {
                message: "Authenticated",
                user_id: data[0].id,
                role: data[0].role,
                ...user
            }
        );
        //next();
    } catch (error) {
        console.log(error);
        next(error);
    }
}



export default {
    authenticateUser,
    getAllUsers,
    logout,
    registerAccount,
    changePassword,
    changeInformation
}