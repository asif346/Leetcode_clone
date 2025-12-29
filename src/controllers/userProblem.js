import Problem from "../models/problem.js";
import Submission from "../models/submission.js";
import {
  getLanguageById,
  submitBatch,
  submitToken,
} from "../utils/ProblemUtility.js";

const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    visibletestcases,
    invisibletestcases,
    startcode,
    referenceSolution,
  } = req.body;

  try {
    for (const { language, completecode } of referenceSolution) {
      const LanguageId = getLanguageById(language);

      const submissions = visibletestcases.map((testcase) => ({
        source_code: completecode,
        language_id: LanguageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      // 1. Submit
      const submitResult = await submitBatch(submissions);
      // console.log("Batch submit result:", submitResult);

      // 2. Extract tokens
      const resultToken = submitResult.map((s) => s.token);
      // console.log("Tokens:", resultToken);

      // 3. Wait for results
      const testResult = await submitToken(resultToken);

      // 4. Validate each test
      for (const test of testResult) {
        if (test.status_id !== 3) {
          return res.status(400).json({
            message: "Reference solution failed",
            details: test,
          });
        }
      }
    }

    // 5. Save in DB
    await Problem.create({
      ...req.body,
      problemCreator: req.result._id,
    });

    res.status(201).send("Problem saved successfully ");
  } catch (err) {
    console.error("createProblem error:", err);
    res.status(500).send("Error: " + err.message);
  }
};

const updateProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    visibletestcases,
    invisibletestcases,
    startcode,
    referenceSolution,
  } = req.body;

  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).send("Missing Id field");
    }

    const DsaProblem = await Problem.findById(id);
    if (!DsaProblem) {
      return res.status(404).send("ID is not present in server");
    }

    // Validate reference solution
    for (const { language, completecode } of referenceSolution) {
      const LanguageId = getLanguageById(language);

      const submissions = visibletestcases.map((testcase) => ({
        source_code: completecode,
        language_id: LanguageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      // // 1. Submit
      // const submitResult = await submitBatch(submissions);

      // // 2. Extract tokens
      // const resultToken = submitResult.map((s) => s.token);

      // // 3. Wait for results
      // const testResult = await submitToken(resultToken);

      // // 4. Validate each test
      // for (const test of testResult) {
      //   if (test.status_id !== 3) {
      //     return res.status(400).json({
      //       message: "Reference solution failed",
      //       details: test,
      //     });
      //   }
      // }
    }

    // 5. Update problem in DB
    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      { ...req.body },
      { runValidators: true, new: true }
    );

    return res.status(200).json({
      message: "Problem updated successfully ✅",
      data: updatedProblem,
    });
  } catch (err) {
    return res.status(500).send("Error: " + err.message);
  }
};

const deleteProblem = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) return res.status(400).send("id is missing");

    const deletedProblem = await Problem.findByIdAndDelete(id);

    if (!deletedProblem) {
      return res.status(404).send("Problem is missing");
    }

    res.status(200).send("delete successfully");
  } catch (err) {
    res.send("error occured" + err);
  }
};

const getProblemById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) return res.status(400).send("id is missing");

    const GetProblemById = await Problem.findById(id).select(
      "_id title description difficulty tags visibletestcases startcode referenceSolution"
    );

    if (!GetProblemById) {
      return res.status(404).send("Problem is missing");
    }

    res.status(200).send(GetProblemById);
  } catch (err) {
    res.send("error occured" + err);
  }
};

const getAllProblem = async (req, res) => {
  try {
    const getProblem = await Problem.find({}).select(
      "_id title difficulty tags"
    );

    if (getProblem.length == 0) {
      return res.status(404).send("Problem is missing");
    }

    return res.status(200).send(getProblem);
  } catch (err) {
    res.status(500).send("error occured" + err);
  }
};

const solvedAllProblemByUser = async (req, res) => {
  try {
    const count = req.result.problemSolved.length;
    res.status(200).send(count);
  } catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
};
const submittedProblem = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.pid;

    const ans = await Submission.find(userId, problemId);

    if (ans.length == 0) {
      res.status(200).send("No Submission is present");
    }
    res.status(200).send(ans);
  } catch (err) {
    res.status(500).send("internal server error");
  }
};
export default {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  solvedAllProblemByUser,
  submittedProblem,
};
