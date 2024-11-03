const express = require("express");
const app = express();
const appRouter = express.Router();
const cors = require("cors");
const connectDB = require("./config/database");

//Requires - Route classes
const authRoutes = require("./src/routes/authRoutes");

connectDB.getInstance();

app.use(cors());

app.use(express.json());

app.use("/", authRoutes);

//Exporting app to be used by the server.js
module.exports = app;
