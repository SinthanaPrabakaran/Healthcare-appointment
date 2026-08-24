import mongoose from 'mongoose';

const emailNotificationSchema = new mongoose.Schema({
  notificationType: {
    type: String,
    enum: [
      'BOOKING_CONFIRMATION',
      'APPOINTMENT_CANCELLATION',
      'APPOINTMENT_REMINDER',
      'DOCTOR_LEAVE',
      'MEDICATION_REMINDER'
    ],
    required: true,
    index: true
  },
  recipient: {
    type: String,
    required: true,
    trim: true
  },
  recipientName: {
    type: String,
    trim: true,
    default: ''
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  html: {
    type: String,
    default: ''
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null,
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
  scheduledAt: {
    type: Date,
    default: Date.now,
    index: true
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

// Compound index for background processing efficiency
emailNotificationSchema.index({ status: 1, scheduledAt: 1 });

const EmailNotification = mongoose.model('EmailNotification', emailNotificationSchema);

export default EmailNotification;
