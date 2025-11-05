import Problem from "../models/problem.js";
import Submission from "../models/submission.js";
import {
  getLanguageById,
  submitBatch,
  submitToken,
} from "../utils/ProblemUtility.js";

export const submitCode = async (req, res) => {
  //
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    const { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    //    Fetch the problem from database
    const problem = await Problem.findById(problemId);
    //    testcases(Hidden)

    //   Kya apne submission store kar du pehle....
    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: "pending",
      testCasesTotal: problem.invisibletestcases.length,
    });

    //    Judge0 code ko submit karna hai

    const languageId = getLanguageById(language);

    const submissions = problem.invisibletestcases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map((value) => value.token);

    const testResult = await submitToken(resultToken);

    // submittedResult ko update karo
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "accepted";
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runtime = runtime + parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        if (test.status_id == 4) {
          status = "error";
          errorMessage = test.stderr;
        } else {
          status = "wrong";
          errorMessage = test.stderr;
        }
      }
    }

    // Store the result in Database in Submission
    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();

    // ProblemId ko insert karenge userSchema ke problemSolved mein if it is not persent there.

    // req.result == user Information

    if (!req.result.problemSolved.includes(problemId)) {
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    res.status(201).send(submittedResult);
  } catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
};

export const runCode = async(req,res)=>{
    
     // 
     try{
      const userId = req.result._id;
      const problemId = req.params.id;

      const {code,language} = req.body;

     if(!userId||!code||!problemId||!language)
       return res.status(400).send("Some field missing");

   //    Fetch the problem from database
      const problem =  await Problem.findById(problemId);
   //    testcases(Hidden)


   //    Judge0 code ko submit karna hai

   const languageId = getLanguageById(language);

   const submissions = problem.visibletestcases.map((testcase)=>({
       source_code:code,
       language_id: languageId,
       stdin: testcase.input,
       expected_output: testcase.output
   }));


   const submitResult = await submitBatch(submissions);
   
   const resultToken = submitResult.map((value)=> value.token);

   const testResult = await submitToken(resultToken);

   
  
    return res.status(201).send(testResult);
      
   }
   catch(err){
     res.status(500).send("Internal Server Error "+ err);
   }
}

