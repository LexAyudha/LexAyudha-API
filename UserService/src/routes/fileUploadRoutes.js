const multer = require('multer');
const express = require('express')
const router = express.Router()
const { handleProfileImageUpload, handleCoverImageUpload } = require('../services/userService')

const imageFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(JPG|jpg|jpeg|png|gif)$/)) {
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
        fileSize: 5 * 1024 * 1024, // keep images size < 5 MB
    },
});

router.post('/profilePicture/:id', upload.single('image'), async (req, res) => {
    if (req.fileValidationError) {
        return res.status(400).json({ error: req.fileValidationError });
    }
    await handleProfileImageUpload(req, res);
});

router.post('/coverPicture/:id', upload.single('image'), async (req, res) => {
    if (req.fileValidationError) {
        return res.status(400).json({ error: req.fileValidationError });
    }
    await handleCoverImageUpload(req, res);
});

//Exporting router to be used by the app.js
module.exports = router
