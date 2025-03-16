const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text, html) => {
  const msg = {
    to,
    from: process.env.SENDGRID_SENDER_EMAIL,
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
