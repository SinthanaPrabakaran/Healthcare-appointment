import GoogleCalendarConnection from '../models/GoogleCalendarConnection.js';
import { getAuthorizationUrl, handleOAuthCallback } from '../services/calendarService.js';

// @desc    Get Google OAuth Authorization URL
// @route   GET /api/calendar/connect
// @access  Private (Patient or Doctor)
export const getConnectUrl = async (req, res) => {
  try {
    const userId = req.user.userId;
    const url = getAuthorizationUrl(userId);
    res.status(200).json({ url });
  } catch (error) {
    console.error('Get connect URL error:', error);
    res.status(500).json({ message: error.message || 'Error generating OAuth URL' });
  }
};

// @desc    OAuth Callback Handler
// @route   GET /api/calendar/oauth/callback
// @access  Public (Google OAuth Redirect)
export const oauthCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ message: 'Missing OAuth authorization code or state parameter.' });
    }

    const userId = state;
    const connection = await handleOAuthCallback(code, userId);

    res.status(200).json({
      message: 'Google Calendar connected successfully!',
      googleEmail: connection.googleEmail
    });
  } catch (error) {
    console.error('OAuth Callback error:', error);
    res.status(500).json({ message: 'Failed to complete Google OAuth authentication', error: error.message });
  }
};

// @desc    Get User Google Calendar Connection Status
// @route   GET /api/calendar/status
// @access  Private (Patient or Doctor)
export const getStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const connection = await GoogleCalendarConnection.findOne({ user: userId });

    if (!connection || (!connection.accessToken && !connection.refreshToken)) {
      return res.status(200).json({
        connected: false,
        googleEmail: null
      });
    }

    res.status(200).json({
      connected: true,
      googleEmail: connection.googleEmail || null
    });
  } catch (error) {
    console.error('Get calendar status error:', error);
    res.status(500).json({ message: 'Error checking calendar status' });
  }
};

// @desc    Disconnect Google Calendar
// @route   DELETE /api/calendar/disconnect
// @access  Private (Patient or Doctor)
export const disconnectCalendar = async (req, res) => {
  try {
    const userId = req.user.userId;
    await GoogleCalendarConnection.findOneAndDelete({ user: userId });

    res.status(200).json({ message: 'Google Calendar disconnected successfully' });
  } catch (error) {
    console.error('Disconnect calendar error:', error);
    res.status(500).json({ message: 'Error disconnecting calendar' });
  }
};
