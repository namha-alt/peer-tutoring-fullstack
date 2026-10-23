const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
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
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  startHour: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  endHour: {
    type: Number,
    required: true,
    min: 1,
    max: 24
  },
  status: {
    type: String,
    enum: ['available', 'cancelled'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate slot on the same date and hour for the same tutor
slotSchema.index({ tutorId: 1, date: 1, startHour: 1 }, { unique: true });

module.exports = mongoose.model('Slot', slotSchema);
