const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processSpeechRate } = require('../services/speechService');

// Configure multer for file uploads with file type validation
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [ 'audio/wav'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log(`Invalid file type: ${file.mimetype}`);
    cb(new Error('Invalid file type. Only audio files are allowed.'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Calculate and save speech rate
router.post('/:id', upload.array('file'), async (req, res) => {
  await processSpeechRate(req, res);
});


// Exporting router to be used by the app.js
module.exports = router;