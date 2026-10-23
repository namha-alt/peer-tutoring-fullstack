const express = require('express');
const router = express.Router();
const { getHealth, seedDatabase } = require('../controllers/systemController');

router.get('/health', getHealth);
router.get('/seed', seedDatabase);
router.post('/seed', seedDatabase);

module.exports = router;
