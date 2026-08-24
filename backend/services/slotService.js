export const generateSlots = (workingHours, slotDuration) => {
  const slots = [];
  
  if (!workingHours || !workingHours.start || !workingHours.end) {
    return slots;
  }

  // Parse time in HH:mm format to total minutes from midnight
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error('Invalid time format');
    }
    return hours * 60 + minutes;
  };
  
  // Format total minutes back to HH:mm string
  const formatTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const startMins = parseTime(workingHours.start);
  const endMins = parseTime(workingHours.end);

  if (startMins >= endMins) {
    throw new Error('Start time must be before end time');
  }

  if (slotDuration <= 0 || slotDuration > (endMins - startMins)) {
    throw new Error('Slot duration is invalid or exceeds working duration');
  }

  let currentStart = startMins;

  // Use exact integer arithmetic
  while (currentStart + slotDuration <= endMins) {
    slots.push({
      startTime: formatTime(currentStart),
      endTime: formatTime(currentStart + slotDuration),
      available: true
    });
    currentStart += slotDuration;
  }

  return slots;
};
