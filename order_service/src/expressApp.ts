import express, { NextFunction, Request, Response } from "express";
import corsHandler, { parseCorsOptionsFromEnv } from "./utils/corsHandler.js";
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";

const app = express();

app.use(corsHandler(parseCorsOptionsFromEnv()));
app.use(express.json());

app.use("/cart", cartRouter);
app.use("/order", orderRouter);

app.use("/health", (req: Request, res: Response, _: NextFunction) => {
  res.status(200).json({ message: "System is healthy" });
});

export default app;
