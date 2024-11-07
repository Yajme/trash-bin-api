import { connection } from "../model/db.js";

//GET Request

//POST request
const authenticateUser = async (req,res,next)=>{
    try{
        const username = req.body.username;
        const password= req.body.password;

        const rows = await connection.query('SELECT * FROM users WHERE username = $1 AND deleted_at is NULL',[username]);
        
        if(rows.rowCount < 1) return res.status(404).json({message : 'User not found'});
        const user = rows.rows[0];
        if(password !== user.password) return res.status(401).json({message : "Invalid password"});
        
        res.json({message : "Authenticated"});
        //next();
    }catch(error){
        console.log(error);
    }
}



export default {
    authenticateUser
}