const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const userRoutes = require("./src/routes/userRoutes");
const fileUploadRoutes = require("./src/routes/fileUploadRoutes");


connectDB();

const app = express();

app.use(cors());
//file handling routes here
app.use("/uploads", fileUploadRoutes);

app.use(express.json());

//json routes here
app.use("/", userRoutes);


//Exporting app to be used by the server.js
module.exports = app;
