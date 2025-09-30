import axios from "axios";

export const getLanguageById = (lang) => {
  const language = {
    "c++": 54,
    "java": 62,
    "javascript": 63,
    "python": 71,
  };
  return language[lang.toLowerCase()];
};

// Batch submission
export const submitBatch = async (submissions) => {
  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch", // ✅ correct endpoint
    params: {
      base64_encoded: "false",
      wait: "false",
      fields: "*",
    },
    headers: {
      "x-rapidapi-key": "16a891a1bcmshe1c8c3a5279ea7bp1a3d0fjsn9e0b3fcc0277",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: {
      submissions, // ✅ must be wrapped
    },
  };

  try {
    const response = await axios.request(options);
    return response.data; // contains tokens
  } catch (error) {
    console.error("submitBatch error:", error.response?.data || error.message);
    throw error;
  }
};

const waiting = (timer) => new Promise((resolve) => setTimeout(resolve, timer));

// Fetch results by tokens
export const submitToken = async (resultToken) => {
  const options = {
    method: "GET",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      tokens: resultToken.join(","),
      base64_encoded: "false",
      fields: "*",
    },
    headers: {
      "x-rapidapi-key": "16a891a1bcmshe1c8c3a5279ea7bp1a3d0fjsn9e0b3fcc0277", // ✅ use real key
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };

  while (true) {
    try {
      const response = await axios.request(options);
      const result = response.data;

      const isResultObtained = result.submissions.every((r) => r.status_id > 2);

      if (isResultObtained) {
        return result.submissions;
      }

      await waiting(1000); // ✅ wait 1s before retry
    } catch (error) {
      console.error("submitToken error:", error.response?.data || error.message);
      throw error;
    }
  }
};
