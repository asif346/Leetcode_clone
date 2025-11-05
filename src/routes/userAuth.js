import express from 'express'
import userMiddleware from '../middleware/userMiddleware.js'
import authController from "../controllers/getUserAuth.js";
const { register, login, logout, AdminRegister, deleteProfile} = authController;
import AdminMiddleware from '../middleware/AdminMiddleware.js';

const authRouter = express.Router();

// Register
authRouter.post('/register', register);
authRouter.post('/login',login);
authRouter.post('/logout',userMiddleware, logout);
authRouter.post('/AdminRegister',AdminRegister);
authRouter.delete('/profile',userMiddleware,deleteProfile);
// authRouter.get('getProfile',getProfile);

export default authRouter;