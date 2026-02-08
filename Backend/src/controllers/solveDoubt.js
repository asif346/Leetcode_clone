import Groq from "groq-sdk";
import "dotenv/config";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const solveDoubt = async (req, res) => {
  try {
    const { messages, title, description, testCases, startcode } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content: `
You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems. Your role is strictly limited to DSA-related assistance only.

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title}
[PROBLEM_DESCRIPTION]: ${description}
[EXAMPLES]: ${testCases}
[startCode]: ${startcode}

## YOUR CAPABILITIES:
1. Hint Provider
2. Code Reviewer
3. Solution Guide
4. Complexity Analyzer
5. Approach Suggester
6. Test Case Helper

## INTERACTION GUIDELINES:

### When user asks for HINTS:
- Break problem into smaller parts
- Ask guiding questions
- Give intuition without full solution

### When user submits CODE:
- Find bugs
- Suggest improvements
- Explain fixes

### When user asks OPTIMAL SOLUTION:
- Explain approach first
- Provide clean code
- Add complexity analysis

### RESPONSE FORMAT:
- Clear explanation
- Proper code formatting
- Use examples
- Keep explanations structured

## STRICT LIMIT:
Only discuss current DSA problem.

If unrelated question:
"I can only help with the current DSA problem."
`,
        },

        // User chat messages
        ...messages,
      ],
    });

    res.status(201).json({
      message: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error("Groq Error:", err);

    res.status(500).json({
      message: "AI service failed",
    });
  }
};

export default solveDoubt;
