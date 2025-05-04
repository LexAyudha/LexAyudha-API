const multer = require('multer');
const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const { handleProfileImageUpload, handleCoverImageUpload } = require('../services/userService');
const {publishErrorEvent} = require('../../config/eventBroker')

const imageFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(JPG|jpg|jpeg|png|gif|webp)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(null, false);
    }
    cb(null, true);
};

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    fileFilter: imageFilter,
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // Allow larger uploads (10MB) which will be compressed
    },
});

// Middleware to process images
const processImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        // Process image with sharp
        const processedImageBuffer = await sharp(req.file.buffer)
            .webp({ quality: 80 }) // Convert to WebP format with 80% quality
            .resize({ 
                width: 1200, // Set a reasonable max width
                height: 1200, // Set a reasonable max height
                fit: 'inside', // Maintain aspect ratio
                withoutEnlargement: true // Don't enlarge smaller images
            })
            .toBuffer();

        // Check file size and adjust quality if needed
        let quality = 80;
        let outputBuffer = processedImageBuffer;
        
        // If image is still larger than 500KB (512000 bytes), reduce quality until it's below the target size
        while (outputBuffer.length > 512000 && quality > 10) {
            quality -= 10;
            outputBuffer = await sharp(req.file.buffer)
                .webp({ quality })
                .resize({ 
                    width: 1200,
                    height: 1200,
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toBuffer();
        }

        // Replace the original buffer with our processed one
        req.file.buffer = outputBuffer;
        req.file.mimetype = 'image/webp';
        
        // Add .webp extension if a new filename is needed downstream
        if (req.file.originalname) {
            const fileNameParts = req.file.originalname.split('.');
            fileNameParts.pop(); // Remove old extension
            req.file.originalname = `${fileNameParts.join('.')}.webp`;
        }
        
        next();
    } catch (error) {
        await publishErrorEvent('processImage',error?.message);
        return res.status(500).json({ error: 'Error processing image' });
    }
};

router.post('/profilePicture/:id', upload.single('image'), processImage, async (req, res) => {
    if (req.fileValidationError) {
        return res.status(400).json({ error: req.fileValidationError });
    }
    await handleProfileImageUpload(req, res);
});

router.post('/coverPicture/:id', upload.single('image'), processImage, async (req, res) => {
    if (req.fileValidationError) {
        return res.status(400).json({ error: req.fileValidationError });
    }
    await handleCoverImageUpload(req, res);
});

// Exporting router to be used by the app.js
module.exports = router;