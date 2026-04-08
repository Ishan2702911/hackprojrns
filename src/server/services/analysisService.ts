import { GitHubPR, GitHubCommit, PRRelation, Conflict } from "../types";

export class AnalysisService {
  static async detectRelationships(prs: GitHubPR[], prFiles: Record<number, string[]>): Promise<PRRelation[]> {
    const relations: PRRelation[] = [];
    const TIME_WINDOW = 24 * 60 * 60 * 1000; // 24 hours
    
    for (let i = 0; i < prs.length; i++) {
      for (let j = i + 1; j < prs.length; j++) {
        const pr1 = prs[i];
        const pr2 = prs[j];
        const files1 = prFiles[pr1.number] || [];
        const files2 = prFiles[pr2.number] || [];
        
        const commonFiles = files1.filter(f => files2.includes(f));
        const timeDiff = Math.abs(new Date(pr1.created_at).getTime() - new Date(pr2.created_at).getTime());
        
        if (commonFiles.length > 0) {
          relations.push({
            pr1: pr1.number,
            pr2: pr2.number,
            relation: "shared_files"
          });
        } else if (timeDiff < TIME_WINDOW) {
          relations.push({
            pr1: pr1.number,
            pr2: pr2.number,
            relation: "temporal"
          });
        } else if (pr1.head.ref === pr2.base.ref || pr2.head.ref === pr1.base.ref) {
          relations.push({
            pr1: pr1.number,
            pr2: pr2.number,
            relation: "branch_chain"
          });
        }
      }
    }
    
    return relations;
  }

  static calculateMetrics(prs: GitHubPR[], conflicts: Conflict[]) {
    const activePRs = prs.filter(pr => pr.state === "open").length;
    const conflictCount = conflicts.length;
    
    // Base score 100, subtract 5 for each conflict, add 2 for each merged PR (if we had them)
    // For now, let's just use open PRs and conflicts
    let healthScore = 100 - (conflictCount * 5);
    healthScore = Math.max(0, Math.min(100, healthScore));

    return {
      healthScore,
      activePRs
    };
  }

  static async detectConflicts(prs: GitHubPR[], prFiles: Record<number, string[]>): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];
    
    for (let i = 0; i < prs.length; i++) {
      for (let j = i + 1; j < prs.length; j++) {
        const pr1 = prs[i];
        const pr2 = prs[j];
        
        if (pr1.state !== "open" || pr2.state !== "open") continue;

        const files1 = prFiles[pr1.number] || [];
        const files2 = prFiles[pr2.number] || [];
        
        const commonFiles = files1.filter(f => files2.includes(f));
        
        for (const file of commonFiles) {
          conflicts.push({
            pr1: pr1.number,
            pr2: pr2.number,
            conflict: true,
            file
          });
        }
      }
    }
    
    return conflicts;
  }

  static generateDocumentation(commits: GitHubCommit[]) {
    const documentation = {
      features: [] as string[],
      fixes: [] as string[],
      improvements: [] as string[]
    };

    commits.forEach(c => {
      const msg = c.commit.message.toLowerCase();
      if (msg.startsWith("feat") || msg.includes("add")) {
        documentation.features.push(c.commit.message);
      } else if (msg.startsWith("fix") || msg.includes("bug")) {
        documentation.fixes.push(c.commit.message);
      } else {
        documentation.improvements.push(c.commit.message);
      }
    });

    return {
      features: documentation.features.slice(0, 5),
      fixes: documentation.fixes.slice(0, 5),
      improvements: documentation.improvements.slice(0, 5)
    };
  }

  static getRecommendations(prs: GitHubPR[], prFiles: Record<number, string[]>, userSkills: string[]) {
    const skillMap: Record<string, string[]> = {
      "JavaScript": [".js", ".jsx", ".mjs"],
      "TypeScript": [".ts", ".tsx"],
      "CSS": [".css", ".scss", ".sass", ".less"],
      "HTML": [".html", ".htm"],
      "Python": [".py"],
      "Java": [".java"],
      "Go": [".go"],
      "Rust": [".rs"],
    };

    return prs.map(pr => {
      const files = prFiles[pr.number] || [];
      const prExtensions = new Set(files.map(f => f.slice(f.lastIndexOf("."))));
      
      let reason = "General contribution";
      let score = 0;
      let matchedSkill = "";

      for (const skill of userSkills) {
        const extensions = skillMap[skill] || [];
        if (extensions.some(ext => prExtensions.has(ext))) {
          score += 2;
          matchedSkill = skill;
          reason = `Matches your ${skill} skill`;
          break;
        }
      }

      if (pr.title.toLowerCase().includes("fix") || pr.title.toLowerCase().includes("bug")) {
        score += 1;
      }

      return { 
        pr, 
        score, 
        reason,
        difficulty: score > 2 ? "Moderate" : "Easy"
      };
    }).sort((a, b) => b.score - a.score).slice(0, 5);
  }
}
