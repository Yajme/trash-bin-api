import express from 'express';
import controller from '../controllers/transactionController.js';
const router = express.Router();

router.post('/redeem',controller.RedeemPoints);


export default router;