import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  symptoms: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['HELD', 'BOOKED', 'CANCELLED', 'COMPLETED'],
    default: 'BOOKED'
  },
  holdExpiresAt: {
    type: Date,
    default: null
  },
  preVisitSummary: {
    urgencyLevel: {
      type: String,
      enum: ["Low", "Medium", "High"]
    },
    chiefComplaint: {
      type: String
    },
    suggestedQuestions: {
      type: [String]
    },
    generatedAt: {
      type: Date
    }
  },
  postVisitNotes: {
    type: String,
    trim: true,
    default: null
  },
  prescription: [
    {
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
      frequency: {
        type: String,
        required: true,
        trim: true
      },
      duration: {
        type: String,
        required: true,
        trim: true
      },
      instructions: {
        type: String,
        trim: true,
        default: ""
      }
    }
  ],
  followUpInstructions: {
    type: String,
    trim: true,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  postVisitSummary: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: true
});

// Phase 7: MongoDB Partial Unique Index for robust concurrency protection
// This guarantees that there can be ONLY ONE active appointment (BOOKED or HELD)
// per doctor per slot.
appointmentSchema.index(
  { doctor: 1, date: 1, startTime: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: { $in: ['BOOKED', 'HELD'] } } 
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
