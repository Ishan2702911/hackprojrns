/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import OracleChat from "./components/OracleChat";
import { AuthProvider } from "./hooks/useAuth";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

export default function App() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [customRepo, setCustomRepo] = useState<string>("");

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-on-surface selection:bg-primary-container/30 selection:text-primary-container">
          <Sidebar />
          
          <main className="md:ml-64 min-h-screen flex flex-col relative">
            <Header onSearch={setCustomRepo} />
            
            <Routes>
              <Route path="/" element={<Navigate to="/pulse" replace />} />
              <Route path="/pulse" element={<Dashboard onAnalysisUpdate={setAnalysis} customRepo={customRepo} />} />
              <Route path="/repositories" element={<Dashboard onAnalysisUpdate={setAnalysis} view="repositories" customRepo={customRepo} />} />
              <Route path="/pr-mapping" element={<Dashboard onAnalysisUpdate={setAnalysis} view="pr-mapping" customRepo={customRepo} />} />
              <Route path="/conflicts" element={<Dashboard onAnalysisUpdate={setAnalysis} view="conflicts" customRepo={customRepo} />} />
              <Route path="/history" element={<Dashboard onAnalysisUpdate={setAnalysis} view="history" customRepo={customRepo} />} />
            </Routes>
            
            <OracleChat repoContext={analysis} />
            
            {/* Mobile Navigation (Bottom Bar) */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-low z-50 flex items-center justify-around h-16 border-t border-outline-variant/10">
              <a className="flex flex-col items-center gap-1 text-primary-fixed" href="#">
                <span className="material-symbols-outlined fill-1">insights</span>
                <span className="text-[9px] uppercase tracking-tighter font-headline">Pulse</span>
              </a>
              <a className="flex flex-col items-center gap-1 text-on-surface-variant/40" href="#">
                <span className="material-symbols-outlined">account_tree</span>
                <span className="text-[9px] uppercase tracking-tighter font-headline">Repos</span>
              </a>
              <a className="flex flex-col items-center gap-1 text-on-surface-variant/40" href="#">
                <span className="material-symbols-outlined">alt_route</span>
                <span className="text-[9px] uppercase tracking-tighter font-headline">Mapping</span>
              </a>
              <a className="flex flex-col items-center gap-1 text-on-surface-variant/40" href="#">
                <span className="material-symbols-outlined">warning</span>
                <span className="text-[9px] uppercase tracking-tighter font-headline">Conflict</span>
              </a>
            </nav>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
