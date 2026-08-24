import { startMedicationReminderJob } from './medicationReminderJob.js';

export const initJobs = () => {
  startMedicationReminderJob();
  console.log('Medication reminder background job started.');
};
