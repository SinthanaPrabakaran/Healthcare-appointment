import { google } from 'googleapis';
import GoogleCalendarConnection from '../models/GoogleCalendarConnection.js';
import Appointment from '../models/Appointment.js';

const APP_TIMEZONE = 'Asia/Kolkata';

export const getOAuth2Client = () => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    console.warn('[CalendarService] Google OAuth environment variables are missing.');
    return null;
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
};

export const getAuthorizationUrl = (userId) => {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) {
    throw new Error('Google Calendar integration is not configured on the server.');
  }

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
    state: String(userId)
  });
};

export const handleOAuthCallback = async (code, userId) => {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) {
    throw new Error('Google Calendar integration is not configured on the server.');
  }

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Fetch Google User Email
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userinfo = await oauth2.userinfo.get();
  const googleEmail = userinfo.data.email || '';

  const connectionData = {
    googleEmail,
    accessToken: tokens.access_token || null,
    tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
  };

  if (tokens.refresh_token) {
    connectionData.refreshToken = tokens.refresh_token;
  }

  const connection = await GoogleCalendarConnection.findOneAndUpdate(
    { user: userId },
    { $set: connectionData },
    { new: true, upsert: true }
  );

  return connection;
};

export const getCalendarClientForUser = async (userId) => {
  const connection = await GoogleCalendarConnection.findOne({ user: userId });
  if (!connection || (!connection.refreshToken && !connection.accessToken)) {
    return null;
  }

  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) return null;

  oauth2Client.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken,
    expiry_date: connection.tokenExpiry ? connection.tokenExpiry.getTime() : null
  });

  // Token refresh handler
  oauth2Client.on('tokens', async (tokens) => {
    const update = {};
    if (tokens.access_token) update.accessToken = tokens.access_token;
    if (tokens.expiry_date) update.tokenExpiry = new Date(tokens.expiry_date);
    if (tokens.refresh_token) update.refreshToken = tokens.refresh_token;

    await GoogleCalendarConnection.updateOne({ user: userId }, { $set: update });
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
};

// Convert YYYY-MM-DD + HH:mm to ISO Date String with Asia/Kolkata timezone
const formatDateTime = (dateStr, timeStr) => {
  return `${dateStr}T${timeStr}:00+05:30`;
};

export const createCalendarEventForUser = async (userId, appointment, role) => {
  const calendar = await getCalendarClientForUser(userId);
  if (!calendar) return null;

  const otherPartyName = role === 'PATIENT'
    ? (appointment.doctor?.userId?.name ? `Dr. ${appointment.doctor.userId.name}` : 'Doctor')
    : (appointment.patient?.name || 'Patient');

  const summary = `Healthcare Appointment with ${otherPartyName}`;
  const description = `Medical consultation appointment on ${appointment.date} from ${appointment.startTime} to ${appointment.endTime}.`;

  const startDateTime = formatDateTime(appointment.date, appointment.startTime);
  const endDateTime = formatDateTime(appointment.date, appointment.endTime);

  const eventResource = {
    summary,
    description,
    start: {
      dateTime: startDateTime,
      timeZone: APP_TIMEZONE
    },
    end: {
      dateTime: endDateTime,
      timeZone: APP_TIMEZONE
    }
  };

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: eventResource
  });

  return res.data.id;
};

export const updateCalendarEventForUser = async (userId, appointment, eventId, role) => {
  const calendar = await getCalendarClientForUser(userId);
  if (!calendar || !eventId) return null;

  const otherPartyName = role === 'PATIENT'
    ? (appointment.doctor?.userId?.name ? `Dr. ${appointment.doctor.userId.name}` : 'Doctor')
    : (appointment.patient?.name || 'Patient');

  const summary = `Healthcare Appointment with ${otherPartyName}`;
  const description = `Updated medical consultation appointment on ${appointment.date} from ${appointment.startTime} to ${appointment.endTime}.`;

  const startDateTime = formatDateTime(appointment.date, appointment.startTime);
  const endDateTime = formatDateTime(appointment.date, appointment.endTime);

  const eventResource = {
    summary,
    description,
    start: {
      dateTime: startDateTime,
      timeZone: APP_TIMEZONE
    },
    end: {
      dateTime: endDateTime,
      timeZone: APP_TIMEZONE
    }
  };

  const res = await calendar.events.update({
    calendarId: 'primary',
    eventId,
    requestBody: eventResource
  });

  return res.data.id;
};

export const deleteCalendarEventForUser = async (userId, eventId) => {
  const calendar = await getCalendarClientForUser(userId);
  if (!calendar || !eventId) return true;

  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId
    });
    return true;
  } catch (error) {
    // 404 Not Found means already deleted
    if (error.code === 404 || (error.response && error.response.status === 404)) {
      return true;
    }
    throw error;
  }
};

export const syncAppointmentCalendarEvents = async (appointmentId) => {
  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient')
      .populate({ path: 'doctor', populate: { path: 'userId' } });

    if (!appointment) return;

    const patientUserId = appointment.patient?._id;
    const doctorUserId = appointment.doctor?.userId?._id;

    let patientSuccess = true;
    let doctorSuccess = true;
    let lastError = null;

    if (appointment.status === 'BOOKED') {
      // Patient Sync
      if (patientUserId) {
        try {
          const existingEventId = appointment.calendarEvents?.patient?.eventId;
          if (existingEventId) {
            await updateCalendarEventForUser(patientUserId, appointment, existingEventId, 'PATIENT');
          } else {
            const newEventId = await createCalendarEventForUser(patientUserId, appointment, 'PATIENT');
            if (newEventId) {
              appointment.calendarEvents.patient.eventId = newEventId;
            }
          }
        } catch (err) {
          patientSuccess = false;
          lastError = `Patient sync error: ${err.message}`;
          console.error('[CalendarService]', lastError);
        }
      }

      // Doctor Sync
      if (doctorUserId) {
        try {
          const existingEventId = appointment.calendarEvents?.doctor?.eventId;
          if (existingEventId) {
            await updateCalendarEventForUser(doctorUserId, appointment, existingEventId, 'DOCTOR');
          } else {
            const newEventId = await createCalendarEventForUser(doctorUserId, appointment, 'DOCTOR');
            if (newEventId) {
              appointment.calendarEvents.doctor.eventId = newEventId;
            }
          }
        } catch (err) {
          doctorSuccess = false;
          lastError = `Doctor sync error: ${err.message}`;
          console.error('[CalendarService]', lastError);
        }
      }
    } else if (appointment.status === 'CANCELLED') {
      // Delete Patient Event
      if (patientUserId && appointment.calendarEvents?.patient?.eventId) {
        try {
          await deleteCalendarEventForUser(patientUserId, appointment.calendarEvents.patient.eventId);
          appointment.calendarEvents.patient.eventId = null;
        } catch (err) {
          patientSuccess = false;
          lastError = `Patient delete error: ${err.message}`;
        }
      }

      // Delete Doctor Event
      if (doctorUserId && appointment.calendarEvents?.doctor?.eventId) {
        try {
          await deleteCalendarEventForUser(doctorUserId, appointment.calendarEvents.doctor.eventId);
          appointment.calendarEvents.doctor.eventId = null;
        } catch (err) {
          doctorSuccess = false;
          lastError = `Doctor delete error: ${err.message}`;
        }
      }
    }

    // Determine Overall Sync Status
    if (patientSuccess && doctorSuccess) {
      appointment.calendarSyncStatus = 'SYNCED';
      appointment.calendarLastError = null;
    } else if (patientSuccess || doctorSuccess) {
      appointment.calendarSyncStatus = 'PARTIAL';
      appointment.calendarLastError = lastError;
    } else {
      appointment.calendarSyncStatus = 'FAILED';
      appointment.calendarLastError = lastError;
    }

    await appointment.save();
  } catch (globalErr) {
    console.error('[CalendarService] Global sync error:', globalErr.message);
  }
};
