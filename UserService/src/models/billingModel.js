/**
 * @description - This file defines the billings model for mongoDB
 */

const mongoose = require("mongoose");


// Schema for authentication
const billingSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    userId: { type: String, required: true },
    invoiceId: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    billingPeriod: { type: String, required: true },
  },
  { collection: "billings" }
);

// Creating mongoose model using Schema
const billingModel = mongoose.model("billingSchema", billingSchema);

// Exporting model to be used by authController.js
module.exports = billingModel;