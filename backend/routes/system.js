const express = require('express');
const router = express.Router();
const { getHealth, getTraffic, deleteTraffic, getDatabaseStats } = require('../controllers/systemController');

router.get('/health', getHealth);
router.get('/traffic', getTraffic);
router.delete('/traffic', deleteTraffic);
router.get('/db-stats', getDatabaseStats);

module.exports = router;
