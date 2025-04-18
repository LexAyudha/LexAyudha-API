const multer = require('multer');
const express = require('express');
const router = express.Router();
const pdfParse = require('pdf-parse');

// File filter to allow only PDF files
const pdfFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(pdf)$/i)) {
        req.fileValidationError = 'Only PDF files are allowed!';
        return cb(null, false);
    }
    cb(null, true);
};

// Configure multer for file uploads
const upload = multer({
    fileFilter: pdfFilter,
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

// Middleware to parse PDF content
const parsePdf = async (req, res, next) => {
    if (req.fileValidationError) {
        return res.status(400).json({ error: req.fileValidationError });
    }
    if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
    }
    try {
        const pdfBuffer = req.file.buffer;
        const data = await pdfParse(pdfBuffer);
        req.pdfText = data.text;
        next();
    } catch (error) {
        console.error('Error parsing PDF:', error);
        res.status(500).json({ error: 'Failed to parse PDF' });
    }
};

// Route to handle PDF upload and text extraction
router.post('/', upload.single('pdf'), parsePdf, (req, res) => {
    res.json({ text: req.pdfText });
});

// Export the router
module.exports = router;