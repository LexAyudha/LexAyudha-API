/**
 * @description - This file defines the trainingSession model for mongoDB
 */

const mongoose = require("mongoose");

// Schema for authentication
const trainingSchema = new mongoose.Schema(
  {
    startTime: { type: Date, required: true },
    startDate: { type: Date, required: true },
    endTime: { type: Date, required: false },
    userId: { type: String, required: true },
    sessionType: { type: String, required: true },
    accumilatedPoints: { type: Number, required: false },
  },
  { collection: "trainingSessions" }
);

// Pre-save hook to modify startTime
trainingSchema.pre('save', function (next) {
  const startTime = this.startTime;
  this.startTime = new Date(
    startTime.getFullYear(),
    startTime.getMonth(),
    startTime.getDate(),
    startTime.getHours(),
    startTime.getMinutes(),
    0, // Set seconds to 0
    0  // Set milliseconds to 0
  );
  next();
});

// Creating mongoose model using Schema
const trainingModel = mongoose.model("trainingSchema", trainingSchema);

// Exporting model to be used by authController.js
module.exports = trainingModel;