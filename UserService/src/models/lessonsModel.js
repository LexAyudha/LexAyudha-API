/**
 * @description - This file defines the dyslexic lessons model for mongoDB
 */

const mongoose = require("mongoose");

// Schema for dyslexic lessons
const dyslexicLessonsSchema = new mongoose.Schema(
  {
    
    userId: { 
      type: String, 
      required: true,
      index: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    complexity: { 
      type: Number, 
      required: true,
      min: 1,
      max: 10 
    },
    description: { 
      type: String, 
      required: false 
    },
    example: { 
      type: String, 
      required: false 
    },
    chromaticTheme: { 
      type: String, 
      required: true 
    },
    colorTheme: { 
      type: String, 
      required: true 
    },
    chapters: [{ 
      type: String, 
      required: true 
    }]
  },
  { 
    collection: "dyslexicLessons",
    timestamps: true  // Adds createdAt and updatedAt fields
  }
);

// Creating mongoose model using Schema
const lessonsModel = mongoose.model("dyslexicLessonsSchema", dyslexicLessonsSchema);

// Exporting model to be used by lessonsController.js
module.exports = lessonsModel;