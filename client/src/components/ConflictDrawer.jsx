import React from 'react';
import { X, AlertTriangle, CheckCircle2, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';

export default function ConflictDrawer({ isOpen, onClose, conflicts, month, onApplyFix, isApplying }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Scheduling Conflicts & Gaps</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {conflicts.length} active coverage issue(s) detected for {month}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {conflicts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-slate-200 text-base">All Operational Demands Satisfied!</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Every brand and process has full required staffing across the entire month.
              </p>
            </div>
          ) : (
            conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className="p-4 rounded-xl border border-rose-900/60 bg-gradient-to-br from-rose-950/30 to-slate-900 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800/60">
                      {conflict.date}
                    </span>
                    <span className="font-semibold text-slate-200">
                      {conflict.brandName}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                    {conflict.process}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {conflict.description}
                </p>

                {/* Suggested Resolution Actions */}
                {conflict.suggestedResolutions && conflict.suggestedResolutions.length > 0 && (
                  <div className="border-t border-rose-950/80 pt-3 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                      Recommended Smart Resolutions:
                    </span>
                    <div className="space-y-1.5">
                      {conflict.suggestedResolutions.map((res, rIdx) => (
                        <div
                          key={rIdx}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs hover:border-indigo-500/60 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-200 flex items-center gap-1.5">
                              <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Assign {res.backupEmployeeName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              {res.reason}
                            </div>
                          </div>

                          <button
                            disabled={isApplying}
                            onClick={() => onApplyFix && onApplyFix(conflict.id, res.backupEmployeeId)}
                            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors flex items-center gap-1 shrink-0"
                          >
                            <span>Assign</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Engine: Deterministic Constraint Solver v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

