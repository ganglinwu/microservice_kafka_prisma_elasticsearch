import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import catalogRouter from "./api/catalog.routes";
import { loggerStream, logger } from "./utils/logger";

const app = express();

// HTTP request logging with Morgan
app.use(morgan('combined', { stream: loggerStream }));

app.use(express.json());

app.use("/", catalogRouter);

// Health check endpoint
app.use("/health", (req: Request, res: Response, _: NextFunction) => {
  res.status(200).json({ message: "Catalog service is healthy" });
});

// Global error handler with structured logging
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  }, 'Unhandled Express Error');

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

export default app;
