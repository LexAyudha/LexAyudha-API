const { updateSpeech, getSpeech, insertSpeech } = require('../controllers/speechController')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Set the destination for uploaded files

exports.insertSpeechRate = async (req, res) => {
  upload.single('speechFile')(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading file' });
    }

    const speechFile = req.file;
    const userId = req?.body?.id;

    const response = await insertSpeech(userId,speechFile);
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