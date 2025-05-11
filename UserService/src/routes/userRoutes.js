/**
 * @description - Route file responsible for the learner processes
 */

//Requires
const express = require('express')
const router = express.Router()
const { updateUser, deleteUser, getUserById, getUserAllDetails, getUsersList } = require('../services/userService')

//healthCheck route
router.get('/healthCheck', (req, res) => {
  res.status(200).json({ message: 'User Service is running' })
})

router.get('/:id', async(req,res) => {
  await getUserById(req,res)
})


router.get('/list/:email', async(req,res) => {
  await getUsersList(req,res)
})


router.get('/allDetails/:id', async(req,res) => {
  await getUserAllDetails(req,res)
})
//Save preferences
router.patch('/:id', async (req, res) => {
  await updateUser(req, res)
})

//Delete learner
router.delete('/', async (req, res) => {
  await deleteUser(req, res)
})


//Exporting router to be used by the app.js
module.exports = router