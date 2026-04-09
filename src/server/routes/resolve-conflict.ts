import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  const { repo, file, pr1, pr2 } = req.body;

  if (!repo || !file || !pr1 || !pr2) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Groq API key not configured" });
  }

  const prompt = `You are a senior tech lead. In the GitHub repository "${repo}", there is a potential merge conflict or logical intersection in the file "${file}" between Pull Request #${pr1} and Pull Request #${pr2}.

Provide a brief, concise, and highly technical solution on how to resolve or prevent this conflict. Give actionable advice on Git rebasing, logical decoupling, or communication strategies between the authors. Do not use markdown formatting, just plain text in a single paragraph. Keep it under 4 sentences.`;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const solution = response.data.choices[0]?.message?.content || "No solution generated.";
    res.json({ solution: solution.trim() });
  } catch (err: any) {
    console.error("Groq resolve conflict error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate solution" });
  }
});

export default router;
