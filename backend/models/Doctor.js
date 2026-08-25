import mongoose from 'mongoose';

// Schema for a single day's working hours
const daySchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: true
  },
  start: {
    type: String,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // Validates 24-hour HH:mm format
    default: '09:00'
  },
  end: {
    type: String,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // Validates 24-hour HH:mm format
    default: '17:00'
  }
}, { _id: false });

const defaultWorkDay = () => ({ enabled: true, start: '09:00', end: '17:00' });
const defaultOffDay = () => ({ enabled: false, start: '09:00', end: '17:00' });

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: 'User'
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  workingHours: {
    monday: { type: daySchema, default: defaultWorkDay },
    tuesday: { type: daySchema, default: defaultWorkDay },
    wednesday: { type: daySchema, default: defaultWorkDay },
    thursday: { type: daySchema, default: defaultWorkDay },
    friday: { type: daySchema, default: defaultWorkDay },
    saturday: { type: daySchema, default: defaultOffDay },
    sunday: { type: daySchema, default: defaultOffDay }
  },
  slotDuration: {
    type: Number,
    required: true,
    default: 30,
    min: 5
  },
  leaveDates: [{
    type: String,
    match: /^\d{4}-\d{2}-\d{2}$/ // Validates YYYY-MM-DD format
  }]
}, {
  timestamps: true
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
