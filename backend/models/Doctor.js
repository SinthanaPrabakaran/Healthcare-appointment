import mongoose from 'mongoose';

// Schema for a single day's working hours
const daySchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: false
  },
  start: {
    type: String,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // Validates 24-hour HH:mm format
    required: function() { return this.enabled; }
  },
  end: {
    type: String,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // Validates 24-hour HH:mm format
    required: function() { return this.enabled; }
  }
}, { _id: false });

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
    monday: { type: daySchema, default: () => ({ enabled: false }) },
    tuesday: { type: daySchema, default: () => ({ enabled: false }) },
    wednesday: { type: daySchema, default: () => ({ enabled: false }) },
    thursday: { type: daySchema, default: () => ({ enabled: false }) },
    friday: { type: daySchema, default: () => ({ enabled: false }) },
    saturday: { type: daySchema, default: () => ({ enabled: false }) },
    sunday: { type: daySchema, default: () => ({ enabled: false }) }
  },
  slotDuration: {
    type: Number,
    required: true,
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
