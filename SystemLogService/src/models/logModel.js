/**
 * @description - This file defines the base log model for mongoDB
 */
const mongoose = require('mongoose');

// System-wide log types
const LogType = {
  SYSTEM: 'SYSTEM',         // OS-level events, hardware issues, system processes
  APPLICATION: 'APPLICATION', // Events from specific applications running on the server
  ACCESS: 'ACCESS',         // Who accessed the server, when, and what resources they used
  ERROR: 'ERROR',           // Application and system failures with debugging information
  SECURITY: 'SECURITY',     // Authentication attempts, permission changes, suspicious activities
};

// Log severity levels that match Winston's levels
const LogLevel = {
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
  WARNING: 'WARNING',
  INFO: 'INFO',
  HTTP: 'HTTP',
  VERBOSE: 'VERBOSE',
  DEBUG: 'DEBUG',
  SILLY: 'SILLY'
};

const logBaseSchema = new mongoose.Schema({
  // Log metadata
  logType: {
    type: String,
    required: true,
    enum: Object.values(LogType)
  },
  logLevel: {
    type: String,
    required: true,
    enum: Object.values(LogLevel)
  },
  logDescription: { 
    type: String, 
    required: true 
  },
  logDate: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  
  // Source information
  source: { 
    type: String,
    required: true
  },
  
  // Error-specific information
  stack: { 
    type: String 
  },
  errorMessage: { 
    type: String 
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  collection: 'systemLogs',
  timestamps: true // Adds createdAt and updatedAt fields
});

// Creating mongoose model using Schema
const logModel = mongoose.model('logBaseModel', logBaseSchema);

// Export constants and model
module.exports = {
  LogType,
  LogLevel,
  logModel
};