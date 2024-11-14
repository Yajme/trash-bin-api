import express from 'express';
import controller from '../controllers/transactionController.js';
const router = express.Router();
// /transaction
router.post('/redeem',controller.RedeemPoints);


export default router;