import cron from 'node-cron';
import EmailNotification from '../models/EmailNotification.js';
import { sendEmail } from '../services/emailService.js';

export const processEmailNotification = async (notification) => {
  try {
    await sendEmail({
      to: notification.recipient,
      subject: notification.subject,
      text: notification.body,
      html: notification.html
    });

    // On Success
    notification.status = 'SENT';
    notification.sentAt = new Date();
    notification.lastError = null;
  } catch (error) {
    // On Failure
    notification.retryCount += 1;
    notification.lastError = error.message;

    if (notification.retryCount < notification.maxRetries) {
      notification.status = 'PENDING';
    } else {
      notification.status = 'FAILED';
    }
  } finally {
    try {
      await notification.save();
    } catch (saveErr) {
      console.error(`[EmailRetryJob] Failed to save notification state for ID ${notification._id}:`, saveErr.message);
    }
  }
};

export const startEmailRetryJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const pendingNotifications = await EmailNotification.find({
        status: 'PENDING',
        scheduledAt: { $lte: now }
      });

      if (pendingNotifications.length === 0) return;

      console.log(`[Cron] Processing ${pendingNotifications.length} pending email notifications...`);

      for (const notification of pendingNotifications) {
        await processEmailNotification(notification);
      }
    } catch (jobError) {
      console.error('[Cron Error] Email retry job error:', jobError.message);
    }
  });
};
