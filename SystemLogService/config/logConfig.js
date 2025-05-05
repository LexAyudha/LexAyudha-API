/**
 * @file - logConfig.js
 * @description - This class provides the logger object for the entire system to log information
 * to both files and MongoDB database
 */

const { createLogger, transports, format } = require('winston');
const { LogType, LogLevel, logModel } = require('../src/models/logModel.js'); // Import log model and types

// MongoDB transport for Winston (requires winston-mongodb package)
// If you don't have winston-mongodb installed, run: npm install winston-mongodb
let MongoTransport;
try {
  MongoTransport = require('winston-mongodb').MongoDB;
} catch (error) {
  console.warn('winston-mongodb not installed. MongoDB logging disabled.');
}

// Creating a logger with singleton design pattern
class Logger {
  constructor() {
    if (Logger.instance) {
      return Logger.instance;
    }

    // Define custom logging levels with numeric priorities that match MongoDB model
    const customLevels = {
      levels: {
        error: 0,       // Highest priority
        critical: 1,    // Second highest priority
        warning: 2,
        info: 3,
        http: 4,
        verbose: 5,
        debug: 6,
        silly: 7        // Lowest priority
      },
      // Colors for console output
      colors: {
        error: 'red',
        critical: 'magenta',
        warning: 'yellow',
        info: 'green',
        http: 'cyan',
        verbose: 'blue',
        debug: 'gray',
        silly: 'gray'
      }
    };
    
    // Add colors to Winston format
    format.colorize().addColors(customLevels.colors);

    // Create transport array starting with file and console
    const logTransports = [
      new transports.Console(), // Log to the console
      new transports.File({ filename: 'LexAyudha_Error_Logs.log', level: 'error' }), // Log errors to a file
      new transports.File({ filename: 'LexAyudha_System_Logs.log' }) // Log all levels to a combined file
    ];

    // Add MongoDB transport if available
    if (MongoTransport) {
      // Get MongoDB connection string from environment or use default
      const mongoUri = process.env.MONGO_LOG_URI || 'mongodb://localhost:27017/logs';
      
      logTransports.push(
        new MongoTransport({
          db: mongoUri,
          collection: 'systemLogs',
          storeHost: true,
          options: {
            useUnifiedTopology: true
          },
          // Transform Winston log data to match our MongoDB schema
          metaKey: 'metadata',
          format: format.metadata()
        })
      );
    }
    
    this.logger = createLogger({
      levels: customLevels.levels,
      level: process.env.LOG_LEVEL || 'info',
      format: this.getLogFormat(),
      transports: logTransports
    });

    // Register error handler
    this.logger.on('error', (error) => {
      console.error('Logger error:', error);
    });

    // Default log type (can be overridden in individual log calls)
    this.defaultLogType = LogType.APPLICATION;
    
    Logger.instance = this;
  }

  getLogFormat() {
    return format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }), // Include stack traces for errors
      format.splat(), // Enable string interpolation
      format.colorize({ all: true }), // Add colors to console output
      format.printf(({ level, message, timestamp, stack, ...metadata }) => {
        // Create a standardized, readable log format with descriptive level names
        const levelName = level.toUpperCase().padEnd(8); // Ensure consistent width
        if (stack) {
          return `${timestamp} [${levelName}] ${message}\n${stack}`;
        }
        return `${timestamp} [${levelName}] ${message}`;
      })
    );
  }

  /**
   * Save log to MongoDB directly (bypassing Winston)
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {object} options - Additional options
   * @returns {Promise} - Promise resolving to saved log document
   */
  async saveToMongo(level, message, options = {}) {
    try {
      const {
        logType = this.defaultLogType,
        source = 'LexAyudha',
        error = null,
        metadata = {}
      } = options;

      const logData = {
        logType,
        logLevel: level.toUpperCase(),
        logDescription: message,
        logDate: new Date(),
        source,
        metadata
      };

      // Add error information if provided
      if (error instanceof Error) {
        logData.stack = error.stack;
        logData.errorMessage = error.message;
      }

      // Save to MongoDB
      const log = new logModel(logData);
      return await log.save();
    } catch (err) {
      console.error('Failed to save log to MongoDB:', err);
      // Still log to file/console if MongoDB fails
      this.logger.error(`Failed to save log to MongoDB: ${err.message}`);
      return null;
    }
  }

  /**
   * General logging method with options
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {object} options - Additional options
   */
  async logWithOptions(level, message, options = {}) {
    // Log through Winston first
    this.logger.log(level, message, options);
    
    // Then also save to MongoDB directly to ensure schema compliance
    if (MongoTransport) {
      await this.saveToMongo(level, message, options);
    }
  }

  /**
   * Set default log type for all subsequent logs
   * @param {string} logType - Type from LogType enum
   */
  setDefaultLogType(logType) {
    if (Object.values(LogType).includes(logType)) {
      this.defaultLogType = logType;
    } else {
      this.warn(`Invalid log type '${logType}'. Using default.`);
    }
  }

  // Standard log methods with MongoDB support
  async info(message, options = {}) {
    return this.logWithOptions('info', message, options);
  }

  async warn(message, options = {}) {
    return this.logWithOptions('warning', message, options);
  }

  async error(message, error = null, options = {}) {
    const logOptions = { ...options };
    
    // Set default log type to ERROR for error logs
    if (!logOptions.logType) {
      logOptions.logType = LogType.ERROR;
    }
    
    // Add error to options
    if (error) {
      logOptions.error = error;
    }
    
    return this.logWithOptions('error', message, logOptions);
  }

  async critical(message, error = null, options = {}) {
    const logOptions = { ...options };
    
    // Set default log type to ERROR for critical logs
    if (!logOptions.logType) {
      logOptions.logType = LogType.ERROR;
    }
    
    // Add error to options
    if (error) {
      logOptions.error = error;
    }
    
    return this.logWithOptions('critical', message, logOptions);
  }

  async debug(message, options = {}) {
    return this.logWithOptions('debug', message, options);
  }

  async http(message, options = {}) {
    const logOptions = { ...options };
    
    // Set default log type to ACCESS for HTTP logs
    if (!logOptions.logType) {
      logOptions.logType = LogType.ACCESS;
    }
    
    return this.logWithOptions('http', message, logOptions);
  }

  async verbose(message, options = {}) {
    return this.logWithOptions('verbose', message, options);
  }

  async silly(message, options = {}) {
    return this.logWithOptions('silly', message, options);
  }

  // Specialized log methods for different log types
  async logSystem(level, message, options = {}) {
    return this.logWithOptions(level, message, { 
      ...options, 
      logType: LogType.SYSTEM 
    });
  }

  async logSecurity(level, message, options = {}) {
    return this.logWithOptions(level, message, { 
      ...options, 
      logType: LogType.SECURITY 
    });
  }

  async logAccess(level, message, options = {}) {
    return this.logWithOptions(level, message, { 
      ...options, 
      logType: LogType.ACCESS 
    });
  }
}

// Create a singleton instance
const logger = new Logger();
Object.freeze(logger);

// Export logger and constants
module.exports = {
  logger,
  LogType,
  LogLevel
};