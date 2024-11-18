import express from 'express';
import controller from '../controllers/transactionController.js';
import { dashboardData, currentPoints, response } from '../controllers/wasteController.js';
const router = express.Router();
// /transaction
router.post('/redeem',dashboardData,controller.RedeemPoints,currentPoints,response);
router.get('/records',controller.getTransactionRecords);

export default router;