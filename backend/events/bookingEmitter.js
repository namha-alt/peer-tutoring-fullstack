const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

// Custom Booking Event Emitter extending Node.js EventEmitter
class BookingEventEmitter extends EventEmitter {}

const bookingEmitter = new BookingEventEmitter();

// In-memory audit event log buffer for presentation
const eventLogs = [];
const MAX_LOGS = 50;

// Ensure logs directory exists using fs and path
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
const auditLogFile = path.join(logsDir, 'audit_events.log');

// Helper to log event to file and memory
function recordEvent(type, data) {
  const timestamp = new Date().toISOString();
  const entry = {
    id: Math.random().toString(36).substring(2, 9),
    type,
    timestamp,
    data
  };

  eventLogs.unshift(entry);
  if (eventLogs.length > MAX_LOGS) eventLogs.pop();

  const logLine = `[${timestamp}] EVENT: ${type} - ${JSON.stringify(data)}\n`;
  
  // Non-blocking file append using fs.appendFile
  fs.appendFile(auditLogFile, logLine, (err) => {
    if (err) console.error('Error writing to audit log:', err.message);
  });

  console.log(`\x1b[35m[EVENT EMITTER]\x1b[0m 📢 Event fired: \x1b[33m${type}\x1b[0m`);
}

// Register Listeners
bookingEmitter.on('booking:requested', (booking) => {
  recordEvent('BOOKING_REQUESTED', {
    bookingId: booking._id,
    studentId: booking.studentId,
    tutorId: booking.tutorId,
    date: booking.date,
    topic: booking.topic
  });
});

bookingEmitter.on('booking:confirmed', (booking) => {
  recordEvent('BOOKING_CONFIRMED', {
    bookingId: booking._id,
    confirmedAt: booking.confirmedAt
  });
});

bookingEmitter.on('booking:rejected', (booking) => {
  recordEvent('BOOKING_REJECTED', {
    bookingId: booking._id,
    rejectedAt: booking.rejectedAt
  });
});

bookingEmitter.on('booking:cancelled', (booking) => {
  recordEvent('BOOKING_CANCELLED', {
    bookingId: booking._id,
    cancelledBy: booking.cancelledBy,
    cancelReason: booking.cancelReason
  });
});

module.exports = {
  bookingEmitter,
  getEventLogs: () => eventLogs
};
