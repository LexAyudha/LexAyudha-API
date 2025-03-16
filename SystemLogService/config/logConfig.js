/**
 * @file - logConfig.js
 * @description - This class provides the logger object for the entire system to log the information
 */

const { createLogger, transports, format } = require('winston');

// Creating a logger with singleton design pattern
class Logger {
  constructor() {
    if (Logger.instance) {
      return Logger.instance;
    }

    this.logger = createLogger({
      level: 'info',
      format: this.getLogFormat(),
      transports: [
        new transports.Console(), // Log to the console
        new transports.File({ filename: 'error.log', level: 'error' }) // Log errors to a file
      ]
    });

    Logger.instance = this;
  }

  getLogFormat() {
    return format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.printf(({ level, message, timestamp }) => {
        return `${timestamp} ${level}: ${message}`;
      })
    );
  }

  log(level, message) {
    this.logger.log(level, message);
  }

  info(message) {
    this.logger.info(message);
  }

  warn(message) {
    this.logger.warn(message);
  }

  critical(message) {
    this.logger.log('critical', message);
  }

  error(message) {
    this.logger.error(message);
  }

  debug(message) {
    this.logger.debug(message);
  }
}

const logger = new Logger();
Object.freeze(logger);

module.exports = logger;