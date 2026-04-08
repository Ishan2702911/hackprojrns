import { useState, useEffect } from "react";
import Timeline from "./Timeline";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/hooks/useAuth";

interface DashboardProps {
  onAnalysisUpdate?: (analysis: any) => void;
  view?: string;
  customRepo?: string;
}

function parseRepo(input: string) {
  if (!input) return null;
  
  // Handle full URL: https://github.com/facebook/react
  const urlMatch = input.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2].replace(".git", "") };
  }
  
  // Handle owner/repo: facebook/react
  const parts = input.split("/");
  if (parts.length === 2) {
    return { owner: parts[0], repo: parts[1] };
  }
  
  return null;
}

export default function Dashboard({ onAnalysisUpdate, view = "pulse", customRepo }: DashboardProps) {
  const { isAuthenticated } = useAuth();
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRepos();
    } else {
      setRepos([]);
      setSelectedRepo(null);
      setAnalysis(null);
      onAnalysisUpdate?.(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (customRepo) {
      const parsed = parseRepo(customRepo);
      if (parsed) {
        handleSelectRepo({ 
          name: parsed.repo, 
          owner: { login: parsed.owner },
          full_name: `${parsed.owner}/${parsed.repo}`
        });
      }
    }
  }, [customRepo]);

  const fetchRepos = async () => {
    try {
      const res = await fetch("/api/repos");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRepos(data);
        if (data.length > 0) {
          handleSelectRepo(data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch repos:", error);
    }
  };

  const handleSelectRepo = async (repo: any) => {
    setSelectedRepo(repo);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analysis/${repo.owner.login}/${repo.name}`);
      const data = await res.json();
      setAnalysis(data);
      onAnalysisUpdate?.(data);
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mt-16 p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">account_tree</span>
        </div>
        <h2 className="text-2xl font-headline font-bold mb-2">Connect your GitHub</h2>
        <p className="text-on-surface-variant max-w-md">
          Artenis requires access to your GitHub repositories to perform architectural analysis and dependency mapping.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-16 p-6 lg:p-8 flex flex-col gap-8 max-w-[1600px] mx-auto w-full">
      {/* Repo Selector & Hero Metric Row */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <select 
              className="bg-surface-container border border-outline-variant/20 rounded-md px-3 py-1 text-xs font-mono text-primary-fixed outline-none focus:ring-1 focus:ring-primary-container"
              value={selectedRepo?.full_name || ""}
              onChange={(e) => {
                const repo = repos.find(r => r.full_name === e.target.value);
                if (repo) handleSelectRepo(repo);
              }}
            >
              {repos.map(r => (
                <option key={r.id} value={r.full_name}>{r.full_name}</option>
              ))}
            </select>
            {isLoading && <span className="w-3 h-3 border-2 border-primary-container border-t-transparent rounded-full animate-spin"></span>}
          </div>
          <h2 className="text-4xl font-headline font-bold tracking-tight text-primary">
            {selectedRepo ? selectedRepo.name : "System Overdrive"}
          </h2>
          <p className="text-on-surface-variant font-label text-sm mt-1">
            Repository: <span className="text-primary-fixed">{selectedRepo?.full_name || "synth-engine-core-v4"}</span>
          </p>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Health Score</p>
            <p className="text-3xl font-headline font-bold text-secondary">
              {analysis?.metrics?.healthScore !== undefined ? `${analysis.metrics.healthScore}%` : "--"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Active Pull Requests</p>
            <p className="text-3xl font-headline font-bold text-primary-container">
              {analysis?.metrics?.activePRs !== undefined ? analysis.metrics.activePRs : "--"}
            </p>
          </div>
        </div>
      </div>

      {view === "pulse" || view === "pr-mapping" ? (
        <Timeline 
          prs={analysis?.prs || []} 
          relations={analysis?.relations || []} 
          conflicts={analysis?.conflicts || []} 
        />
      ) : null}

      {view === "pulse" || view === "conflicts" || view === "history" || view === "repositories" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Conflict Detection System */}
          {(view === "pulse" || view === "conflicts") && (
            <div className="lg:col-span-4 bg-surface-container rounded-xl flex flex-col border border-outline-variant/10 overflow-hidden">
              <div className="p-5 border-b border-outline-variant/5 flex items-center justify-between bg-surface-container-high/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error">emergency_home</span>
                  <h4 className="font-headline font-semibold text-xs uppercase tracking-widest">Potential Conflicts</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-error-container text-on-surface text-[10px] font-bold">
                  {analysis?.conflicts?.length || 0} Alerts
                </span>
              </div>
              <div className="p-2 space-y-2 flex-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                {analysis?.conflicts?.length > 0 ? (
                  analysis.conflicts.map((c: any, i: number) => (
                    <div key={i} className="p-3 bg-surface-container-highest/30 rounded flex items-start gap-4 hover:bg-surface-container-highest/50 transition-colors cursor-pointer group">
                      <span className="material-symbols-outlined text-on-surface-variant text-sm mt-1 group-hover:text-on-surface transition-colors">description</span>
                      <div className="flex-1">
                        <p className="text-xs font-mono text-on-surface">{c.file}</p>
                        <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">
                          Conflict between PR #{c.pr1} and PR #{c.pr2}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-on-surface-variant/40 p-4 text-center italic">No active conflicts detected.</p>
                )}
              </div>
              <div className="p-4 bg-surface-container-lowest/50">
                <button className="w-full py-2 border border-error/30 text-error text-[10px] font-bold uppercase tracking-widest rounded hover:bg-error/10 transition-all active:scale-[0.98]">
                  Resolve Dependencies
                </button>
              </div>
            </div>
          )}

          {/* Auto Documentation Panel / History */}
          {(view === "pulse" || view === "history") && (
            <div className="lg:col-span-4 glass-panel rounded-xl border border-outline-variant/20 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-outline-variant/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-fixed">auto_awesome</span>
                  <h4 className="font-headline font-semibold text-xs uppercase tracking-widest">
                    {view === "history" ? "Commit History" : "Auto-Documentation"}
                  </h4>
                </div>
              </div>
              <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                {view === "history" ? (
                  <div className="space-y-4">
                    {analysis?.commits?.map((c: any, i: number) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded bg-surface-container-highest shrink-0 flex items-center justify-center text-[10px] font-mono">
                          {c.sha.slice(0, 4)}
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">{c.commit.message}</p>
                          <p className="text-[10px] text-on-surface-variant mt-1">
                            {c.commit.author.name} • {new Date(c.commit.author.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : analysis?.documentation ? (
                  <>
                    <div>
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-tighter mb-2">Features</p>
                      <ul className="space-y-2">
                        {analysis.documentation.features.map((f: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-fixed mt-1.5 shrink-0 shadow-[0_0_8px_rgba(0,245,255,0.5)]"></div>
                            <p className="text-[11px] leading-relaxed text-on-surface">{f}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-outline-variant/10">
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-tighter mb-2">Fixes</p>
                      <ul className="space-y-2">
                        {analysis.documentation.fixes.map((f: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-error mt-1.5 shrink-0 shadow-[0_0_8px_rgba(255,180,171,0.5)]"></div>
                            <p className="text-[11px] leading-relaxed text-on-surface">{f}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className="text-[10px] text-on-surface-variant/40 text-center italic">Select a repository to generate documentation.</p>
                )}
              </div>
              <div className="p-4">
                <button className="w-full py-2 bg-secondary-container/20 text-secondary-fixed font-bold text-[10px] uppercase tracking-widest rounded hover:bg-secondary-container/30 transition-all active:scale-[0.98]">
                  {view === "history" ? "View Full History" : "Export Release Notes"}
                </button>
              </div>
            </div>
          )}

          {/* Skill-Based Recommendations / Repositories */}
          {(view === "pulse" || view === "repositories") && (
            <div className="lg:col-span-4 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-outline-variant/5 bg-surface-container-high/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-fixed">
                    {view === "repositories" ? "list" : "person_search"}
                  </span>
                  <h4 className="font-headline font-semibold text-xs uppercase tracking-widest">
                    {view === "repositories" ? "Your Repositories" : "Recommended for You"}
                  </h4>
                </div>
              </div>
              <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                {view === "repositories" ? (
                  <div className="space-y-2">
                    {repos.map((r: any) => (
                      <div 
                        key={r.id} 
                        onClick={() => handleSelectRepo(r)}
                        className={cn(
                          "p-3 rounded-lg border border-outline-variant/10 cursor-pointer transition-all hover:bg-surface-container-highest",
                          selectedRepo?.id === r.id ? "bg-surface-container-highest border-primary-container/30" : "bg-surface-container-lowest"
                        )}
                      >
                        <p className="text-xs font-bold">{r.name}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{r.description || "No description"}</p>
                      </div>
                    ))}
                  </div>
                ) : analysis?.recommendations?.length > 0 ? (
                  analysis.recommendations.map((rec: any, i: number) => (
                    <div key={i} className={cn(
                      "bg-surface-container-lowest p-4 rounded-lg border-l-2 relative overflow-hidden group cursor-pointer transition-all hover:translate-x-1",
                      rec.difficulty === "Moderate" ? "border-primary-container" : "border-secondary"
                    )}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono uppercase text-primary-fixed">PR #{rec.pr.number}</span>
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase",
                          rec.difficulty === "Moderate" ? "bg-primary-container/10 text-primary-container" : "bg-secondary-container/20 text-secondary-fixed"
                        )}>{rec.difficulty}</span>
                      </div>
                      <h5 className="text-xs font-bold mb-1 leading-tight">{rec.pr.title}</h5>
                      <p className="text-[10px] text-on-surface-variant mb-3">{rec.reason}</p>
                      <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all group-hover:gap-3 text-primary-fixed">
                        Start Fixing <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-on-surface-variant/40 text-center italic">No recommendations available.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
