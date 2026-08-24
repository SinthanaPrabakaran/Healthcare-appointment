import MedicationReminder from '../models/MedicationReminder.js';

export const parseDurationInDays = (durationStr) => {
  if (!durationStr || typeof durationStr !== 'string') return null;
  const normalized = durationStr.trim().toLowerCase();

  const daysMatch = normalized.match(/^(\d+)\s*days?$/);
  if (daysMatch) {
    return parseInt(daysMatch[1], 10);
  }

  const weeksMatch = normalized.match(/^(\d+)\s*weeks?$/);
  if (weeksMatch) {
    return parseInt(weeksMatch[1], 10) * 7;
  }

  console.warn(`[ReminderService] Unsupported duration format: "${durationStr}"`);
  return null;
};

export const parseFrequencySchedule = (frequencyStr) => {
  if (!frequencyStr || typeof frequencyStr !== 'string') return null;
  const normalized = frequencyStr.trim().toLowerCase().replace(/\s+/g, ' ');

  if (normalized === 'once daily' || normalized === 'daily') {
    return [{ hours: 9, minutes: 0 }];
  }
  if (normalized === 'twice daily' || normalized === 'two times daily') {
    return [{ hours: 9, minutes: 0 }, { hours: 21, minutes: 0 }];
  }
  if (normalized === 'three times daily' || normalized === 'three times a day') {
    return [{ hours: 8, minutes: 0 }, { hours: 14, minutes: 0 }, { hours: 20, minutes: 0 }];
  }
  if (normalized === 'every 4 hours') {
    return [
      { hours: 0, minutes: 0 }, { hours: 4, minutes: 0 }, { hours: 8, minutes: 0 },
      { hours: 12, minutes: 0 }, { hours: 16, minutes: 0 }, { hours: 20, minutes: 0 }
    ];
  }
  if (normalized === 'every 6 hours') {
    return [
      { hours: 0, minutes: 0 }, { hours: 6, minutes: 0 },
      { hours: 12, minutes: 0 }, { hours: 18, minutes: 0 }
    ];
  }
  if (normalized === 'every 8 hours') {
    return [
      { hours: 0, minutes: 0 }, { hours: 8, minutes: 0 }, { hours: 16, minutes: 0 }
    ];
  }
  if (normalized === 'every 12 hours') {
    return [{ hours: 9, minutes: 0 }, { hours: 21, minutes: 0 }];
  }

  console.warn(`[ReminderService] Unsupported frequency format: "${frequencyStr}"`);
  return null;
};

export const generateRemindersForAppointment = async (appointment) => {
  try {
    if (!appointment || !appointment.prescription || !Array.isArray(appointment.prescription) || appointment.prescription.length === 0) {
      return 0;
    }

    // Duplicate Prevention (Task 15)
    const exists = await MedicationReminder.exists({ appointment: appointment._id });
    if (exists) {
      return 0;
    }

    const startDate = appointment.completedAt ? new Date(appointment.completedAt) : new Date();
    const remindersToInsert = [];

    for (const med of appointment.prescription) {
      const daysCount = parseDurationInDays(med.duration);
      const timeSlots = parseFrequencySchedule(med.frequency);

      if (!daysCount || !timeSlots) {
        continue;
      }

      for (let dayOffset = 0; dayOffset < daysCount; dayOffset++) {
        for (const slot of timeSlots) {
          const scheduledAt = new Date(startDate);
          scheduledAt.setDate(scheduledAt.getDate() + dayOffset);
          scheduledAt.setHours(slot.hours, slot.minutes, 0, 0);

          remindersToInsert.push({
            appointment: appointment._id,
            patient: appointment.patient,
            medicine: med.medicine,
            dosage: med.dosage,
            instructions: med.instructions || '',
            scheduledAt,
            status: 'PENDING',
            retryCount: 0
          });
        }
      }
    }

    if (remindersToInsert.length > 0) {
      await MedicationReminder.insertMany(remindersToInsert);
    }

    return remindersToInsert.length;
  } catch (error) {
    console.error('[ReminderService] Error generating reminders:', error.message);
    return 0;
  }
};
