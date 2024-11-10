import express from 'express';
import{dashboardData,
    largestCategory,
    largestPoint,
    recentPoint,
    currentPoints,
    response} from '../controllers/wasteController.js';
const router = express.Router();
// /waste

router.get('/dashboard',dashboardData,
    largestCategory,
    largestPoint,
    recentPoint,
    currentPoints,
    response);



export default router;