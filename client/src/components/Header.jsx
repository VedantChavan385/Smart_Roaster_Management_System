import React from 'react';
import { 
  Sparkles, 
  Calendar, 
  AlertTriangle, 
  RotateCcw, 
  Download, 
  Database, 
  Layers, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function Header({
  month,
  setMonth,
  roster,
  onGenerate,
  isGenerating,
  onOpenConflicts,
  onOpenSimulator,
  onOpenEntities,
  onResetSeed,
  isResetting,
  onExportCSV
}) {
  const criticalGapsCount = roster?.conflicts?.filter(c => c.severity === 'CRITICAL')?.length || 0;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-100 text-base tracking-tight">Smart Roster Engine</h1>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800">
                  DataStraw Ops
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Automated Multi-Brand Operations Scheduling & Constraint Solver
              </p>
            </div>
          </div>

          {/* Month Selector & Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Month Picker */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
              <Calendar className="h-3.5 w-3.5 text-indigo-400 mr-2" />
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="2026-11">November 2026</option>
                <option value="2026-12">December 2026</option>
                <option value="2026-10">October 2026</option>
              </select>
            </div>

            {/* Generate Roster Button */}
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isGenerating ? 'Solving...' : 'Generate Roster'}</span>
            </button>

            {/* What-If Simulator Button (Section 3-F) */}
            <button
              onClick={onOpenSimulator}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors flex items-center gap-1.5"
              title="Test post-generation sick leave or client requirement changes"
            >
              <span className="text-amber-400">🧪</span>
              <span className="hidden sm:inline">Simulate Change</span>
            </button>

            {/* Conflict Drawer Trigger Button */}
            <button
              onClick={onOpenConflicts}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                criticalGapsCount > 0
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80 hover:bg-rose-900 animate-pulse'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{criticalGapsCount} Gaps</span>
            </button>

            {/* Entity Rules Manager */}
            <button
              onClick={onOpenEntities}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 transition-colors"
              title="Inspect & manage brands, employees, and rules"
            >
              <Database className="h-4 w-4" />
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportCSV}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 transition-colors"
              title="Export roster to CSV"
            >
              <Download className="h-4 w-4" />
            </button>

            {/* Reset Data */}
            <button
              onClick={onResetSeed}
              disabled={isResetting}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 transition-colors disabled:opacity-50"
              title="Reset to 32-employee seed dataset"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

