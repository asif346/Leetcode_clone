import { createClient } from "redis";
import "dotenv/config";

const redisClient = createClient(
  {
    username: "default",
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  },
  console.log("Redis Connected"),
);

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

export default redisClient;
