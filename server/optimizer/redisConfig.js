import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const redisClient = createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
redisClient.on("connect", () => console.log("Redis connected!"));
redisClient.on("error", (err) => console.error("Redis error:", err.message));

export async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("Redis connection successful!");

    // Xác minh kết nối 
    const pong = await redisClient.ping();
    console.log("PING response from Redis:", pong); 
  } catch (err) {
    console.error("Error connecting to Redis:", err.message);
    process.exit(1); // Dừng server nếu kết nối thất bại
  }
}

export async function setCache(key, value, ttl = 3600) {
  await redisClient.set(key, value, { EX: ttl }); 
}

export async function getCache(key) {
  try {
    const value = await redisClient.get(key);
    return value;
  } catch (err) {
    console.error("Error getting cache:", err.message);
    return null;
  }
}

export { redisClient };
