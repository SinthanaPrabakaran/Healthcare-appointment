import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import { syncAppointmentCalendarEvents } from '../services/calendarService.js';

export const startCalendarRetryJob = () => {
  // Run every 5 minutes (*/5 * * * *)
  cron.schedule('*/5 * * * *', async () => {
    try {
      const unsyncedAppointments = await Appointment.find({
        calendarSyncStatus: { $in: ['PENDING', 'PARTIAL', 'FAILED'] },
        calendarRetryCount: { $lt: 3 },
        status: { $in: ['BOOKED', 'CANCELLED'] }
      });

      if (unsyncedAppointments.length === 0) return;

      console.log(`[Cron] Processing ${unsyncedAppointments.length} pending calendar synchronization items...`);

      for (const app of unsyncedAppointments) {
        try {
          app.calendarRetryCount += 1;
          await app.save();

          await syncAppointmentCalendarEvents(app._id);
        } catch (appErr) {
          console.error(`[CalendarRetryJob] Error syncing appointment ${app._id}:`, appErr.message);
        }
      }
    } catch (cronErr) {
      console.error('[CalendarRetryJob] Background job error:', cronErr.message);
    }
  });
};
