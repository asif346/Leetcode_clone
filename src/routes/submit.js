import express from 'express';
import userMiddleware from '../middleware/userMiddleware.js';
const submitRouter = express.Router();
import {submitCode, runCode,} from '../controllers/userSubmission.js'


submitRouter.post('/submit/:id',userMiddleware, submitCode);
submitRouter.post('/run/:id',userMiddleware, runCode);


export default submitRouter;