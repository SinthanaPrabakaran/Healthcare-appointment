import express from 'express';
import {
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctors,
  getDoctorById
} from '../controllers/doctorController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apply authenticateToken to all routes in this file
router.use(authenticateToken);

// Routes accessible to all authenticated users
router.route('/')
  .get(getDoctors)
  .post(authorizeRoles('ADMIN'), createDoctor); // POST restricted to ADMIN

router.route('/:id')
  .get(getDoctorById)
  .put(authorizeRoles('ADMIN'), updateDoctor)    // PUT restricted to ADMIN
  .delete(authorizeRoles('ADMIN'), deleteDoctor); // DELETE restricted to ADMIN

export default router;
