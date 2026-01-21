import express from 'express'
import userMiddleware from '../middleware/userMiddleware.js'
import authController from "../controllers/getUserAuth.js";
const { register, login, logout, AdminRegister,deleteProfile } = authController;
import AdminMiddleware from '../middleware/AdminMiddleware.js';

const authRouter = express.Router();

// Register
authRouter.post('/register', register);
authRouter.post('/login',login);
authRouter.post('/logout',userMiddleware, logout);
authRouter.post('/AdminRegister',AdminMiddleware,AdminRegister);
authRouter.delete('/deleteProfile',userMiddleware,deleteProfile);
authRouter.get('/check', userMiddleware, (req,res)=>{
    const reply = {
        firstName:req.result.firstName,
        email:req.result.email,
        _id:req.result._id,
        role:req.result.role,
    }
    return res.status(200).json({
        user:reply,
        message:"valid user",
    })
})
// authRouter.get('getProfile',getProfile);


export default authRouter;