import jwt from "jsonwebtoken";
import User from "../models/user.js";
import redisClient from "../config/redis.js";

const userMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("token is not present");
    }
    const payload = jwt.verify(token, process.env.JWT_KEY);

    const { _id } = payload;

    if (!_id) {
      throw new Error("Id is missing");
    }

    const result = await User.findById(_id);

    if (!result) {
      throw new Error("user doesn't exist");
    }

    // redis ke blocklist me present hua
    const Isblocked = await redisClient.exists("token:" + token);

    if (Isblocked) {
      throw new Error("Invalid Token");
    }
    req.result = result;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

export default userMiddleware;
