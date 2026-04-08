import express from "express";
import { GitHubService } from "../services/githubService";
import { AnalysisService } from "../services/analysisService";

const router = express.Router();

router.get("/:owner/:repo", async (req, res) => {
  const token = req.cookies.github_token;
  const { owner, repo } = req.params;
  
  // Allow if token exists or if GITHUB_TOKEN is set in env
  if (!token && !process.env.GITHUB_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const [commits, prs] = await Promise.all([
      GitHubService.getCommits(token, owner, repo),
      GitHubService.getPRs(token, owner, repo),
    ]);

    // Fetch files for each PR (limit to first 15 for performance)
    const prFiles: Record<number, string[]> = {};
    const prsToAnalyze = prs.slice(0, 15);
    
    await Promise.all(prsToAnalyze.map(async (pr) => {
      try {
        prFiles[pr.number] = await GitHubService.getPRFiles(token, owner, repo, pr.number);
      } catch (e) {
        console.error(`Failed to fetch files for PR #${pr.number}:`, e);
        prFiles[pr.number] = [];
      }
    }));

    const relations = await AnalysisService.detectRelationships(prsToAnalyze, prFiles);
    const conflicts = await AnalysisService.detectConflicts(prsToAnalyze, prFiles);
    const documentation = AnalysisService.generateDocumentation(commits);
    const metrics = AnalysisService.calculateMetrics(prs, conflicts);
    
    // Default skills if none provided
    const userSkills = (req.query.skills as string || "JavaScript,TypeScript").split(",");
    const recommendations = AnalysisService.getRecommendations(prsToAnalyze, prFiles, userSkills);

    res.json({ 
      prs: prsToAnalyze,
      commits,
      relations, 
      conflicts, 
      documentation,
      recommendations,
      metrics
    });
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze repository" });
  }
});

export default router;
