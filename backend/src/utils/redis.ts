import redisClient from "../config/redis.client";

export const cacheSet = async (key: string, data: any, ttlSeconds: number) => {
  try {
    await redisClient.set(key, JSON.stringify(data), "EX", ttlSeconds);
  } catch (e) {
    console.error("Redis set error:", e);
  }
};

export const cacheGet = async (key: string) => {
  try {
    const raw = await redisClient.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Redis get error:", e);
    return null;
  }
};

export const cacheDel = async (keyPattern: string) => {
  try {
    const keys = await redisClient.keys(keyPattern);
    if (keys.length) {
      await redisClient.del(...keys);
    }
  } catch (e) {
    console.error("Redis del error:", e);
  }
};
