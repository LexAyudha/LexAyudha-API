const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");
//const { performHealthCheck } = require("./utilis/healthCheck");
const { applyRateLimiter } = require("./utilis/rateLimiter");
const app = express();
app.use(cors());

// Perform initial health check
// (async () => {
//   const isHealthy = await performHealthCheck();
//   if (!isHealthy) {
//     console.error(
//       "\n\x1b[38;5;208mWARNING:\x1b[37m Starting gateway with unhealthy services\x1b[0m"
//     );
//   } else {
//     console.log("\n\x1b[38;5;82mINFO:\x1b[37m All services are healthy\x1b[0m");
//   }
// })();

//host.docker.internal
app.use("/api/auth", applyRateLimiter, proxy("http://localhost:8001")); //host.docker.internal:8001
app.use(
  "/api/user",
  applyRateLimiter,
  proxy("http://localhost:8002", { parseReqBody: false })
); //host.docker.internal:8002
app.use(
  "/api/speech",
  applyRateLimiter,
  proxy("http://localhost:8003", { parseReqBody: false })
); //host.docker.internal:8003
app.use(
  "/api/ml",
  applyRateLimiter,
  proxy("http://localhost:8005", { parseReqBody: false })
); //host.docker.internal:8003

//Exporting app to be used by the server.js
module.exports = app;
