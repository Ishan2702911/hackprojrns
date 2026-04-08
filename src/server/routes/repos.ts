import express from "express";
import { GitHubService } from "../services/githubService";

const router = express.Router();

router.get("/", async (req, res) => {
  const token = req.cookies.github_token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const repos = await GitHubService.getRepos(token);
    res.json(repos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

router.get("/:owner/:repo", async (req, res) => {
  const token = req.cookies.github_token;
  const { owner, repo } = req.params;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const [commits, prs] = await Promise.all([
      GitHubService.getCommits(token, owner, repo),
      GitHubService.getPRs(token, owner, repo),
    ]);
    res.json({ commits, prs });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch repository details" });
  }
});

export default router;
