import cron from 'node-cron';
import MedicationReminder from '../models/MedicationReminder.js';
import { sendMedicationReminderEmail } from '../services/emailService.js';

export const processMedicationReminder = async (reminder) => {
  try {
    if (!reminder.patient || !reminder.patient.email) {
      throw new Error('Patient email not available.');
    }

    await sendMedicationReminderEmail(
      reminder.patient.email,
      reminder.patient.name,
      reminder
    );

    // On Success
    reminder.status = 'SENT';
    reminder.sentAt = new Date();
    reminder.lastError = null;
  } catch (error) {
    // On Failure
    reminder.retryCount += 1;
    reminder.lastError = error.message;

    if (reminder.retryCount < reminder.maxRetries) {
      reminder.status = 'PENDING';
    } else {
      reminder.status = 'FAILED';
    }
  } finally {
    try {
      await reminder.save();
    } catch (saveErr) {
      console.error(`Failed to save reminder state for ID ${reminder._id}:`, saveErr.message);
    }
  }
};

export const startMedicationReminderJob = () => {
  // Cron schedule: Every minute (* * * * *)
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const pendingReminders = await MedicationReminder.find({
        status: 'PENDING',
        scheduledAt: { $lte: now }
      }).populate('patient', 'name email');

      if (pendingReminders.length === 0) {
        return;
      }

      console.log(`[Cron] Processing ${pendingReminders.length} pending medication reminders...`);

      for (const reminder of pendingReminders) {
        await processMedicationReminder(reminder);
      }
    } catch (jobError) {
      console.error('[Cron Error] Medication reminder job error:', jobError.message);
    }
  });
};
