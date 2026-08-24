import express from 'express';
import {
  createAppointment,
  holdAppointment,
  confirmAppointment,
  getPatientAppointments,
  getAppointmentById,
  cancelAppointment,
  generatePreVisitSummary,
  getPreVisitSummary
} from '../controllers/appointmentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All appointment routes require authentication
router.use(authenticateToken);

// ==========================================
// DOCTOR & ADMIN ROUTES
// ==========================================
// DO NOT expose clinical AI summaries to PATIENTS
router.post(
  '/:id/previsit-summary',
  authorizeRoles('DOCTOR', 'ADMIN'),
  generatePreVisitSummary
);

router.get(
  '/:id/previsit-summary',
  authorizeRoles('DOCTOR', 'ADMIN'),
  getPreVisitSummary
);

// ==========================================
// PATIENT ROUTES
// ==========================================
router.post('/hold', authorizeRoles('PATIENT'), holdAppointment);
router.post('/:id/confirm', authorizeRoles('PATIENT'), confirmAppointment);
router.post('/', authorizeRoles('PATIENT'), createAppointment);
router.get('/my', authorizeRoles('PATIENT'), getPatientAppointments);
router.get('/:id', authorizeRoles('PATIENT'), getAppointmentById);
router.put('/:id/cancel', authorizeRoles('PATIENT'), cancelAppointment);

export default router;
