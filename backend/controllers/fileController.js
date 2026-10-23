const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Readable } = require('stream');
const Booking = require('../model/Booking');
const { getEventLogs } = require('../events/bookingEmitter');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, PNG, and JPG are allowed.'), false);
  }
};

exports.upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter
});

// @desc    Upload study material / assignment file
// @route   POST /api/files/upload
// @access  Public
exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a file to upload'
    });
  }

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully via Multer',
    file: {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      sizeBytes: req.file.size,
      mimetype: req.file.mimetype,
      fileUrl: `/uploads/${req.file.filename}`
    }
  });
};

// @desc    Stream sessions export as CSV using Node.js Streams & Buffers
// @route   GET /api/files/export/csv
// @access  Public
exports.exportCsv = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email')
      .sort({ createdAt: -1 });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="SlotSync_Sessions_Report.csv"');

    async function* generateCsvChunks() {
      yield Buffer.from('ID,Date,Day,StartHour,EndHour,Student,Tutor,Topic,Status,RequestedAt\n');

      for (const b of bookings) {
        const studentName = b.studentId ? b.studentId.name : 'Unknown';
        const tutorName = b.tutorId ? b.tutorId.name : 'Unknown';
        const topic = `"${(b.topic || '').replace(/"/g, '""')}"`;
        const line = `${b._id},${b.date},${b.day},${b.startHour}:00,${b.endHour}:00,"${studentName}","${tutorName}",${topic},${b.status},${b.requestedAt ? b.requestedAt.toISOString() : ''}\n`;
        yield Buffer.from(line);
      }
    }

    const stream = Readable.from(generateCsvChunks());
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
};

// @desc    Demonstrate Node.js Buffers manipulation
// @route   GET /api/files/buffer-demo
// @access  Public
exports.getBufferDemo = (req, res) => {
  const text = req.query.text || 'SlotSync Node.js & MongoDB Architecture';
  const buf = Buffer.from(text, 'utf-8');
  const base64Str = buf.toString('base64');
  const hexStr = buf.toString('hex');
  const headerBuf = Buffer.from('[HEADER:SLOTSYNC] ');
  const combined = Buffer.concat([headerBuf, buf]);

  res.status(200).json({
    success: true,
    topic: 'Buffers & Binary Data (Topic 34)',
    originalText: text,
    bufferLengthBytes: buf.length,
    byteValuesSnippet: Array.from(buf.slice(0, 10)),
    hexRepresentation: hexStr,
    base64Encoded: base64Str,
    concatenatedBufferText: combined.toString('utf-8')
  });
};

// @desc    Get live EventEmitter logs
// @route   GET /api/files/events
// @access  Public
exports.getEvents = (req, res) => {
  res.status(200).json({
    success: true,
    topic: 'EventEmitter & Audit Logging (Topic 34)',
    events: getEventLogs()
  });
};
