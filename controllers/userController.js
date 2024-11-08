import firebase from "./firebase.js";
const COLLECTION_NAME = 'users';
const userSelectedFields = [
    'username',
    'password',
    'role'
];
//GET Request

const formatDate = (seconds,nanoseconds)=>{
    const milliseconds = seconds * 1000 + nanoseconds/ 1000000;

    return new Date(milliseconds);
}
const getAllUsers = async (req,res,next)=>{
    try{
        const collection =  "user_information";
        const selectedFields = [
            'first_name',
            'last_name',
            'address',
            'birthday',
        ]
        const users = await firebase.getDocuments(collection,selectedFields);
        if(users.length === 0) return res.status(404).json({message : "No User Found"});
        let data = [];
        for(const user of users){
            const birthday = formatDate(user.birthday.seconds, user.birthday.nanoseconds).toLocaleDateString();
            user.birthday = birthday;
            data.push(user);
        }

        res.status(200).json(data);
    }catch(error){
        console.log(error);
    }
}


//POST request
const logout = async (req,res,next)=>{
    try{
        //Delete Tokens Here
        const token = req.body.token;
        const tokenConstraint = firebase.createConstraint('token','==',token);
        const getToken = await firebase.getDocumentByParam('devices',tokenConstraint,['id']);
        if(getToken.length > 0){
            for(const tokens of getToken){
                await firebase.deleteDocument('devices', token.id);
            }
        }else{
            return res.status(401).json({message : "Invalid Token"});
        }


        res.status(200).json({message : "Device successfully logged out"});
    }catch(error){
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
                    first_name: userInformation[0].first_name,
                    last_name: userInformation[0].last_name
                },
                address: userInformation[0].address,
                birthday: userBirthday.toLocaleDateString()
            }

        }



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
    }
}



export default {
    authenticateUser,
    getAllUsers,
    logout
}