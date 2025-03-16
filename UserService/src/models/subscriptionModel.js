/**
 * @description - This file defines the SubscriptionPlans model for mongoDB
 */

const mongoose = require("mongoose");


// Schema for authentication
const subscriptionSchema = new mongoose.Schema(
  {
    planName: { type: String, required: true },
    amount: { type: String, required: false },
    monthlyPrice: { type: Number, required: true },
    yearlyPrice: { type: Number, required: true },
    PermissionStatus: { type: Number, required: true },
  },
  { collection: "subscriptionPlans" }
);

// Creating mongoose model using Schema
const subsModel = mongoose.model("subscriptionSchema", subscriptionSchema);

// Exporting model to be used by authController.js
module.exports = subsModel;