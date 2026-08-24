import express from 'express';
import {
  getConnectUrl,
  oauthCallback,
  getStatus,
  disconnectCalendar
} from '../controllers/calendarController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public OAuth callback route from Google
router.get('/oauth/callback', oauthCallback);

// Protected routes (require user JWT)
router.use(authenticateToken);

router.get('/connect', getConnectUrl);
router.get('/status', getStatus);
router.delete('/disconnect', disconnectCalendar);

export default router;
