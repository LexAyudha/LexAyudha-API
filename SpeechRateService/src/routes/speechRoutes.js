/**
 * @description - Route file responsible for the learner processes
 */

//Requires
const express = require('express')
const router = express.Router()
const { updateSpeechRate, deleteSpeechRate, getSpeechRate, getSpeechAudio} = require('../services/speechService')

//healthCheck route
router.get('/healthCheck', (req, res) => {
  res.status(200).json({ message: 'Speech Rate Service is running' })
})

// Get speech rate of a user
router.get('/:id', async (req, res) => {
  await getSpeechRate(req, res)
})

// Get speech rate of a user
router.post('/tts', async (req, res) => {
  await getSpeechAudio(req, res)
})


//Save updated speech rate
router.patch('/', async (req, res) => {
  await updateSpeechRate(req, res)
})

//Delete speech rate
router.delete('/', async (req, res) => {
  await deleteSpeechRate(req, res)
})


//Exporting router to be used by the app.js
module.exports = router