import express from 'express';
import{dashboardData,
    largestCategory,
    largestPoint,
    recentPoint,
    currentPoints,
    response,
    wasteRecords,
    wasteRecordsAll
} from '../controllers/wasteController.js';
const router = express.Router();
// /waste
router.get('/records',wasteRecords);
router.get('/records/all',wasteRecordsAll);
router.get('/dashboard',dashboardData,
    largestCategory,
    largestPoint,
    recentPoint,
    currentPoints,
    response);



export default router;