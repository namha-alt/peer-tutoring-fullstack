const express = require('express');
const router = express.Router();
const { getAvailableSlots, getMySlots, toggleSlot, deleteSlot } = require('../controllers/slotController');
const { protect, authorize } = require('../middleware/auth');

router.get('/available', getAvailableSlots);
router.get('/my', protect, authorize('tutor'), getMySlots);
router.post('/toggle', protect, authorize('tutor'), toggleSlot);
router.delete('/:id', protect, authorize('tutor'), deleteSlot);

module.exports = router;
