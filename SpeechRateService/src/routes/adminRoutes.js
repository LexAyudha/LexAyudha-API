/**
 * @description - Route file responsible for the admin processes
 */

//Requires
const express = require('express')
const router = express.Router()
const { addNewUser } = require('../services/adminService')

//Save preferences
router.post('/', async(req,res) => {
    await addNewUser(req,res)
})

//Exporting router to be used by the app.js
module.exports = router