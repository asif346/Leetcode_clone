import redisClient from "../config/redis.js";
import User from "../models/user.js"
import validate from "../utils/validators.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const register = async(req,res)=>{
    try{
        // validate the date
        validate(req.body);

       const {firstName, email, password} = req.body;
       req.body.password = await bcrypt.hash(password, 10);
       
       const user = await User.create(req.body);

        const token = jwt.sign({_id:user._id, email:email, role:user.role}, process.env.JWT_KEY,{expiresIn: 60*60});
        res.cookie('token',token,{maxAge:60*60*1000})
        res.status(201).send("User Registered Successfully");
       
    }
    catch(error){
        res.status(400).send("Error"+error);
    }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Invalid Credential");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid Credential");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error("Invalid Credential");
    }

    const token = jwt.sign(
      { _id: user._id, email: email },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 } // 1 hour
    );

    res.cookie("token", token, { maxAge: 60 * 60 * 1000, httpOnly: true });
    res.status(200).send("Logged in Successfully");
  } catch (error) {
    res.status(401).send(error.message);
  }
};


// logout feature
const logout = async(req,res)=>{
    try{
        // validate the token
        const {token} = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set( `token:${token}`,"Blocked");
        await redisClient.expireAt(`token:${token}`,payload.exp);

        res.cookie("token",null,{expires:new Date(Date.now())});
        res.send("logout successfully");

        // token add kar dunga apne redis ke blocklist me

        // clear the cookie

    }
    catch(err){
        res.send("error"+err.message);
    }
}

// admin register
const AdminRegister = async(req,res)=>{
    try{
        // validate the date
        validate(req.body);

       const {firstName, email, password} = req.body;
       req.body.password = await bcrypt.hash(password, 10);
       req.body.role = 'admin';
       const user = await User.create(req.body);

        const token = jwt.sign({_id:user._id, email:email, role:'admin'}, process.env.JWT_KEY,{expiresIn: 60*60});
        res.cookie('token',token,{maxAge:60*60*1000})
        res.status(201).send("admin Registered Successfully");
       
    }
    catch(error){
        res.status(400).send("Error"+error);
    }
}

export default {register, login, logout, AdminRegister}