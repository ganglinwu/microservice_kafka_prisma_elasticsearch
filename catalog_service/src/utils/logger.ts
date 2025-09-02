import { pino } from "pino";

// Create logger configuration based on environment
const createLogger = () => {
  const isDevelopment = process.env.NODE_ENV === "development";
  const logLevel = process.env.LOG_LEVEL || "info";

  const config: pino.LoggerOptions = {
    level: logLevel,
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    // Add service title and version for microservice identification
    base: {
      service: "catalog-service",
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "production",
    },
  };

  // Pretty printing for development, JSON for production/containers
  if (isDevelopment) {
    config.transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hosttitle",
      },
    };
  }

  return pino(config);
};

// Create and export the logger instance
export const logger = createLogger();

// Create a stream for Morgan HTTP logging
export const loggerStream = {
  write: (message: string) => {
    // Remove trailing newline from Morgan and log as info
    logger.info(message.trim(), "HTTP");
  },
};

// Helper functions for common logging patterns
export const loggers = {
  // HTTP request logging
  http: (req: any, res: any, responseTime?: number) => {
    logger.info(
      {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
      },
      "HTTP Request",
    );
  },

  // Database operations
  database: (
    operation: string,
    table: string,
    duration?: number,
    error?: Error,
  ) => {
    if (error) {
      logger.error(
        {
          operation,
          table,
          duration,
          error: error.message,
          stack: error.stack,
        },
        "Database Error",
      );
    } else {
      logger.info(
        {
          operation,
          table,
          duration,
        },
        "Database Operation",
      );
    }
  },

  // Business logic events
  business: (event: string, context: Record<string, any>) => {
    logger.info(
      {
        event,
        ...context,
      },
      "Business Event",
    );
  },

  // Error logging with context
  error: (error: Error, context?: Record<string, any>) => {
    logger.error(
      {
        error: error.message,
        stack: error.stack,
        ...context,
      },
      "Application Error",
    );
  },

  // Performance monitoring
  performance: (
    operation: string,
    duration: number,
    context?: Record<string, any>,
  ) => {
    logger.info(
      {
        operation,
        duration,
        ...context,
      },
      "Performance Metric",
    );
  },
};

export default logger;
