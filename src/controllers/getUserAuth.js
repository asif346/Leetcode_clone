import redisClient from "../config/redis.js";
import User from "../models/user.js";
import validate from "../utils/validators.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Submission from "../models/submission.js";
import { response } from "express";
// import { use } from "react";

const register = async (req, res) => {
  try {
    // return res.send("register tak ");
    // validate the date
    validate(req.body);
    console.log(req.body);

    const { firstName, emailId, password } = req.body;
    req.body.password = await bcrypt.hash(password, 10);

    const user = await User.create(req.body);
    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    const token = jwt.sign(
      { _id: user._id, email: emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 },
    );
    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });
    res.status(201).json({
      user: reply,
      message: "Registered sucessfully",
    });
  } catch (error) {
    res.status(400).send("Error" + error);
  }
};

const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId || !password) {
      throw new Error("Invalid Credential");
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid Credential");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error("Invalid Credential");
    }

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }, // 1 hour
    );

    res.cookie("token", token, { maxAge: 60 * 60 * 1000, httpOnly: true });
    res.status(200).json({
      user: reply,
      message: "Loggin sucessfully ho gya ",
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
};

// logout feature
const logout = async (req, res) => {
  try {
    // validate the token
    const { token } = req.cookies;
    const payload = jwt.decode(token);

    await redisClient.set(`token:${token}`, "Blocked");
    await redisClient.expireAt(`token:${token}`, payload.exp);

    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.send("logout successfully");

    // token add kar dunga apne redis ke blocklist me

    // clear the cookie
  } catch (err) {
    res.send("error" + err.message);
  }
};

// admin register
const AdminRegister = async (req, res) => {
  try {
    // validate the date
    validate(req.body);

    const { firstName, emailId, password } = req.body;
    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "admin";
    const user = await User.create(req.body);

    const token = jwt.sign(
      { _id: user._id, email: emailId, role: "admin" },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 },
    );
    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    res.status(201).send.json({
      user:reply,
      message:"admin registered successfully"
    })
  } catch (error) {
    res.status(400).send("Error" + error);
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.result._id;

    await User.findByIdAndDelete(userId);

    /// submission me bhi delete kar do
    await Submission.deleteMany({ userId });

    res.status(200).send("deleted successfully");
  } catch (err) {
    res.status(500).send("internal server error");
  }
};
export default { register, login, logout, AdminRegister, deleteProfile };
