/**
 * @description - Route file responsible for the learner processes
 */

//Requires
const express = require('express')
const router = express.Router()
const { createLog, deleteLog, getLog, getAllLogs, getFilteredLogs } = require('../services/logService')

//healthCheck route
router.get('/healthCheck', (req, res) => {
  res.status(200).json({ message: 'System Log Service is running' })
})

// Get logs by id
router.get('/:id', async (req, res) => {
  await getLog(req, res)
})

//Get all logs
router.get('/', async (req, res) => {
  await getAllLogs(req, res)
})  

//get filtered logs
router.get('/filter', async (req, res) => {
  await getFilteredLogs(req, res)
})

//insert log
router.post('/', async (req, res) => {
  await createLog(req, res)
})

//Delete speech rate
router.delete('/', async (req, res) => {
  await deleteLog(req, res)
})


//Exporting router to be used by the app.js
module.exports = router