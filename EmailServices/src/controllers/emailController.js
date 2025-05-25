const { sendEmail } = require("../services/sendGridService");

const sendEmailController = async (req, res) => {
  const { to, subject, text, html, attachments } = req.body;

  if (!to || !subject || !text) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const result = await sendEmail(to, subject, text, html, attachments);
  res.status(result.success ? 200 : 500).json(result);
};

module.exports = { sendEmailController };
