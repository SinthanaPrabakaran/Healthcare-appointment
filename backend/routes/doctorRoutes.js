import express from 'express';
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
} from '../controllers/doctorController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('ADMIN'), createDoctor);
router.get('/', authenticateToken, getDoctors);
router.get('/:id', authenticateToken, getDoctorById);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), updateDoctor);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteDoctor);

export default router;
