import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { GoogleGenAI } from "@google/genai";
import { cn } from "@/src/lib/utils";

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

interface OracleChatProps {
  repoContext?: any;
}

export default function OracleChat({ repoContext }: OracleChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      parts: [{ text: "I am Artenis Oracle. I can help you navigate this repository's architecture, explain conflicts, and suggest where to contribute. How can I assist you today?" }],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", parts: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages,
          {
            role: "user",
            parts: [{ text: `You are Artenis Oracle, a synthetic architect AI assistant.
            
            Current Repository Context:
            - Active PRs: ${repoContext?.metrics?.activePRs || 0}
            - Health Score: ${repoContext?.metrics?.healthScore || 0}%
            - Conflicts: ${JSON.stringify(repoContext?.conflicts || [])}
            - PR Relationships: ${JSON.stringify(repoContext?.relations || [])}
            - Recent Commits: ${JSON.stringify(repoContext?.commits?.slice(0, 5) || [])}
            - Recommendations: ${JSON.stringify(repoContext?.recommendations || [])}
            
            User message: ${input}` }],
          }
        ],
        config: {
          systemInstruction: "You are Artenis Oracle, a synthetic architect AI assistant. You help developers understand repository structures, PR relationships, and conflicts. Use the provided context to give specific, technical, and helpful advice. Be concise and professional."
        }
      });
      
      const modelMessage: Message = { role: "model", parts: [{ text: response.text || "I am currently experiencing a synchronization delay." }] };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = { 
        role: "model", 
        parts: [{ text: "I am currently experiencing a synchronization delay. Please check your uplink." }] 
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 lg:w-96 flex flex-col">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="glass-panel border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-surface-container-high to-surface-container p-4 border-b border-outline-variant/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-fixed text-lg fill-1">smart_toy</span>
                </div>
                <div>
                  <p className="text-xs font-bold font-headline">Artenis Oracle</p>
                  <p className="text-[9px] text-primary-fixed flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed-dim animate-pulse"></span> Analyzing local dependencies...
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 min-h-[200px]">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex items-start gap-3", msg.role === "user" && "flex-row-reverse")}>
                  <div className={cn(
                    "rounded-xl p-3 max-w-[85%] text-xs leading-relaxed",
                    msg.role === "model" 
                      ? "bg-surface-container-highest/60 rounded-tl-none" 
                      : "bg-primary-container text-background rounded-tr-none font-medium"
                  )}>
                    <div className="prose prose-invert prose-xs max-w-none">
                      <ReactMarkdown>
                        {msg.parts[0].text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest/20 rounded-full w-fit">
                  <span className="w-1 h-1 bg-on-surface-variant rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                  <span className="w-1 h-1 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-surface-container-lowest/40 border-t border-outline-variant/10">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-lg py-2 px-3 pr-10 text-xs focus:ring-1 focus:ring-primary-fixed focus:border-transparent outline-none transition-all"
                  placeholder="Ask the Oracle..."
                  type="text"
                />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-fixed hover:scale-110 transition-transform disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">send</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-container to-secondary-container shadow-2xl flex items-center justify-center text-background hover:scale-110 transition-transform self-end"
        >
          <span className="material-symbols-outlined text-2xl fill-1">smart_toy</span>
        </motion.button>
      )}
    </div>
  );
}
