const mongoose = require('mongoose');
const User = require('../model/User');
const Slot = require('../model/Slot');
const Booking = require('../model/Booking');
const { getTrafficLogs, clearTrafficLogs } = require('../middleware/apiLogger');

// @desc    System health & database status
// @route   GET /api/system/health
// @access  Public
exports.getHealth = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];

  res.status(200).json({
    success: true,
    status: 'ONLINE',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      type: 'MongoDB',
      host: mongoose.connection.host || 'localhost',
      name: mongoose.connection.name || 'slotsync_db',
      state: states[dbState] || 'Unknown'
    }
  });
};

// @desc    Get live API traffic logs
// @route   GET /api/system/traffic
// @access  Public
exports.getTraffic = (req, res) => {
  res.status(200).json({
    success: true,
    logs: getTrafficLogs()
  });
};

// @desc    Clear live traffic logs
// @route   DELETE /api/system/traffic
// @access  Public
exports.deleteTraffic = (req, res) => {
  clearTrafficLogs();
  res.status(200).json({
    success: true,
    message: 'Traffic logs cleared'
  });
};

// @desc    Get database collection statistics
// @route   GET /api/system/db-stats
// @access  Public
exports.getDatabaseStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const tutors = await User.countDocuments({ role: 'tutor' });
    const totalSlots = await Slot.countDocuments();
    const availableSlots = await Slot.countDocuments({ status: 'available' });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    res.status(200).json({
      success: true,
      stats: {
        users: { total: totalUsers, students, tutors },
        slots: { total: totalSlots, available: availableSlots },
        bookings: { total: totalBookings, pending: pendingBookings, confirmed: confirmedBookings, cancelled: cancelledBookings },
        dbState: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
      }
    });
  } catch (err) {
    next(err);
  }
};
