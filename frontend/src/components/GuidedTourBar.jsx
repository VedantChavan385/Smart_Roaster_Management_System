import React from 'react';
import { Compass, Sparkles, X } from 'lucide-react';

export default function GuidedTourBar({
  onRunScenario1,
  onRunScenario2,
  onRunScenario3,
  onRunScenario4,
  onClose,
}) {
  return (
    <div className="bg-indigo-900 text-white border-b border-indigo-800/80 px-4 sm:px-6 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Title */}
        <div className="flex items-center gap-2 font-semibold text-indigo-100">
          <div className="h-6 w-6 rounded-md bg-indigo-700 text-indigo-200 flex items-center justify-center shrink-0">
            <Compass className="h-3.5 w-3.5" />
          </div>
          <span>Evaluator Quick-Tour:</span>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRunScenario1}
            className="px-3 py-1 rounded-md bg-indigo-800/80 hover:bg-indigo-700 text-indigo-100 hover:text-white font-medium border border-indigo-700/60 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
            title="Inspect 80% single-resource brand staffing"
          >
            <span>🎯 1. 80% Single-Resource Rule</span>
          </button>

          <button
            type="button"
            onClick={onRunScenario2}
            className="px-3 py-1 rounded-md bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 hover:text-white font-medium border border-rose-800/60 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
            title="See how the engine catches Nov 15 leave gap"
          >
            <span>⚠️ 2. Leave Conflict on Nov 15</span>
          </button>

          <button
            type="button"
            onClick={onRunScenario3}
            className="px-3 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 hover:text-white font-medium border border-emerald-800/60 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
            title="Resolve gap with recommended backup floater"
          >
            <span>⚡ 3. 1-Click Backup Fix</span>
          </button>

          <button
            type="button"
            onClick={onRunScenario4}
            className="px-3 py-1 rounded-md bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 hover:text-white font-medium border border-amber-800/60 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
            title="Simulate sudden absence & see gap calculation"
          >
            <span>🔬 4. "What-If" Simulator</span>
          </button>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-indigo-300 hover:text-white hover:bg-indigo-800 transition-colors cursor-pointer ml-auto sm:ml-0"
          title="Dismiss tour banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
