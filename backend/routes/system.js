const express = require('express');
const router = express.Router();
const { getHealth, getTraffic, deleteTraffic, getDatabaseStats, seedDatabase } = require('../controllers/systemController');

router.get('/health', getHealth);
router.get('/traffic', getTraffic);
router.delete('/traffic', deleteTraffic);
router.get('/db-stats', getDatabaseStats);
router.get('/seed', seedDatabase);
router.post('/seed', seedDatabase);

module.exports = router;
