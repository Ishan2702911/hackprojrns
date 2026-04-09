import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  const { repo, commits } = req.body as {
    repo: string;
    commits: { sha: string; message: string; author: string; date: string }[];
  };

  if (!commits?.length) {
    return res.status(400).json({ error: "No commits provided" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Groq API key not configured" });
  }

  const commitList = commits
    .map((c, i) => `${i + 1}. [${c.sha}] ${c.message} — by ${c.author} on ${new Date(c.date).toDateString()}`)
    .join("\n");

  const prompt = `You are a technical writer. Analyze these ${commits.length} commits from the GitHub repo "${repo}" and generate two summaries.

COMMITS:
${commitList}

Respond ONLY with a valid JSON object, no markdown, no explanation:
{
  "user": {
    "headline": "One sentence for a non-technical user describing what changed overall",
    "tldr": "2-3 sentences in plain English. No jargon. Focus on what the user sees/feels.",
    "bullets": ["5-7 plain-English bullets starting with a verb describing key changes"]
  },
  "team": {
    "headline": "One sentence technical headline for developers",
    "tldr": "2-3 sentences mentioning architecture, patterns, and modules affected.",
    "bullets": ["5-8 precise technical bullets with specifics: function names, modules, patterns, performance"],
    "keywords": ["8-12 technical keywords like 'React hooks', 'OAuth2', 'REST API', 'tree shaking'"]
  }
}`;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 1200,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const raw = response.data.choices[0]?.message?.content || "";
    const parsed = JSON.parse(raw);
    res.json({ ...parsed, generatedAt: new Date().toISOString() });
  } catch (err: any) {
    console.error("Groq summary error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

export default router;

