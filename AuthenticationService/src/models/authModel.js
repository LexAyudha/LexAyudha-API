/**
 * @description - This file defines the authentication model for mongoDB
 */

const mongoose = require("mongoose");
// Define enums for user roles
const UserRole = {
  LEARNER: "learner",
  PARENT: "parent",
  ADMIN: "admin",
};
//Schema for authentication
const authSchema = new mongoose.Schema(
  {
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
  },
  { collection: "authUsers" }
);

//Creating mongoose model using Schema
const authModel = mongoose.model("authModel", authSchema);

//Exporting model to be used by authController.js
module.exports = authModel;
