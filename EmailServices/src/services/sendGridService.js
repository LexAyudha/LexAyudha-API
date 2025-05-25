const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(
  "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"
);

const sendEmail = async (to, subject, text, html) => {
  const msg = {
    to,
    from: "lexayudha.dev@fivermail.com",
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response ? error.response.body : error
    );
    return { success: false, message: "Email sending failed" };
  }
};

module.exports = { sendEmail };
