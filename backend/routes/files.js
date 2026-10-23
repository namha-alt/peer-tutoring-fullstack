const express = require('express');
const router = express.Router();
const { upload, uploadFile, exportCsv, getBufferDemo, getEvents } = require('../controllers/fileController');

router.post('/upload', upload.single('material'), uploadFile);
router.get('/export/csv', exportCsv);
router.get('/buffer-demo', getBufferDemo);
router.get('/events', getEvents);

module.exports = router;
