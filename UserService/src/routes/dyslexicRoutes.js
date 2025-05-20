/**
 * @description - Route file responsible for the learner processes
 */

//Requires
const express = require('express')
const router = express.Router()

const { getGeneratedSentences, generateQuizeSentences } = require('../services/dyslexicService')

//Get sentences
router.get('/', async(req,res) => {
 
  await getGeneratedSentences(req,res)
  
})

//Get quiz sentences
router.get('/quiz', async(req,res) => { 
   await generateQuizeSentences(req,res)
})


//Exporting router to be used by the app.js
module.exports = router