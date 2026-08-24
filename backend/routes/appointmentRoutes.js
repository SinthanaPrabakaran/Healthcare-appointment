import express from 'express';
import {
  createAppointment,
  holdAppointment,
  confirmAppointment,
  getPatientAppointments,
  getAppointmentById,
  cancelAppointment,
  generatePreVisitSummary,
  getPreVisitSummary,
  getDoctorAppointments,
  completeAppointment,
  generatePostVisitSummary
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
// DOCTOR ROUTES
// ==========================================
router.get('/doctor', authorizeRoles('DOCTOR'), getDoctorAppointments);
router.put('/:id/complete', authorizeRoles('DOCTOR'), completeAppointment);
router.post('/:id/postvisit-summary', authorizeRoles('DOCTOR'), generatePostVisitSummary);

// ==========================================
// PATIENT ROUTES
// ==========================================
router.post('/hold', authorizeRoles('PATIENT'), holdAppointment);
router.post('/:id/confirm', authorizeRoles('PATIENT'), confirmAppointment);
router.post('/', authorizeRoles('PATIENT'), createAppointment);
router.get('/my', authorizeRoles('PATIENT'), getPatientAppointments);
router.put('/:id/cancel', authorizeRoles('PATIENT'), cancelAppointment);

// ==========================================
// SHARED ROUTES
// ==========================================
router.get('/:id', authorizeRoles('PATIENT', 'DOCTOR', 'ADMIN'), getAppointmentById);

export default router;
