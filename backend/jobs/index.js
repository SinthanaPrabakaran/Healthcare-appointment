import { startMedicationReminderJob } from './medicationReminderJob.js';
import { startEmailRetryJob } from './emailRetryJob.js';
import { startCalendarRetryJob } from './calendarRetryJob.js';

export const initJobs = () => {
  startMedicationReminderJob();
  startEmailRetryJob();
  startCalendarRetryJob();
  console.log('Medication reminder background job started.');
  console.log('Email retry background job started.');
  console.log('Google Calendar retry background job started.');
};
