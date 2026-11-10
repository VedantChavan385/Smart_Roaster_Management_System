import React, { useState } from 'react';
import { Layers, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

export default function ProcessView({ roster, brands, employees }) {
  const [activeProcess, setActiveProcess] = useState('CS');
  const processes = ['CS', 'ACC', 'NDR', 'Retention'];

  if (!roster || !roster.shifts) {
    return <div className="p-8 text-center text-slate-500">No roster loaded.</div>;
  }

  const dates = Array.from(new Set(roster.shifts.map(s => s.date))).sort();

  const relevantBrands = brands.filter(b => 
    b.processes.some(p => p.processName === activeProcess)
  );

  const dailyCounts = dates.map(dateStr => {
    let workingCount = 0;
    let gapsCount = 0;

    relevantBrands.forEach(brand => {
      const isWorking = roster.shifts.some(s => 
        s.date === dateStr && 
        s.brandId === brand.id && 
        s.status === 'WORKING' &&
        (s.process?.includes(activeProcess))
      );

      const hasConflict = roster.conflicts.some(c => 
        c.date === dateStr && 
        c.brandId === brand.id && 
        c.process === activeProcess
      );

      if (isWorking) workingCount++;
      if (hasConflict) gapsCount++;
    });

    return {
      date: dateStr,
      workingCount,
      gapsCount
    };
  });

  return (
    <div className="space-y-6">
      {/* Process Selection Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {processes.map(proc => {
          const isSelected = proc === activeProcess;
          const brandCount = brands.filter(b => b.processes.some(p => p.processName === proc)).length;
          const conflictCount = roster.conflicts.filter(c => c.process === proc).length;

          let fullName = '';
          if (proc === 'CS') fullName = 'Customer Support';
          if (proc === 'ACC') fullName = 'Abandoned Cart Conversions';
          if (proc === 'NDR') fullName = 'Non-Delivery Reports';
          if (proc === 'Retention') fullName = 'Retention & Loyalty';

          return (
            <button
              key={proc}
              onClick={() => setActiveProcess(proc)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/10'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-sm text-indigo-700">{proc}</span>
                {conflictCount > 0 ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    {conflictCount} Gaps
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Covered
                  </span>
                )}
              </div>
              <div className="font-bold text-slate-900 text-xs truncate">{fullName}</div>
              <div className="mt-2 text-[11px] text-slate-500 font-medium">
                Required by {brandCount} D2C brands
              </div>
            </button>
          );
        })}
      </div>

      {/* Staffing Velocity Overview */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-indigo-600" />
          Daily Staffing Distribution for {activeProcess}
        </h4>
        <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-30 gap-1 text-center">
          {dailyCounts.map(item => {
            const d = new Date(item.date);
            const hasGap = item.gapsCount > 0;

            return (
              <div
                key={item.date}
                className={`p-1.5 rounded-lg border text-[11px] ${
                  hasGap 
                    ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold' 
                    : item.workingCount > 0 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' 
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
                title={`${item.date}: ${item.workingCount} working, ${item.gapsCount} gaps`}
              >
                <div className="text-[9px] text-slate-400 font-mono">{d.getDate()}</div>
                <div className="font-bold">{item.workingCount}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Brand-by-Brand Process Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <h4 className="font-bold text-slate-800 text-sm">
            Brand Schedules Requiring {activeProcess} ({relevantBrands.length} Accounts)
          </h4>
        </div>
        <div className="divide-y divide-slate-100">
          {relevantBrands.map(brand => {
            const procConfig = brand.processes.find(p => p.processName === activeProcess);
            const assigned = employees.filter(e => brand.assignedEmployeeIds.includes(e.id));
            const brandConflicts = roster.conflicts.filter(c => c.brandId === brand.id && c.process === activeProcess);

            return (
              <div key={brand.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{brand.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      brand.staffingType === 'SINGLE_RESOURCE' 
                        ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                        : 'bg-sky-50 text-sky-800 border border-sky-200'
                    }`}>
                      {brand.staffingType === 'SINGLE_RESOURCE' ? '1 Agent' : 'Multi'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Calendar: <span className="text-slate-800 font-semibold">{procConfig?.operatingCalendar || brand.defaultOperatingCalendar}</span> • Min Staffing: <span className="text-slate-800 font-semibold">{procConfig?.minStaffing || 1}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-medium">Assigned Resources</div>
                    <div className="text-xs font-semibold text-slate-800">
                      {assigned.map(a => a.name).join(', ') || 'None'}
                    </div>
                  </div>

                  <div>
                    {brandConflicts.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="h-3.5 w-3.5" /> {brandConflicts.length} Unstaffed Days
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" /> 100% Scheduled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
