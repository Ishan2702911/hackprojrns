import { useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";

interface SummaryData {
  user: {
    headline: string;
    bullets: string[];
    tldr: string;
  };
  team: {
    headline: string;
    bullets: string[];
    tldr: string;
    keywords: string[];
  };
  generatedAt: string;
}

interface SummariesProps {
  selectedRepo: any;
  commits: any[];
  isAuthenticated: boolean;
}

type Mode = "user" | "team";

export default function Summaries({ selectedRepo, commits, isAuthenticated }: SummariesProps) {
  const [mode, setMode] = useState<Mode>("user");
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRepo && commits?.length > 0) {
      generateSummary();
    } else {
      setSummary(null);
    }
  }, [selectedRepo?.full_name]);

  const generateSummary = async () => {
    if (!commits?.length) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: selectedRepo?.full_name,
          commits: commits.slice(0, 30).map((c: any) => ({
            sha: c.sha.slice(0, 7),
            message: c.commit.message.split("\n")[0],
            author: c.commit.author.name,
            date: c.commit.author.date,
          })),
        }),
      });
      if (!res.ok) throw new Error("Summary generation failed");
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      setError("Failed to generate summary. Check your Gemini API key.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mt-16 p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-4">summarize</span>
        <p className="text-on-surface-variant text-sm">Connect GitHub to generate summaries.</p>
      </div>
    );
  }

  if (!selectedRepo) {
    return (
      <div className="mt-16 p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-4">summarize</span>
        <p className="text-on-surface-variant text-sm">Select a repository from the Pulse tab first.</p>
      </div>
    );
  }

  return (
    <div className="mt-16 p-6 lg:p-8 flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight text-primary">Commit Summaries</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            AI-generated digest of <span className="text-primary-fixed font-mono">{selectedRepo.full_name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode toggle */}
          <div className="flex items-center bg-surface-container rounded-lg p-0.5 border border-outline-variant/20">
            <button
              onClick={() => setMode("user")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all",
                mode === "user"
                  ? "bg-primary-container/20 text-primary-fixed shadow-sm"
                  : "text-on-surface-variant/60 hover:text-on-surface"
              )}
            >
              <span className="material-symbols-outlined text-sm">person</span>
              For You
            </button>
            <button
              onClick={() => setMode("team")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all",
                mode === "team"
                  ? "bg-secondary-container/20 text-secondary-fixed shadow-sm"
                  : "text-on-surface-variant/60 hover:text-on-surface"
              )}
            >
              <span className="material-symbols-outlined text-sm">groups</span>
              For Team
            </button>
          </div>

          <button
            onClick={generateSummary}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-container/30 to-secondary-container/20 border border-primary-container/30 text-primary-fixed text-[11px] font-bold uppercase tracking-widest rounded-lg hover:from-primary-container/40 transition-all active:scale-[0.98] disabled:opacity-40"
          >
            <span className={cn("material-symbols-outlined text-sm", isLoading && "animate-spin")}>
              {isLoading ? "sync" : "auto_awesome"}
            </span>
            {isLoading ? "Generating…" : "Regenerate"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/30 rounded-xl">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-surface-container rounded-lg w-2/3" />
          <div className="h-4 bg-surface-container rounded w-full" />
          <div className="h-4 bg-surface-container rounded w-5/6" />
          <div className="h-4 bg-surface-container rounded w-4/5" />
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="h-32 bg-surface-container rounded-xl" />
            <div className="h-32 bg-surface-container rounded-xl" />
          </div>
        </div>
      )}

      {/* Summary content */}
      {summary && !isLoading && (
        <div className="space-y-6">
          {/* TL;DR card */}
          <div className={cn(
            "p-5 rounded-2xl border relative overflow-hidden",
            mode === "user"
              ? "bg-primary-container/10 border-primary-container/30"
              : "bg-secondary-container/10 border-secondary/30"
          )}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10"
              style={{ background: mode === "user" ? "rgba(0,245,255,0.4)" : "rgba(138,180,248,0.4)" }} />
            <div className="flex items-center gap-2 mb-3">
              <span className={cn(
                "material-symbols-outlined text-lg",
                mode === "user" ? "text-primary-fixed" : "text-secondary-fixed"
              )}>
                {mode === "user" ? "lightbulb" : "psychology"}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {mode === "user" ? "Plain English Summary" : "Technical Overview"}
              </span>
            </div>
            <p className="text-lg font-bold font-headline mb-2">
              {mode === "user" ? summary.user.headline : summary.team.headline}
            </p>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {mode === "user" ? summary.user.tldr : summary.team.tldr}
            </p>
          </div>

          {/* Key changes */}
          <div className="bg-surface-container rounded-2xl border border-outline-variant/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-fixed text-base">format_list_bulleted</span>
              <h4 className="text-xs font-bold uppercase tracking-widest font-headline">Key Changes</h4>
            </div>
            <ul className="divide-y divide-outline-variant/5">
              {(mode === "user" ? summary.user.bullets : summary.team.bullets).map((bullet, i) => (
                <li key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-surface-container-highest/30 transition-colors">
                  <div className={cn(
                    "w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5",
                    mode === "user"
                      ? "bg-primary-container/20 text-primary-fixed"
                      : "bg-secondary-container/20 text-secondary-fixed"
                  )}>
                    {i + 1}
                  </div>
                  <p className="text-sm leading-relaxed text-on-surface">{bullet}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Team-only: keywords */}
          {mode === "team" && summary.team.keywords?.length > 0 && (
            <div className="bg-surface-container rounded-xl border border-outline-variant/10 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Technical Keywords</p>
              <div className="flex flex-wrap gap-2">
                {summary.team.keywords.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 bg-surface-container-highest rounded-full text-[11px] font-mono text-primary-fixed border border-primary-container/20">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer meta */}
          <p className="text-[10px] text-on-surface-variant/40 text-right">
            Generated at {new Date(summary.generatedAt).toLocaleTimeString()} · based on {commits.slice(0, 30).length} recent commits
          </p>
        </div>
      )}

      {/* Empty state */}
      {!summary && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">summarize</span>
          <p className="text-sm text-on-surface-variant/40 italic">Click Regenerate to generate a summary.</p>
        </div>
      )}
    </div>
  );
}
