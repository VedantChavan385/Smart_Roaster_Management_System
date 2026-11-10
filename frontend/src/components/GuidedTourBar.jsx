import React from 'react';
import { Compass, Sparkles, AlertOctagon, CheckCircle2, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';

export default function GuidedTourBar({ 
  onRunScenario1, 
  onRunScenario2, 
  onRunScenario3, 
  onRunScenario4,
  onClose
}) {
  return (
    <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50/70 border-b border-indigo-100 py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-900 font-bold">
          <Compass className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>Assessment Evaluator Quick-Tour:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Scenario 1 */}
          <button
            onClick={onRunScenario1}
            className="px-2.5 py-1 rounded-md bg-white border border-indigo-200 text-indigo-900 font-semibold shadow-xs hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1.5"
            title="Inspect 80% single-resource brand staffing"
          >
            <span>🎯 1. 80% Single-Resource Rule</span>
          </button>

          {/* Scenario 2 */}
          <button
            onClick={onRunScenario2}
            className="px-2.5 py-1 rounded-md bg-white border border-rose-200 text-rose-800 font-semibold shadow-xs hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1.5"
            title="See how the engine catches Nov 15 leave gap"
          >
            <span>⚠️ 2. Leave Conflict on Nov 15</span>
          </button>

          {/* Scenario 3 */}
          <button
            onClick={onRunScenario3}
            className="px-2.5 py-1 rounded-md bg-white border border-emerald-200 text-emerald-800 font-semibold shadow-xs hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1.5"
            title="Resolve gap with recommended backup floater"
          >
            <span>⚡ 3. One-Click Backup Fix</span>
          </button>

          {/* Scenario 4 */}
          <button
            onClick={onRunScenario4}
            className="px-2.5 py-1 rounded-md bg-white border border-amber-200 text-amber-800 font-semibold shadow-xs hover:bg-amber-600 hover:text-white transition-all flex items-center gap-1.5"
            title="Test Section 3-F: Handling post-generation changes"
          >
            <span>🧪 4. "What-If" Change Simulator</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-[11px] font-medium"
        >
          Dismiss ✕
        </button>
      </div>
    </div>
  );
}

