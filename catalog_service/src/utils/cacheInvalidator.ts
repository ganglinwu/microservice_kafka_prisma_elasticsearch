import Redis from "ioredis";
import { logger } from "./logger";

class CacheInvalidator {
  _redis: Redis;

  constructor(redis: Redis) {
    this._redis = redis;
  }

  async invalidate(setName: string): Promise<void> {
    try {
      const allKeys = await this._redis.smembers(setName);
      if (allKeys.length > 0) {
        await this._redis.del(...allKeys);
        await this._redis.del(setName);
      }
    } catch (error) {
      logger.error(error, `failed to invalidate cache set ${setName}`);
    }
  }
}

export default CacheInvalidator;
