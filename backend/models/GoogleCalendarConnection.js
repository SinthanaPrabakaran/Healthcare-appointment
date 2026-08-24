import mongoose from 'mongoose';

const googleCalendarConnectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  googleEmail: {
    type: String,
    trim: true,
    default: ''
  },
  accessToken: {
    type: String,
    default: null
  },
  refreshToken: {
    type: String,
    default: null
  },
  tokenExpiry: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const GoogleCalendarConnection = mongoose.model('GoogleCalendarConnection', googleCalendarConnectionSchema);

export default GoogleCalendarConnection;
