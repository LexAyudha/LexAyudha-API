const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const logRoutes = require("./src/routes/logRoutes");
const { consumeEvents } = require("./config/eventConsumer");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

//routes here
app.use("/", logRoutes);

// consumeEvents();

//Global Exception Handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR at System Log Server:`, err.stack || err);

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});
//Exporting app to be used by the server.js
module.exports = app;
