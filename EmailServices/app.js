const express = require("express");
const cors = require("cors");
const emailRoutes = require("./src/routes/emailRoutes");
const utilRoutes = require("./src/routes/utilRoutes");
const { consumeEvents } = require("./config/eventConsumer");

const app = express();

app.use(cors());
app.use(express.json());

//routes here
app.use("/", utilRoutes);
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
