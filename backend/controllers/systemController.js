const mongoose = require('mongoose');
const User = require('../model/User');
const Slot = require('../model/Slot');
const Booking = require('../model/Booking');

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

// @desc    Seed database with demo tutors, students, slots, and bookings
// @route   GET or POST /api/system/seed
// @access  Public
exports.seedDatabase = async (req, res, next) => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Slot.deleteMany({});
    await Booking.deleteMany({});

    function getLocalDateStr(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    function getOffsetDate(daysOffset) {
      const d = new Date();
      d.setDate(d.getDate() + daysOffset);
      return d;
    }

    // 1. Create Tutors
    const tutor1 = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'sarah@tutors.edu',
      password: 'password123',
      role: 'tutor',
      subjects: ['Mathematics', 'Physics'],
      maxCapacity: 2,
      rating: '4.9/5'
    });

    const tutor2 = await User.create({
      name: 'Alex Chen',
      email: 'alex@tutors.edu',
      password: 'password123',
      role: 'tutor',
      subjects: ['Computer Science', 'English'],
      maxCapacity: 1,
      rating: '4.8/5'
    });

    const tutor3 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@tutors.edu',
      password: 'password123',
      role: 'tutor',
      subjects: ['Chemistry', 'Biology'],
      maxCapacity: 3,
      rating: '5.0/5'
    });

    // 2. Create Students
    const student1 = await User.create({
      name: 'John Doe',
      email: 'john@student.edu',
      password: 'password123',
      role: 'student'
    });

    const student2 = await User.create({
      name: 'Emily Watson',
      email: 'emily@student.edu',
      password: 'password123',
      role: 'student'
    });

    // 3. Create Slots
    const d0 = getOffsetDate(0);
    const d1 = getOffsetDate(1);
    const d2 = getOffsetDate(2);
    const d3 = getOffsetDate(3);

    const slot1 = await Slot.create({
      tutorId: tutor1._id,
      day: d0.toLocaleDateString('en-US', { weekday: 'long' }),
      date: getLocalDateStr(d0),
      startHour: 10,
      endHour: 11,
      status: 'available'
    });

    const slot2 = await Slot.create({
      tutorId: tutor1._id,
      day: d0.toLocaleDateString('en-US', { weekday: 'long' }),
      date: getLocalDateStr(d0),
      startHour: 14,
      endHour: 15,
      status: 'available'
    });

    const slot3 = await Slot.create({
      tutorId: tutor1._id,
      day: d1.toLocaleDateString('en-US', { weekday: 'long' }),
      date: getLocalDateStr(d1),
      startHour: 11,
      endHour: 12,
      status: 'available'
    });

    const slot4 = await Slot.create({
      tutorId: tutor1._id,
      day: d2.toLocaleDateString('en-US', { weekday: 'long' }),
      date: getLocalDateStr(d2),
      startHour: 15,
      endHour: 16,
      status: 'available'
    });

    const slot5 = await Slot.create({
      tutorId: tutor2._id,
      day: d0.toLocaleDateString('en-US', { weekday: 'long' }),
      date: getLocalDateStr(d0),
      startHour: 13,
      endHour: 14,
      status: 'available'
    });

    const slot6 = await Slot.create({
      tutorId: tutor2._id,
      day: d1.toLocaleDateString('en-US', { weekday: 'long' }),
      date: getLocalDateStr(d1),
      startHour: 16,
      endHour: 17,
      status: 'available'
    });

    const slot7 = await Slot.create({
      tutorId: tutor2._id,
      day: d3.toLocaleDateString('en-US', { weekday: 'long' }),
      date: getLocalDateStr(d3),
      startHour: 9,
      endHour: 10,
      status: 'available'
    });

    const slot8 = await Slot.create({
      tutorId: tutor3._id,
      day: d0.toLocaleDateString('en-US', { weekday: 'long' }),
      date: getLocalDateStr(d0),
      startHour: 11,
      endHour: 12,
      status: 'available'
    });

    const slot9 = await Slot.create({
      tutorId: tutor3._id,
      day: d2.toLocaleDateString('en-US', { weekday: 'long' }),
      date: getLocalDateStr(d2),
      startHour: 14,
      endHour: 15,
      status: 'available'
    });

    // 4. Create Bookings
    await Booking.create({
      slotId: slot1._id,
      studentId: student2._id,
      tutorId: tutor1._id,
      day: slot1.day,
      date: slot1.date,
      startHour: 10,
      endHour: 11,
      topic: 'Calculus - Differential Equations',
      specifics: 'Need help with 2nd order non-homogeneous differential equations',
      status: 'confirmed',
      confirmedAt: new Date()
    });

    await Booking.create({
      slotId: slot5._id,
      studentId: student2._id,
      tutorId: tutor2._id,
      day: slot5.day,
      date: slot5.date,
      startHour: 13,
      endHour: 14,
      topic: 'Data Structures - Binary Search Trees',
      specifics: 'Balancing and rotation mechanisms in AVL trees',
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      message: 'Database seeded successfully with tutors, students, slots, and bookings!',
      seeded: {
        tutors: 3,
        students: 2,
        slots: 9,
        bookings: 2
      }
    });
  } catch (err) {
    next(err);
  }
};
