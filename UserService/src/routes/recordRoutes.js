/**
 * @description - Route file responsible for the record processes
 */

//Requires
const express = require('express')
const router = express.Router()

const { saveRecords, getRecords } = require('../services/recordService')

//save record
router.post('/', async(req,res) => {
 
  await saveRecords(req,res)
  
})

//Get quiz sentences
router.get('/:id', async(req,res) => { 
   await getRecords(req,res)
})


//Exporting router to be used by the app.js
module.exports = router