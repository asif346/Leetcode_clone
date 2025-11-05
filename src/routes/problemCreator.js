import express from 'express'
const problemRouter = express.Router();
import AdminMiddleware from '../middleware/AdminMiddleware.js';
import userMiddleware from "../middleware/userMiddleware.js"
import userProblem from '../controllers/userProblem.js';

const { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem,solvedAllProblemByUser,submittedProblem } = userProblem;

// create
problemRouter.post('/create',AdminMiddleware,createProblem);
// update
problemRouter.put('/update/:id',AdminMiddleware,updateProblem);
// delete
problemRouter.delete('/delete/:id',AdminMiddleware,deleteProblem);


problemRouter.get('/ProblemById/:id',userMiddleware,getProblemById);
problemRouter.get('/getAllProblem/',userMiddleware,getAllProblem);
problemRouter.get('/problemSolvedByUser',userMiddleware,solvedAllProblemByUser);
problemRouter.get('/submittedProblem',userMiddleware,submittedProblem);
// fetch

export default problemRouter;
