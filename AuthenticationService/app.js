const express = require("express");
const app = express();
const appRouter = express.Router();
const cors = require("cors");
const connectDB = require("./config/database");


//Requires - Route classes
const authRoutes = require("./src/routes/authRoutes");

connectDB();

app.use(cors());

app.use(express.json());

app.use("/", authRoutes);

//Global Exception Handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR at Authentication Server:`, err.stack || err);

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

//Exporting app to be used by the server.js
module.exports = app;
