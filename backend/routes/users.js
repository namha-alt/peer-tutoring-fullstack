const express = require('express');
const router = express.Router();
const { getTutors, updateTutorCapacity, getUserStats } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/tutors', getTutors);
router.put('/tutor/capacity', protect, authorize('tutor'), updateTutorCapacity);
router.get('/stats', protect, getUserStats);

module.exports = router;
