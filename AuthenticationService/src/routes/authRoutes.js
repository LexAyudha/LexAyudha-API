/**
 * @description - Route file responsible for the authentication process
 */

//Requires
const express = require("express");
const router = express.Router();
const { register, login, logout, } = require("../services/authService");
const {generateNewAccessToken} = require('../services/jwtService')

router.post("/register", async (req, res) => {
  await register(req, res);
});

router.post("/login", async (req, res) => {
  await login(req, res);
});

router.post("/logout", async (req, res) => {
  await logout(req, res);
});

router.get('/'), async(req,res) => {
  generateNewAccessToken(req,res)
}

//Exporting router to be used by the app.js
module.exports = router;
