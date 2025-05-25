/**
 * @description - Route file responsible for the authentication process
 */

//Requires
const express = require("express");
const router = express.Router();
const { register, login, generateOTP } = require("../services/authService");
const { generateNewAccessToken } = require("../services/jwtService");

router.post("/register", async (req, res) => {
  await register(req, res);
});

router.post("/login", async (req, res) => {
  await login(req, res);
});

router.get("/otp", async (req, res) => {
  await generateOTP(req, res);
});

router.get("/", async (req, res) => {
  generateNewAccessToken(req, res);
});

router.get("/healthCheck", (req, res) => {
  res.status(200).json({ message: "Authentication Service is running" });
});

//Exporting router to be used by the app.js
module.exports = router;
