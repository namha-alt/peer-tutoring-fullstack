const express = require('express');
const router = express.Router();
const { getSystemInternals, getAsyncDemo } = require('../controllers/internalController');

router.get('/system', getSystemInternals);
router.get('/async-demo', getAsyncDemo);

module.exports = router;
