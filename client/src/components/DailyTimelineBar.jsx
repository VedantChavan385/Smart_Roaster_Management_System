import React from 'react';
import { Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function DailyTimelineBar({ dates, roster, selectedDate, onSelectDate }) {
  if (!dates || dates.length === 0 || !roster) return null;

  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-indigo-600" />
          Monthly Coverage Health Timeline (Click any day to inspect)
        </span>
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Fully Staffed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Coverage Gap
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-30 gap-1 text-center">
        {dates.map(dateStr => {
          const d = new Date(dateStr);
          const dayNum = d.getDate();
          const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;

          const dayConflicts = roster.conflicts.filter(c => c.date === dateStr);
          const hasGap = dayConflicts.length > 0;
          const isSelected = selectedDate === dateStr;

          let btnClass = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
          if (hasGap) {
            btnClass = 'bg-rose-50 border-rose-300 text-rose-800 font-bold hover:bg-rose-100 ring-1 ring-rose-300';
          } else {
            btnClass = 'bg-emerald-50/70 border-emerald-200 text-emerald-800 font-bold hover:bg-emerald-100';
          }

          if (isSelected) {
            btnClass += ' ring-2 ring-indigo-600 bg-indigo-50 text-indigo-900';
          }

          return (
            <button
              type="button"
              key={dateStr}
              onClick={() => onSelectDate && onSelectDate(isSelected ? null : dateStr)}
              className={`p-1 rounded-lg border text-xs transition-all flex flex-col items-center justify-between ${btnClass}`}
              title={`${dateStr}: ${hasGap ? `${dayConflicts.length} gaps` : '100% Covered'}`}
            >
              <span className="text-[9px] text-slate-400 font-mono font-medium">{dayName}</span>
              <span className="font-extrabold text-[11px]">{dayNum}</span>
              <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${hasGap ? 'bg-rose-600' : 'bg-emerald-500'}`}></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
