import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router";
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from "../components/ChatAi";

const langMap = {
  cpp: "c++",
  java: "java",
  javascript: "javaScript", 
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [codeMap, setCodeMap] = useState({
    javascript: "",
    java: "",
    cpp: "",
  });
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [activeRightTab, setActiveRightTab] = useState("code");
  const editorRef = useRef(null);
  const { problemId } = useParams();

  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(
          `/problem/problemById/${problemId}`,
        );

        const initialCodeMap = {};
        ["javascript", "java", "cpp"].forEach((lang) => {
          const startCode = response.data.startcode?.find(
            (sc) => sc.language === langMap[lang],
          );
          initialCodeMap[lang] = startCode?.initialcode || "";
        });

        setProblem(response.data);
        setCodeMap(initialCodeMap);
      } catch (error) {
        console.error("Error fetching problem:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  const handleEditorChange = (value) => {
    setCodeMap((prev) => ({
      ...prev,
      [selectedLanguage]: value || "",
    }));
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setRunResult(null);

    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code: codeMap[selectedLanguage],
        language: selectedLanguage,
      });

      setRunResult(response.data);
      console.log(response.data);
      setActiveRightTab("testcase");
    } catch (error) {
      console.error("Error running code:", error);
      setRunResult({
        success: false,
        error: error.response?.data?.message || "Internal server error",
      });
      setActiveRightTab("testcase");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await axiosClient.post(
        `/submission/submit/${problemId}`,
        {
          code: codeMap[selectedLanguage],
          language: selectedLanguage,
        },
      );

      setSubmitResult(response.data);
      setActiveRightTab("result");
    } catch (error) {
      console.error("Error submitting code:", error);
      setSubmitResult({
        success: false,
        error: error.response?.data?.message || "Internal server error",
      });
      setActiveRightTab("result");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case "javascript":
        return "javascript";
      case "java":
        return "java";
      case "cpp":
        return "cpp";
      default:
        return "javascript";
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return "text-gray-500";

    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "hard":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const formatTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === "string")
      return tags.split(",").map((tag) => tag.trim());
    return [];
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="alert alert-error">Failed to load problem</div>
      </div>
    );
  }
   const formatMemory = (memory) => {
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="h-screen flex bg-base-100 overflow-hidden">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border-r border-base-300">
        {/* Left Tabs */}
        <div className="tabs tabs-bordered bg-base-200 px-4 shrink-0">
          <button
            className={`tab ${activeLeftTab === "description" ? "tab-active" : ""}`}
            onClick={() => setActiveLeftTab("description")}
          >
            Description
          </button>
          <button
            className={`tab ${activeLeftTab === "editorial" ? "tab-active" : ""}`}
            onClick={() => setActiveLeftTab("editorial")}
          >
            Editorial
          </button>
          <button
            className={`tab ${activeLeftTab === "solutions" ? "tab-active" : ""}`}
            onClick={() => setActiveLeftTab("solutions")}
          >
            Solutions
          </button>
          <button
            className={`tab ${activeLeftTab === "submissions" ? "tab-active" : ""}`}
            onClick={() => setActiveLeftTab("submissions")}
          >
            Submissions
          </button>

           <button
            className={`tab ${activeLeftTab === "chatAi" ? "tab-active" : ""}`}
            onClick={() => setActiveLeftTab("chatAi")}
          >
            Chat Ai
          </button>
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeLeftTab === "description" && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold">{problem.title}</h1>
                <div
                  className={`badge badge-outline ${getDifficultyColor(problem.difficulty)}`}
                >
                  {problem.difficulty?.charAt(0).toUpperCase() +
                    problem.difficulty?.slice(1) || "Unknown"}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {formatTags(problem.tags).map((tag, index) => (
                    <div
                      key={index}
                      className="badge badge-primary badge-outline"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed mb-6">
                  {problem.description}
                </div>
              </div>

              {problem.visibletestcases?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Examples:</h3>
                  <div className="space-y-4">
                    {problem.visibletestcases.map((example, index) => (
                      <div key={index} className="bg-base-200 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">
                          Example {index + 1}:
                        </h4>
                        <div className="space-y-2 text-sm font-mono">
                          <div>
                            <strong>Input:</strong> {example.input}
                          </div>
                          <div>
                            <strong>Output:</strong> {example.output}
                          </div>
                          {example.explanation && (
                            <div>
                              <strong>Explanation:</strong>{" "}
                              {example.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeLeftTab === "editorial" && (
            <div className="prose max-w-none">
              <h2 className="text-xl font-bold mb-4">Editorial</h2>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {problem.editorial ||
                  "Editorial content will be available soon."}
              </div>
            </div>
          )}

          {activeLeftTab === "solutions" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Solutions</h2>
              <div className="space-y-6">
                {problem.referenceSolution?.length > 0 ? (
                  problem.referenceSolution.map((solution, index) => (
                    <div
                      key={index}
                      className="border border-base-300 rounded-lg"
                    >
                      <div className="bg-base-200 px-4 py-2 rounded-t-lg">
                        <h3 className="font-semibold">
                          {solution.language || "Solution"}
                        </h3>
                      </div>
                      <div className="p-4">
                        <pre className="bg-base-300 p-4 rounded text-sm overflow-x-auto">
                          <code>{solution.completecode}</code>
                        </pre>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    Solutions will be available after you solve the problem.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeLeftTab === "submissions" && (
            <div>
              <h2 className="text-xl font-bold mb-4">My Submissions</h2>
              <SubmissionHistory problemId={problemId} />
            </div>
          )}
            {activeLeftTab === "chatAi" && (
            <div className="prose max-w-none">
              <h2 className="text-xl font-bold mb-4">Chat with Ai</h2>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                <ChatAi problem={problem}></ChatAi>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col">
        {/* Right Tabs */}
        <div className="tabs tabs-bordered bg-base-200 px-4 shrink-0">
          <button
            className={`tab ${activeRightTab === "code" ? "tab-active" : ""}`}
            onClick={() => setActiveRightTab("code")}
          >
            Code
          </button>
          <button
            className={`tab ${activeRightTab === "testcase" ? "tab-active" : ""}`}
            onClick={() => setActiveRightTab("testcase")}
          >
            Testcase
          </button>
          <button
            className={`tab ${activeRightTab === "result" ? "tab-active" : ""}`}
            onClick={() => setActiveRightTab("result")}
          >
            Result
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeRightTab === "code" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Language Selector */}
              <div className="flex justify-between items-center p-4 border-b border-base-300 shrink-0">
                <div className="flex gap-2">
                  {["javascript", "java", "cpp"].map((lang) => (
                    <button
                      key={lang}
                      className={`btn btn-sm ${selectedLanguage === lang ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === "cpp"
                        ? "C++"
                        : lang === "javascript"
                          ? "JavaScript"
                          : "Java"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 min-h-0">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={codeMap[selectedLanguage]}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: "on",
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: "line",
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: "line",
                    mouseWheelZoom: true,
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-base-300 flex justify-end gap-3 shrink-0">
                <button
                  className={`btn btn-outline btn-sm ${isRunning ? "loading" : ""}`}
                  onClick={handleRun}
                  disabled={isRunning || isSubmitting}
                >
                  Run
                </button>

                <button
                  className={`btn btn-primary btn-sm ${isSubmitting ? "loading" : ""}`}
                  onClick={handleSubmitCode}
                  disabled={isRunning || isSubmitting}
                >
                  Submit
                </button>
              </div>
            </div>
          )}
          {/* {console.log(runResult)}; */}
          {activeRightTab === "testcase" && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Test Results</h3>

              {runResult ? (
                <div
                  className={`alert ${
                    runResult.every((tc) => tc.status_id === 3)
                      ? "alert-success"
                      : "alert-error"
                  } mb-4`}
                >
                  <div>
                    {runResult.every((tc) => tc.status_id === 3) ? (
                      <div>
                        <h4 className="font-bold">✅ All test cases passed!</h4>

                        <p className="text-sm mt-2">
                          Runtime: {runResult[0]?.time} sec
                        </p>

                        <p className="text-sm">
                          Memory: {runResult[0]?.memory} KB
                        </p>

                        <div className="mt-4 space-y-2">
                          {runResult.map((tc, i) => (
                            <div
                              key={i}
                              className="bg-base-100 p-3 rounded text-xs"
                            >
                              <div className="font-mono text-green-600" >
                                <div>
                                  <strong>Input:</strong> {tc.stdin}
                                </div>
                                <div>
                                  <strong>Expected:</strong>{" "}
                                  {tc.expected_output}
                                </div>
                                <div>
                                  <strong>Output:</strong> {tc.stdout}
                                </div>

                                <div
                                  className={
                                    tc.status_id === 3
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {tc.status_id === 3 ? "✓ Passed" : "✗ Failed"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold">❌ Some test cases failed</h4>

                        <div className="mt-4 space-y-2">
                          {runResult.map((tc, i) => (
                            <div
                              key={i}
                              className="bg-base-100 p-3 rounded text-xs"
                            >
                              <div className="font-mono">
                                <div>
                                  <strong>Input:</strong> {tc.stdin}
                                </div>
                                <div>
                                  <strong>Expected:</strong>{" "}
                                  {tc.expected_output}
                                </div>
                                <div>
                                  <strong>Output:</strong>{" "}
                                  {tc.stdout || "No output"}
                                </div>

                                <div
                                  className={
                                    tc.status_id === 3
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {tc.status_id === 3 ? "✓ Passed" : "✗ Failed"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Click "Run" to test your code with the example test cases.
                </div>
              )}
            </div>
          )}
            {console.log(submitResult)}
          {activeRightTab === "result" && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Submission Result</h3>
              {submitResult ? (
                <div
                  className={`alert ${submitResult.status ? "alert-success" : "alert-error"}`}
                >
                  <div>
                    {submitResult.status ? (
                      <div>
                        <h4 className="font-bold text-lg"> Accepted</h4>
                        <div className="mt-4 space-y-2">
                          <p>
                            Test Cases Passed: {submitResult.testCasesPassed}/
                            {submitResult.testCasesTotal}
                          </p>
                          <p>Runtime: {submitResult.runtime} sec</p>
                          <p>Memory:{formatMemory(submitResult.memory)} </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-lg">
                          ❌ {submitResult.error || "Submission failed"}
                        </h4>
                        <div className="mt-4 space-y-2">
                          <p>
                            Test Cases Passed: {submitResult.passedTestCases}/
                            {submitResult.totalTestCases}
                          </p>
                          {submitResult.runtime && (
                            <p>Runtime: {submitResult.runtime} sec</p>
                          )}
                          {submitResult.memory && (
                            <p>Memory: {formatMemory(submitResult.memory)}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Click "Submit" to submit your solution for evaluation.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;
