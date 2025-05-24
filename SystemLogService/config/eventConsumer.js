const amqp = require('amqplib');
const {logger} = require('../config/logConfig')
require('dotenv').config();
const {publishErrorEvent} = require('./eventBroker.js')

const RABBITMQ_URL = process.env.RABBITMQ_URL
const QUEUE_NAME = 'SYSTEM_LOG';

const sendEmailController = async (errorMessage, service, timestamp) => {
  
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

    console.log('Waiting for logger events...');

    // Consume messages from the queue
    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          try {
            // Parse the event
            const event = JSON.parse(msg.content.toString());
            const { event: eventType, payload } = event;

            if (eventType === 'SYSTEM_LOG') {
              console.log('Received system log event:', payload);
              const { logLevel, logType, logDescription, source, serviceName, timestamp, metadata, error } = payload;
            
              // Send email
              console.log('Logging triggered...');
        
              await logger[logLevel](logDescription, {
                logType: logType,
                source: source,
                serviceName: serviceName,
                timestamp: timestamp,
                metadata: metadata,
                error: {
                    message: error?.message,
                    stack: error?.stack,
                }
              });

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
    await publishErrorEvent('consumeEvents', error.message);
    console.error('Failed to consume events:', error.message);
    setTimeout(consumeEvents, 5000); // Retry after 5 seconds
  }
}

// Start consuming events
exports.consumeEvents = consumeEvents;