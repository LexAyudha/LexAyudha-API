// /**
//  * @description - Initiating HTTP server and listning to incoming http requests
//  */

// //Imports and Requires
// const http = require("http");
// const app = require("./app");
// const express = require("express");
// const cors = require("cors");

// require("dotenv").config();
// // Increase JSON payload limit to 50MB
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use(cors());

// console.log("Server Js executing... Initiating HTTP server");
// const port = process.env.PORT;

// //Creates HTTP server
// const server = http.createServer(app);

// //Server then  listen to the port (8007)
// server.listen(port, () => {
//   console.log(`EmailService Server is running on port ${port}`);
// });

const http = require("http");
const app = require("./app");
require("dotenv").config();

console.log("Server Js executing... Initiating HTTP server");

const port = process.env.PORT || 8007;

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`EmailService Server is running on port ${port}`);
});
