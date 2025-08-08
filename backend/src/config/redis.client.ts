import Redis from "ioredis";

const REDISURL = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = new Redis(REDISURL);

redisClient.on("connect", () => {
  console.log("Redis connected successfully");
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

export default redisClient;
