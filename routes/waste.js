import express from 'express';
import{dashboardData,
    largestCategory,
    largestPoint,
    recentPoint,
    currentPoints,
    response,
    wasteRecords,
    wasteRecordsAll,
    generateWasteId,
    scanQrCode,
    checkScanned
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
router.get('/generate',generateWasteId);
router.get('/scan',scanQrCode);
router.get('/check-scan',checkScanned);
export default router;