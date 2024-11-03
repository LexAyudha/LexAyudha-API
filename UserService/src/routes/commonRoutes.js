/**
 * @description - Route file responsible for the learner processes
 */

//Requires
const express = require('express')
const router = express.Router()
const { updateUser, deleteUser, getAllUserByType, getUserById } = require('../services/commonService')

router.get('/:id', async (req, res) => {
  await getAllUserByType(req, res)
})

router.get('/user/:id', async(req,res) => {
  await getUserById(req,res)
})

//Save preferences
router.patch('/', async (req, res) => {

  await updateUser(req, res)
})

//Delete learner
router.delete('/', async (req, res) => {
  await deleteUser(req, res)
})


//Exporting router to be used by the app.js
module.exports = router