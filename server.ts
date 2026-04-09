import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// Register all API routes
import authRouter from "./src/server/routes/auth.js";
import reposRouter from "./src/server/routes/repos.js";
import analysisRouter from "./src/server/routes/analysis.js";
import summaryRouter from "./src/server/routes/summary.js";
import resolveConflictRouter from "./src/server/routes/resolve-conflict.js";

app.use("/api/auth", authRouter);
app.use("/api/repos", reposRouter);
app.use("/api/analysis", analysisRouter);
app.use("/api/summary", summaryRouter);
app.use("/api/resolve-conflict", resolveConflictRouter);

if (isProd) {
  const distPath = path.resolve(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  const prodServer = app.listen(PORT, () => {
    console.log(`Production server running on http://localhost:${PORT}`);
  });
  prodServer.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n❌ Port ${PORT} is already in use.\nRun: taskkill /F /PID $(netstat -ano | findstr :${PORT})\nThen restart.`);
    } else throw err;
    process.exit(1);
  });
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
  const devServer = app.listen(PORT, () => {
    console.log(`\n✅ Dev server running → http://localhost:${PORT}\n`);
  });
  devServer.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n❌ Port ${PORT} is in use. Kill it with:\n   taskkill /F /PID $(netstat -ano | findstr :${PORT})\nThen re-run npm run dev.\n`);
    } else throw err;
    process.exit(1);
  });
}