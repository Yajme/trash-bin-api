import express from 'express';
import{dashboardData,
    largestCategory,
    largestPoint,
    recentPoint,
    currentPoints,
    response,
    wasteRecords
} from '../controllers/wasteController.js';
const router = express.Router();
// /waste
router.get('/records',wasteRecords);
router.get('/dashboard',dashboardData,
    largestCategory,
    largestPoint,
    recentPoint,
    currentPoints,
    response);



export default router;