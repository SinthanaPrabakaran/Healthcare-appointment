import mongoose from 'mongoose';

const medicationReminderSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    index: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  medicine: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  instructions: {
    type: String,
    trim: true,
    default: ''
  },
  scheduledAt: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'FAILED'],
    default: 'PENDING',
    index: true
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  sentAt: {
    type: Date,
    default: null
  },
  lastError: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for background worker query efficiency
medicationReminderSchema.index({ status: 1, scheduledAt: 1 });

const MedicationReminder = mongoose.model('MedicationReminder', medicationReminderSchema);

export default MedicationReminder;
