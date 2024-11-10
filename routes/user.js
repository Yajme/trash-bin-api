import express from 'express';
import controller from '../controllers/userController.js';
const router = express.Router();
// route: /user
router.get('/',(req,res,next)=>{
    next(new Error('Invalid Argument'));
});
router.get('/all',controller.getAllUsers);
router.post('/register',controller.registerAccount);
router.post('/login',controller.authenticateUser);
router.delete('/logout',controller.logout);
router.patch('/change/password',controller.changePassword);
router.put('/change/information',controller.changeInformation);

export default router;