import express from 'express';
import controller from '../controllers/userController.js';
const router = express.Router();

router.post('/login',controller.authenticateUser);



export default router;