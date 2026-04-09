import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useState, useRef, useEffect } from "react";

interface TimelineProps {
  prs: any[];
  relations: any[];
  conflicts: any[];
}

export default function Timeline({ prs = [], relations = [], conflicts = [] }: TimelineProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLiveView = () => {
    setIsLive(true);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
    setTimeout(() => setIsLive(false), 2000);
  };

  const nodeDistance = isZoomed ? 360 : 240;
  const containerWidth = Math.max(1600, prs.length * nodeDistance + 240);
  const prNodes = prs.map(pr => {
    const hasConflict = conflicts.some(c => c.pr1 === pr.number || c.pr2 === pr.number);
    return {
      id: `#${pr.number}`,
      label: pr.title,
      status: hasConflict ? "CONFLICT" : (pr.state === "open" ? "Open" : "Merged"),
      color: hasConflict ? "error" : (pr.state === "open" ? "primary" : "neutral"),
      conflict: hasConflict,
      active: pr.state === "open"
    };
  });

  return (
    <section className="bg-surface-container-low rounded-xl p-1 overflow-hidden relative border border-outline-variant/10">
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/5">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-fixed">timeline</span>
          <h3 className="font-headline font-semibold uppercase tracking-widest text-sm">PR Mapping Dependency Timeline</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsZoomed(!isZoomed)}
            className={cn("px-3 py-1 text-xs rounded transition-colors", isZoomed ? "bg-primary-container/20 text-primary-fixed border border-primary-container/30" : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant")}
          >
            {isZoomed ? "Zoom Out" : "Zoom In"}
          </button>
          <button 
            onClick={handleLiveView}
            className={cn("px-3 py-1 text-xs rounded transition-colors flex items-center gap-1", isLive ? "bg-secondary-container/20 text-secondary-fixed border border-secondary-container/30" : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant")}
          >
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-pulse" />}
            Live View
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="h-80 relative overflow-x-auto overflow-y-hidden custom-scrollbar bg-surface-container-lowest scroll-smooth transition-all duration-500">
        {/* SVG for Dependency Lines */}
        <svg 
          className="absolute inset-0 h-full pointer-events-none transition-all duration-500"
          style={{ width: containerWidth }}
        >
          {relations.map((rel, idx) => {
            const i1 = prs.findIndex(p => p.number === rel.pr1);
            const i2 = prs.findIndex(p => p.number === rel.pr2);
            if (i1 === -1 || i2 === -1) return null;

            const x1 = 120 + i1 * nodeDistance;
            const x2 = 120 + i2 * nodeDistance;
            const y1 = 160;
            const y2 = 160;

            return (
              <motion.path
                key={idx}
                d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1 - 40}, ${x2} ${y2}`}
                fill="none"
                stroke={
                  rel.relation === "shared_files" ? "var(--color-primary-container)" : 
                  rel.relation === "temporal" ? "var(--color-secondary)" :
                  "var(--color-tertiary)"
                }
                strokeWidth="2"
                strokeDasharray={rel.relation === "shared_files" ? "4" : "0"}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3 }}
                transition={{ duration: 1.5, delay: idx * 0.1 }}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 h-full transition-all duration-500" style={{ width: containerWidth }}>
          {prNodes.map((node, i) => (
            <div 
              key={node.id} 
              className="absolute top-1/2 -translate-y-1/2 group transition-all duration-500"
              style={{ left: 120 + i * nodeDistance - 24 }} // 24 is half of the w-12 node
            >
              <motion.div
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all group-hover:scale-110 relative z-30",
                  node.color === "primary" && "bg-primary-container/20 border-2 border-primary-container node-glow-primary",
                  node.color === "neutral" && "bg-surface-container-highest border-2 border-outline-variant",
                  node.color === "error" && "bg-error-container/30 border-2 border-error node-glow-error animate-pulse",
                  isLive && node.active && "shadow-[0_0_15px_rgba(0,245,255,0.8)]"
                )}
              >
                {node.conflict ? (
                  <span className="material-symbols-outlined text-error">warning</span>
                ) : (
                  <span className={cn("font-mono text-xs font-bold", node.active ? "text-primary-container" : "text-on-surface-variant")}>
                    {node.id}
                  </span>
                )}
              </motion.div>
              
              <div 
                className={cn(
                  "absolute left-1/2 -translate-x-1/2 text-center transition-all",
                  node.active || node.conflict || selectedNode === node.id ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                  i % 2 === 0 ? "-bottom-14" : "-top-14",
                  selectedNode === node.id ? "z-50 bg-surface-container-highest p-3 rounded-lg shadow-xl shadow-background border border-outline-variant/30 min-w-[220px]" : "z-20 whitespace-nowrap"
                )}
              >
                <p className={cn(
                  "text-[10px] font-mono transition-all",
                  selectedNode === node.id ? "text-on-surface whitespace-normal leading-relaxed text-balance" : "text-on-surface-variant truncate max-w-[150px]"
                )}>
                  {node.label}
                </p>
                {node.status && (
                  <p className={cn("text-[9px] font-bold uppercase tracking-widest mt-1", node.conflict ? "text-error" : "text-primary-fixed")}>
                    {node.status}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
