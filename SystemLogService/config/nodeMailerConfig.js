import nodemailer from 'nodemailer';
const recipientEmail = 'thalangamat@gmail.com'
const { publishErrorEvent } = require('../eventPublisher');

export default async function mailService(payload) {

    const { logType, logDescription, logDate } = payload;

    // Create a transporter using SMTP
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use TLS
        auth: {
            user: "falconbusiness123@gmail.com", //Gmail address
            pass: "qgdl biep bdxb dkjp" // Gmail app password
        },
    });

    try {
        // Send email
        await transporter.sendMail({
            from: '"LexAyudha System Logs : " <falconbusiness123@gmail.com>',
            to: recipientEmail,
            subject: "From LexAyudha System Logs - There is an issue!",
            text: `
          Type: ${logType}
          Message: ${logDescription}
          Date: ${logDate}
        `,
        html: `
            <h1>System Log Notification</h1>
            <p><strong>Type:</strong> ${logType}</p>
            <p><strong>Description:</strong> ${logDescription}</p>
            <p><strong>Date:</strong> ${logDate}</p>
        `,
        });

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        await publishErrorEvent('mailService', error?.message);
        console.error(error);
        res.status(500).json({ message: 'Error sending email' });
    }

}