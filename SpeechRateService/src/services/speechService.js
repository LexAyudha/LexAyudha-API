const { updateSpeech, getSpeech, insertSpeech } = require('../controllers/speechController')
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const HttpStatus = require('../enums/httpStatus');

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

exports.insertSpeechRate = async (req, res) => {
  upload.single('speechFile')(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading file' });
    }

    const speechFile = req.file;
    const userId = req?.body?.id;

    const response = await insertSpeech(userId, speechFile);
    res.status(response.status).json(response.body);
  });
}

exports.updateSpeechRate = async (req, res) => {
  const payload = req?.body;
  const id = payload?.id;
  const speechRate = payload?.speechRate;

  const response = await updateSpeech(id, speechRate);
  res.status(response.status).json(response.body);
}

exports.deleteSpeechRate = async (req, res) => {
  const payload = req?.body;
  const id = payload?.id;
  const speechRate = null;

  //Setting speech rate to null instead of deleting the speech rate.
  const response = await updateSpeech(id, speechRate);

  res.status(response.status).json(response.body);
}

exports.getSpeechRate = async (req, res) => {
  const id = req?.params?.id;
  const response = await getSpeech(id);
  res.status(response.status).json(response.body);
}

exports.processSpeechRate = async (req, res) => {
  
  const userId = req?.params?.id;
  const files = req?.files;
  
  if (!files || files?.length === 0) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'No speech files uploaded' });
  }

  try {
    let totalSpeechRate = 0;
    const tempPath = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }

    for (const file of files) {
      const tempFilePath = path.join(tempPath, file.originalname);
      fs.writeFileSync(tempFilePath, file.buffer);

      const formData = new FormData();

      formData.append('file', fs.readFileSync(tempFilePath),{
        filename: file.originalname,
        contentType: file.mimetype,
        knownLength: file.size
      });

      const flaskResponse = await axios.post('http://0.0.0.0:8005/api/v1/predict/speech', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      if (flaskResponse.status !== 200) {
        throw new Error('Failed to process speech rate');
      }
      console.log(`Speech prediction for ${file?.originalname}: ${flaskResponse?.data?.prediction}`)
      totalSpeechRate += flaskResponse?.data?.prediction;
    }
    
    let averageSpeechRate = totalSpeechRate / files?.length;
    averageSpeechRate = parseFloat(averageSpeechRate.toFixed(2)); // Round to two decimal places
    console.log(`Calculated average Speech rate : ${averageSpeechRate}`)

    if (isNaN(averageSpeechRate)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Could not calculate valid speech rate'
      });
    }
    // Update the user service API with the calculated average speech rate
    const userServiceResponse = await axios.patch(`http://127.0.0.1:8000/api/user/${userId}`, {
      speechRate: averageSpeechRate,
    });

    if (userServiceResponse.status !== 200) {
      throw new Error('Failed to update speech rate in user service');
    }

    res.status(HttpStatus.OK).json({ message: 'Speech rate processed and updated successfully', averageSpeechRate });
  } catch (error) {
    console.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};