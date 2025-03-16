/**
 * @description - This file defines the authentication model for mongoDB
 */

const mongoose = require("mongoose");
const billingPeriods = ['monthly', 'yearly'];

// Define the schema for badges
const badgeSchema = new mongoose.Schema({
  badgeId: { type: String, required: false },
  badgeDate: { type: Date, required: false },
}, { _id: false });

// Schema for authentication
const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true },
    proPic: { type: String, required: false },
    coverPic: { type: String, required: false },
    password: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    latestSessionID: { type: String, required: false },
    LatestAchievementID: { type: String, required: false },
    MyPlanId: { type: String, required: false },
    isFirstTimeUser: { type: Boolean, required: true, default: true },
    speechRate: { type: Number, required: false },
    MyBadges: [badgeSchema],
    billingPeriod: { type: String, required: false, enum: billingPeriods, default: 'monthly' },
    myPoints: {
      'Dyslexia': { type: Number, required: false, default: 0 },
      'TouchMath': { type: Number, required: false, default: 0 },
    }
  },
  { collection: "users" }
);

userSchema.index({ userName: 1, email: 1 }, { unique: true });

// Creating mongoose model using Schema
const userBaseModel = mongoose.model("userModel", userSchema);

// Exporting model to be used by authController.js
module.exports = userBaseModel;