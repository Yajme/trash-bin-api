import express from 'express';
import controller from '../controllers/userController.js';
const router = express.Router();
// route: /user
router.get('/all',controller.getAllUsers);
router.post('/login',controller.authenticateUser);
router.post('/logout',controller.logout);


export default router;