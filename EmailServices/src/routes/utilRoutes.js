const express = require("express");


const router = express.Router();

router.get("/healthCheck", (req, res) => {
  res.status(200).json({ message: "Email Service is running" });
});

module.exports = router;
