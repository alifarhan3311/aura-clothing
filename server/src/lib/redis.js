import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: true,
});

redis.on("connect", () => console.log("Redis connected successfully"));
redis.on("error", (err) => console.error("Redis error:", err.message));

// Prevent unhandled rejection crashes when Redis is unavailable
redis.on("close", () => {});
process.on("unhandledRejection", (reason) => {
  if (reason?.message?.includes("Connection is closed")) return; // swallow Redis close noise
  console.error("Unhandled Rejection:", reason);
});

export default redis;
