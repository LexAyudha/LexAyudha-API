const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const userRoutes = require("./src/routes/userRoutes");
const lessonsRoutes = require("./src/routes/lessonsRoutes");
const dyslexicRoutes = require("./src/routes/dyslexicRoutes");
const fileUploadRoutes = require("./src/routes/fileUploadRoutes");
const pdfRoutes = require("./src/routes/pdfRoutes");
const recordRoutes = require('./src/routes/recordRoutes')


connectDB();

const app = express();

app.use(cors());
//file handling routes here
app.use("/uploads", fileUploadRoutes);

app.use(express.json());

//json routes here
app.use("/records", recordRoutes)
app.use("/pdf-extract", pdfRoutes)
app.use("/dyslexic", dyslexicRoutes)
app.use("/lessons", lessonsRoutes)
app.use("/", userRoutes);


//Global Exception Handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR at User Server:`, err.stack || err);

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});
//Exporting app to be used by the server.js
module.exports = app;
