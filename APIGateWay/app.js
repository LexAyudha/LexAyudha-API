const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");
const { applyRateLimiter } = require("./utilis/rateLimiter");
const { authenticateRequest } = require("./utilis/requestAuthenticator");
const app = express();
app.use(cors());
app.use(express.json());

//host.docker.internal
app.use("/api/auth", applyRateLimiter, proxy("http://localhost:8001")); //host.docker.internal:8001
app.use("/api/user", applyRateLimiter, proxy("host.docker.internal:8002"));
app.use("/api/speech", applyRateLimiter, authenticateRequest,proxy("host.docker.internal:8003"));
app.use("/api/dyslexic/lessons", applyRateLimiter, authenticateRequest,proxy("host.docker.internal:8004"));
//Exporting app to be used by the server.js
module.exports = app;
