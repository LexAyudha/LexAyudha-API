const mongoose = require("mongoose");
require('dotenv').config();
const {publishErrorEvent} = require('./eventBroker.js')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected : ${conn.connection.host} 😎`);
  } catch (error) {
    await publishErrorEvent('connectDB',error?.message);
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
