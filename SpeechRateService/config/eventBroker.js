const amqp = require('amqplib');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL // Update if using a cloud provider
const QUEUE_NAME = 'critical_errors';

async function publishErrorEvent(errorFunc,errorMessage) {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Declare a durable queue (persists across RabbitMQ restarts)
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Create the event payload
    const event = {
      event: 'critical_error',
      payload: {
        error_message: errorMessage,
        error_function: errorFunc,
        service: 'SpeechRateService',
        timestamp: new Date().toISOString(),
      },
    };

    // Publish the event to the queue
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(event)), {
      persistent: true, // Ensure message persists if RabbitMQ restarts
    });

    console.log('Published critical error event:', event);

    // Clean up
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Failed to publish error event:', error.message);
  }
}

exports.publishErrorEvent = publishErrorEvent;


