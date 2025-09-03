import expressApp from "./expressApp";
import { logger } from "./utils/logger";
import { elasticsearchClient } from "./search/elasticsearch.client";

const PORT = parseInt(process.env.PORT || "3000", 10);

export const StartServer = async () => {
  try {
    const server = expressApp.listen(PORT, "0.0.0.0", () => {
      logger.info(
        {
          port: PORT,
          environment: process.env.NODE_ENV || "production",
          nodeVersion: process.version,
        },
        "Catalog Service Started",
      );
    });

    await elasticsearchClient.initializeElasticsearch();

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      logger.info({ signal }, "Received shutdown signal");
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Enhanced error handling with structured logging
    process.on("uncaughtException", (err) => {
      logger.fatal(
        {
          error: err.message,
          stack: err.stack,
        },
        "Uncaught Exception",
      );
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.fatal(
        {
          reason: reason instanceof Error ? reason.message : String(reason),
          stack: reason instanceof Error ? reason.stack : undefined,
          promise: String(promise),
        },
        "Unhandled Promise Rejection",
      );
      process.exit(1);
    });

    return server;
  } catch (error) {
    logger.fatal(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Failed to start server",
    );
    process.exit(1);
  }
};

StartServer().catch((error) => {
  logger.fatal(
    {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
    "Server startup failed",
  );
  process.exit(1);
});
