import React from 'react';
import { X, AlertTriangle, CheckCircle2, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';

export default function ConflictDrawer({ isOpen, onClose, conflicts, month, onApplyFix, isApplying }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Scheduling Conflicts & Gaps</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {conflicts.length} active coverage issue(s) detected for {month}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {conflicts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <h4 className="font-extrabold text-slate-900 text-base">All Operational Demands Satisfied!</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Every brand and process has full required staffing across the entire month.
              </p>
            </div>
          ) : (
            conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                      {conflict.date}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {conflict.brandName}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white text-slate-700 font-bold border border-slate-200 shadow-2xs">
                    {conflict.process}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {conflict.description}
                </p>

                {/* Suggested Resolution Actions */}
                {conflict.suggestedResolutions && conflict.suggestedResolutions.length > 0 && (
                  <div className="border-t border-rose-200/80 pt-3 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Recommended Smart Resolutions:
                    </span>
                    <div className="space-y-1.5">
                      {conflict.suggestedResolutions.map((res, rIdx) => (
                        <div
                          key={rIdx}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs hover:border-indigo-400 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Assign {res.backupEmployeeName}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                              {res.reason}
                            </div>
                          </div>

                          <button
                            disabled={isApplying}
                            onClick={() => onApplyFix && onApplyFix(conflict.id, res.backupEmployeeId)}
                            className="px-3 py-1 rounded-md text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors flex items-center gap-1 shrink-0 shadow-xs"
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
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Engine: Deterministic Constraint Solver v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
