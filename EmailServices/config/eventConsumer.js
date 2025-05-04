const amqp = require('amqplib');
const {sendEmail} = require('../src/services/sendGridService')
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL
const QUEUE_NAME = 'critical_errors';

const sendEmailController = async(errorMessage, service, timestamp) => {
    const mailOptions = {
        to: 'admin@example.com', // Replace with recipient
        subject: `Critical Error in ${service}`,
        text: `Error: ${errorMessage}\nService: ${service}\nTimestamp: ${timestamp}`,
        html: `<p>Error: ${errorMessage}</p><p>Service: ${service}</p><p>Timestamp: ${timestamp}</p>`,
      };

  const result = await sendEmail(mailOptions.to, mailOptions.subject, mailOptions.text, mailOptions.html);
  console.log('Email sent:', result?.success);
  //res.status(result.success ? 200 : 500).json(result);
};

async function consumeEvents() {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Declare the queue
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Set prefetch to process one message at a time
    channel.prefetch(1);

    console.log('Waiting for critical error events...');

    // Consume messages from the queue
    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          try {
            // Parse the event
            const event = JSON.parse(msg.content.toString());
            const { event: eventType, payload } = event;

            if (eventType === 'critical_error') {
              console.log('Received critical error event:', payload);
              const { error_message, service, timestamp } = payload;

              // Send email
              console.log('Sending email triggered...');
              //await sendEmailController(error_message, service, timestamp);

              // Acknowledge the message
              channel.ack(msg);
            } else {
              console.log('Unknown event type:', eventType);
              channel.ack(msg); // Acknowledge to remove from queue
            }
          } catch (error) {
            console.error('Error processing message:', error.message);
            // Optionally, move to a dead-letter queue instead of acknowledging
            channel.nack(msg, false, false);
          }
        }
      },
      { noAck: false } // Manual acknowledgment
    );

    // Handle connection errors
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err.message);
    });

    connection.on('close', () => {
      console.error('RabbitMQ connection closed, reconnecting...');
      setTimeout(consumeEvents, 5000); // Reconnect after 5 seconds
    });
  } catch (error) {
    console.error('Failed to consume events:', error.message);
    setTimeout(consumeEvents, 5000); // Retry after 5 seconds
  }
}

// Start consuming events
exports.consumeEvents = consumeEvents;