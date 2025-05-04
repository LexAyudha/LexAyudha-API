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
    logType: { 
      type: String, 
      required: true,
      enum: [
        'SYSTEM',      // OS-level events, hardware issues, system processes
        'APPLICATION', // Events from specific applications running on the server
        'ACCESS',      // Who accessed the server, when, and what resources they used
        'ERROR',       // Application and system failures with debugging information
        'SECURITY',    // Authentication attempts, permission changes, suspicious activities
      ]
    },
    logDescription: { type: String, required: true },
    logDate: { type: Date, required: true, default: Date.now },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'],
      default: 'INFO'
    },
    source: { type: String }, // Application, service, or component that generated the log
  }, { 
    collection: 'systemLogs',
    timestamps: true // Adds createdAt and updatedAt fields
  });

//Creating mongoose model using Schema
const logModel = mongoose.model('logBaseModel', logBaseSchema)

//Exporting model to be used by logController.js
module.exports = logModel