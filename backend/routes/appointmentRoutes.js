import express from 'express';
import {
  createAppointment,
  getPatientAppointments,
  getAppointmentById,
  cancelAppointment
} from '../controllers/appointmentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Protect all appointment routes: Requires JWT AND Patient role
router.use(authenticateToken, authorizeRoles('PATIENT'));

router.post('/', createAppointment);
router.get('/my', getPatientAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id/cancel', cancelAppointment);

export default router;
