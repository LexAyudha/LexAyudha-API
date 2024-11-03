/**
 * @description - This file defines the base user model for mongoDB
 */

const mongoose = require('mongoose')

const UserRole = {
    user: "user",
    INSTRUCTOR: "instructor",
    ADMIN: "admin",
  }

const userBaseSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: false },
    password: { type: String, required: true },
    mobileNo: { type: String, required: false },
    userRole: {
      type: String,
      required: false,
      enum: Object.values(UserRole),
      default: "learner",
    }, //Roles : learner, instructor, admin
    userInterests: { type: [String], required: false }
  }, { collection: 'authUsers'})

//Creating mongoose model using Schema
const userBaseModel = mongoose.model('userBaseModel', userBaseSchema)

//Exporting model to be used by userController.js
module.exports = userBaseModel