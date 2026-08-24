import { startMedicationReminderJob } from './medicationReminderJob.js';
import { startEmailRetryJob } from './emailRetryJob.js';

export const initJobs = () => {
  startMedicationReminderJob();
  startEmailRetryJob();
  console.log('Medication reminder background job started.');
  console.log('Email retry background job started.');
};
