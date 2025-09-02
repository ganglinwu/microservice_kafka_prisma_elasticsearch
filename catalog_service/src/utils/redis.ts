import Redis from "ioredis";
import logger from "./logger";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(redisUrl);

redis.on("connect", () => {
  logger.info(
    {
      redisUrl: redisUrl,
    },
    "Redis Connected",
  );
});

redis.on("error", (err) => {
  logger.error(
    {
      error: err.message,
      stack: err.stack,
      redisUrl: redisUrl,
    },
    "Redis Connection Error",
  );
});

redis.on("ready", () => {
  logger.info({}, "Redis Ready");
});

export default redis;
