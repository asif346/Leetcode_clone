import express from "express";
const aiRouter =  express.Router();
import userMiddleware from "../middleware/userMiddleware.js";
// const solveDoubt = require('../controllers/solveDoubt');
import solveDoubt from "../controllers/solveDoubt.js"

aiRouter.post('/chat', userMiddleware, solveDoubt);

export default aiRouter;