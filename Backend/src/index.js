import express from "express";

const app = express();
import "dotenv/config";
import main from "./config/database.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/userAuth.js";
import redisClient from "./config/redis.js";
import problemRouter from "./routes/problemCreator.js";
import submitRouter from "./routes/submit.js";

import cors from "cors";

app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true, // allow cookies / auth headers
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);

const InitializeConnection = async () => {
  try {
    await Promise.all([main(), redisClient.connect()]);
    // await main();
    console.log("DB Connected");

    // await redisClient.connect
    console.log("Redis Connected");

    app.listen(process.env.PORT, () => {
      console.log("Server is listening at port no:", process.env.PORT);
    });
  } catch (err) {
    console.log("Error" + err);
  }
};

InitializeConnection();
