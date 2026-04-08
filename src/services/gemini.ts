import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getOracleResponse(prompt: string, history: { role: "user" | "model"; parts: { text: string }[] }[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: "You are Artenis Oracle, a synthetic architect AI assistant. You help developers analyze architecture, resolve PR conflicts, and optimize codebases. Your tone is professional, hyper-technical, and precise. You use technical jargon like 'logical intersection', 'stale closures', 'schema validation', and 'gRPC service definitions'. Keep responses concise and insightful." }],
        },
        ...history.map(h => ({
          role: h.role === "model" ? "model" : "user",
          parts: h.parts
        })),
        { role: "user", parts: [{ text: prompt }] }
      ],
    });

    return response.text || "I am currently experiencing a synchronization delay with the central architect core. Please re-attempt your query.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I am currently experiencing a synchronization delay with the central architect core. Please re-attempt your query.";
  }
}
