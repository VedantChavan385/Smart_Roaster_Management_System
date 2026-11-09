import React from 'react';
import { 
  Sparkles, 
  Calendar, 
  AlertTriangle, 
  RotateCcw, 
  Download, 
  Database, 
  Layers, 
  CheckCircle2,
  Compass,
  Zap,
  Plus
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
  onOpenQuickAdd,
  onAutoResolveAll,
  isAutoResolving,
  onResetSeed,
  isResetting,
  onExportCSV,
  onToggleGuide,
  isGuideOpen
}) {
  const criticalGapsCount = roster?.conflicts?.filter(c => c.severity === 'CRITICAL')?.length || 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-base tracking-tight">Smart Roster Engine</h1>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  DataStraw CX Ops
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Automated Multi-Brand Operations Scheduling & Constraint Solver
              </p>
            </div>
          </div>

          {/* Month Selector & Action Controls */}
          <div className="flex items-center gap-2">
            {/* Guide Tour Toggle */}
            <button
              onClick={onToggleGuide}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                isGuideOpen
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Toggle Assessment Walkthrough Guide"
            >
              <Compass className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden xl:inline">Demo Tour</span>
            </button>

            {/* Month Picker */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <Calendar className="h-3.5 w-3.5 text-indigo-600 mr-2" />
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
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
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isGenerating ? 'Solving...' : 'Generate Roster'}</span>
            </button>

            {/* Auto-Resolve All Gaps Button */}
            {criticalGapsCount > 0 && (
              <button
                onClick={onAutoResolveAll}
                disabled={isAutoResolving}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5 animate-pulse"
                title="Automatically match and assign available floaters to all gaps"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>{isAutoResolving ? 'Auto-Filling...' : 'Auto-Resolve All'}</span>
              </button>
            )}

            {/* Quick Add Entity Button (Section 3-A) */}
            <button
              onClick={onOpenQuickAdd}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 shadow-2xs transition-colors flex items-center gap-1"
              title="Add a new Employee or Brand dynamically"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Add Entity</span>
            </button>

            {/* What-If Simulator Button (Section 3-F) */}
            <button
              onClick={onOpenSimulator}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors flex items-center gap-1"
              title="Test sudden leave or brand requirement changes"
            >
              <span>🧪</span>
              <span className="hidden lg:inline">Simulate</span>
            </button>

            {/* Conflict Drawer Trigger Button */}
            <button
              onClick={onOpenConflicts}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                criticalGapsCount > 0
                  ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
              <span>{criticalGapsCount} Gaps</span>
            </button>

            {/* Entity Rules Manager */}
            <button
              onClick={onOpenEntities}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Inspect full brands & employee rule records"
            >
              <Database className="h-4 w-4" />
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportCSV}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Export roster to CSV"
            >
              <Download className="h-4 w-4" />
            </button>

            {/* Reset Data */}
            <button
              onClick={onResetSeed}
              disabled={isResetting}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50"
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
