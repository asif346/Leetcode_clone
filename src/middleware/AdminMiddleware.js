import jwt from "jsonwebtoken";
import User from "../models/user.js";
import redisClient from "../config/redis.js";

const AdminMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: "Token is not present" });
    }

    const payload = jwt.verify(token, process.env.JWT_KEY);
    // res.send(payload);
    const { _id } = payload;
    // const {email} = payload;
    // res.send(email);

    if (!_id) {
      return res.status(401).json({ error: "Id is missing" });
    }

    // res.send("id is: "+_id);

    const result = await User.findById(_id);
    // res.send(result);

    if (!result) {
      return res.status(404).json({ error: "User doesn't exist" });
    }
    
    // return res.send(result);

    if (result.role != "admin") {
      return res
        .status(403)
        .json({ error: "Access denied. Admin role required" });
    }

    

    // redis ke blocklist me present hua
    const Isblocked = await redisClient.exists("token:" + token);

    if (Isblocked) {
      throw new Error("Invalid Token");
    }

    req.result = result;

    next();
  } catch (err) {
    console.log("Error:", err);
    return res
      .status(401)
      .json({ error: "Invalid token or authentication failed" });
  }
};

export default AdminMiddleware;
