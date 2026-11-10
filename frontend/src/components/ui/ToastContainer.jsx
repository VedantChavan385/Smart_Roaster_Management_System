import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer({ toasts = [], onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';
        const isInfo = toast.type === 'info';
        const isSuccess = !isError && !isWarning && !isInfo;

        let bgStyles = 'bg-white border-slate-200 text-slate-800 shadow-xl';
        let IconComponent = CheckCircle2;
        let iconStyles = 'text-emerald-600';

        if (isSuccess) {
          bgStyles = 'bg-white border-emerald-200 text-slate-900 shadow-xl';
          IconComponent = CheckCircle2;
          iconStyles = 'text-emerald-600';
        } else if (isError) {
          bgStyles = 'bg-white border-rose-200 text-slate-900 shadow-xl';
          IconComponent = AlertCircle;
          iconStyles = 'text-rose-600';
        } else if (isWarning) {
          bgStyles = 'bg-white border-amber-200 text-slate-900 shadow-xl';
          IconComponent = AlertTriangle;
          iconStyles = 'text-amber-600';
        } else if (isInfo) {
          bgStyles = 'bg-white border-indigo-200 text-slate-900 shadow-xl';
          IconComponent = Info;
          iconStyles = 'text-indigo-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all animate-slide-in-right ${bgStyles}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <IconComponent className={`h-4 w-4 shrink-0 ${iconStyles}`} />
              <div className="min-w-0">
                <span className="font-semibold block truncate leading-snug">
                  {toast.msg}
                </span>
                {toast.subtext && (
                  <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                    {toast.subtext}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action.onClick();
                    if (onDismiss) onDismiss(toast.id);
                  }}
                  className="px-2.5 py-1 rounded-md text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  {toast.action.label}
                </button>
              )}

              <button
                type="button"
                onClick={() => onDismiss && onDismiss(toast.id)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

