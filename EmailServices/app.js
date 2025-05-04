const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const emailRoutes = require("./src/routes/emailRoutes");
const {consumeEvents} = require('./config/eventConsumer')

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

//routes here
app.use("/email", emailRoutes);

//Start consuming events from the event broker
consumeEvents()
  .then(() => {
    console.log("Event consumer started successfully.");
  })
  .catch((error) => {
    console.error("Error starting event consumer:", error);
  });


//Exporting app to be used by the server.js
module.exports = app;
