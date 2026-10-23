const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./model/User');
const Slot = require('./model/Slot');
const Booking = require('./model/Booking');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/slotsync_db';

// Date helpers
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

const seedDatabase = async () => {
  try {
    console.log('Connecting to:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('🌱 Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Slot.deleteMany({});
    await Booking.deleteMany({});
    console.log('🧹 Cleared existing database collections.');

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
      name: 'Emily Clark',
      email: 'emily@student.edu',
      password: 'password123',
      role: 'student'
    });

    console.log('✅ Created 3 Tutors and 2 Students (password: password123)');

    // 3. Create Slots for this week
    const tomorrow = getOffsetDate(1);
    const dayAfter = getOffsetDate(2);
    const in3Days = getOffsetDate(3);

    const slot1 = await Slot.create({
      tutorId: tutor1._id,
      day: tomorrow.toLocaleDateString('en-US', { weekday: 'long' }),
      date: getLocalDateStr(tomorrow),
      startHour: 10,
      endHour: 11,
      status: 'available'
    });

    const slot2 = await Slot.create({
      tutorId: tutor1._id,
      day: tomorrow.toLocaleDateString('en-US', { weekday: 'long' }),
      date: getLocalDateStr(tomorrow),
      startHour: 14,
      endHour: 15,
      status: 'available'
    });

    const slot3 = await Slot.create({
      tutorId: tutor2._id,
      day: dayAfter.toLocaleDateString('en-US', { weekday: 'long' }),
      date: getLocalDateStr(dayAfter),
      startHour: 11,
      endHour: 12,
      status: 'available'
    });

    const slot4 = await Slot.create({
      tutorId: tutor2._id,
      day: in3Days.toLocaleDateString('en-US', { weekday: 'long' }),
      date: getLocalDateStr(in3Days),
      startHour: 16,
      endHour: 17,
      status: 'available'
    });

    const slot5 = await Slot.create({
      tutorId: tutor3._id,
      day: dayAfter.toLocaleDateString('en-US', { weekday: 'long' }),
      date: getLocalDateStr(dayAfter),
      startHour: 9,
      endHour: 10,
      status: 'available'
    });

    console.log('✅ Created 5 sample availability slots across tutors');

    // 4. Create Sample Bookings
    // Confirmed session between student1 and tutor1
    await Booking.create({
      slotId: slot1._id,
      studentId: student2._id,
      tutorId: tutor1._id,
      day: slot1.day,
      date: slot1.date,
      startHour: slot1.startHour,
      endHour: slot1.endHour,
      topic: 'Calculus: Derivatives & Chain Rule',
      specifics: 'Need help solving problem set 4 and preparing for the midterm exam.',
      status: 'confirmed',
      confirmedAt: new Date()
    });

    // Pending request from student1 to tutor2
    await Booking.create({
      slotId: slot3._id,
      studentId: student2._id,
      tutorId: tutor2._id,
      day: slot3.day,
      date: slot3.date,
      startHour: slot3.startHour,
      endHour: slot3.endHour,
      topic: 'Data Structures: Binary Search Trees',
      specifics: 'Need guidance implementing AVL tree balancing operations in Python.',
      status: 'pending',
      requestedAt: new Date()
    });

    console.log('✅ Created 1 Confirmed session and 1 Pending booking request');
    console.log('✨ Seed complete! You can now start the server: npm start');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();
