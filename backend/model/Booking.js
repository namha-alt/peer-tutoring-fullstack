const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  day: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  startHour: {
    type: Number,
    required: true
  },
  endHour: {
    type: Number,
    required: true
  },
  topic: {
    type: String,
    trim: true,
    default: 'General Tutoring'
  },
  specifics: {
    type: String,
    trim: true,
    default: ''
  },
  attachmentUrl: {
    type: String,
    default: ''
  },
  attachmentOriginalName: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  cancelledBy: {
    type: String,
    enum: ['student', 'tutor', 'system', null],
    default: null
  },
  cancelReason: {
    type: String,
    trim: true,
    default: ''
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
