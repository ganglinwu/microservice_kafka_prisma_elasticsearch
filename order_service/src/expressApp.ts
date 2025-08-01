import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import corsHandler, { parseCorsOptionsFromEnv } from "./utils/corsHandler.js";
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";
import { loggerStream, logger } from "./utils/logger.js";

const app = express();

// HTTP request logging with Morgan
app.use(morgan('combined', { stream: loggerStream }));

app.use(corsHandler(parseCorsOptionsFromEnv()));
app.use(express.json());

app.use("/cart", cartRouter);
app.use("/order", orderRouter);

app.use("/health", (req: Request, res: Response, _: NextFunction) => {
  res.status(200).json({ message: "System is healthy" });
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
