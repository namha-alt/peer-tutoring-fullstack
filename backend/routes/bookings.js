const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, updateBookingStatus, cancelBooking } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('student'), createBooking);
router.get('/my', protect, getMyBookings);
router.patch('/:id/status', protect, authorize('tutor'), updateBookingStatus);
router.post('/:id/cancel', protect, cancelBooking);

module.exports = router;
