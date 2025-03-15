/**
 * @description - This file defines the badges model for mongoDB
 */

const mongoose = require("mongoose");


// Schema for authentication
const badgeSchema = new mongoose.Schema(
  {
    badgeName: { type: String, required: true },
    image: { type: String, required: false },
    requiredPoints: { type: Number, required: true },
  },
  { collection: "badges" }
);

// Creating mongoose model using Schema
const badgesModel = mongoose.model("badgeSchema", badgeSchema);

// Exporting model to be used by authController.js
module.exports = badgesModel;