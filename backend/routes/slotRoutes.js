import express from 'express';
import { getDoctorSlots } from '../controllers/slotController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/doctors/:doctorId/slots
// Accessible to all authenticated users (Patients)
router.get('/:doctorId/slots', authenticateToken, getDoctorSlots);

export default router;
