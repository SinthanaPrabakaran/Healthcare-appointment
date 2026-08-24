import cron from 'node-cron';
import MedicationReminder from '../models/MedicationReminder.js';
import EmailNotification from '../models/EmailNotification.js';
import { sendMedicationReminderEmail, medicationReminderTemplate } from '../services/emailService.js';

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

    // Log to EmailNotification collection for auditing (Phase 12 integration)
    try {
      const tmpl = medicationReminderTemplate({
        patientName: reminder.patient.name,
        medicine: reminder.medicine,
        dosage: reminder.dosage,
        instructions: reminder.instructions
      });

      await EmailNotification.create({
        notificationType: 'MEDICATION_REMINDER',
        recipient: reminder.patient.email,
        recipientName: reminder.patient.name,
        subject: tmpl.subject,
        body: tmpl.text,
        html: tmpl.html,
        appointment: reminder.appointment,
        status: 'SENT',
        sentAt: new Date()
      });
    } catch (notifErr) {
      console.error('Failed to log EmailNotification audit record for reminder:', notifErr.message);
    }
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
