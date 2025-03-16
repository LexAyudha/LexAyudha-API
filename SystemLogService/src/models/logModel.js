/**
 * @description - This file defines the base user model for mongoDB
 */

const mongoose = require('mongoose')

const UserRole = {
    user: "user",
    INSTRUCTOR: "instructor",
    ADMIN: "admin",
  }

const logBaseSchema = new mongoose.Schema({

    logType: { type: String, required: true },
    logDescription: { type: String, required: true },
    logDate: { type: Date, required: true },
  }, { collection: 'systemLogs'})

//Creating mongoose model using Schema
const logModel = mongoose.model('logBaseModel', logBaseSchema)

//Exporting model to be used by logController.js
module.exports = logModel