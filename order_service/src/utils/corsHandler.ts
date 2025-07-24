import { Request, Response, NextFunction } from "express";

interface CorsOptions {
  origin?: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
}
export function parseCorsOptionsFromEnv(): CorsOptions {
  const options: CorsOptions = {};

  if (process.env.CORS_WHITELIST) {
    const origins = process.env.CORS_WHITELIST.split(",").map((origin) =>
      origin.trim(),
    );
    options.origin = origins.length === 1 ? origins[0] : origins;
  }
  if (process.env.CORS_ALLOWED_METHODS) {
    const methods = process.env.CORS_ALLOWED_METHODS.split(",").map((method) =>
      method.trim(),
    );
    options.methods = methods;
  }
  if (process.env.CORS_ALLOWED_HEADERS) {
    const headers = process.env.CORS_ALLOWED_HEADERS.split(",").map((header) =>
      header.trim(),
    );
    options.allowedHeaders = headers;
  }
  if (process.env.CORS_CREDENTIALS) {
    options.credentials = process.env.CORS_CREDENTIALS.toLowerCase() === "true";
  }

  return options;
}

function corsHandler(options: CorsOptions = {}) {
  const {
    origin = "*",
    methods = ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders = ["Content-Type", "Authorization"],
    credentials = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    if (Array.isArray(origin)) {
      if (req.headers.origin && origin.includes(req.headers.origin)) {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
      }
    } else {
      res.header("Access-Control-Allow-Origin", origin);
    }

    res.header("Access-Control-Allow-Methods", methods.join(", "));
    res.header("Access-Control-Allow-Headers", allowedHeaders.join(", "));

    if (credentials) {
      res.header("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  };
}

export default corsHandler;
