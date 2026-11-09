import React, { useState } from 'react';
import { Layers, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

export default function ProcessView({ roster, brands, employees }) {
  const [activeProcess, setActiveProcess] = useState('CS');
  const processes = ['CS', 'ACC', 'NDR', 'Retention'];

  if (!roster || !roster.shifts) {
    return <div className="p-8 text-center text-slate-400">No roster loaded.</div>;
  }

  const dates = Array.from(new Set(roster.shifts.map(s => s.date))).sort();

  // Find all brands that require this process
  const relevantBrands = brands.filter(b => 
    b.processes.some(p => p.processName === activeProcess)
  );

  // Calculate daily staffing for this process
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
                  ? 'bg-gradient-to-br from-indigo-950/60 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-sm text-indigo-400">{proc}</span>
                {conflictCount > 0 ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800/60">
                    {conflictCount} Gaps
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    Covered
                  </span>
                )}
              </div>
              <div className="font-semibold text-slate-200 text-xs truncate">{fullName}</div>
              <div className="mt-2 text-[11px] text-slate-400">
                Required by {brandCount} D2C brands
              </div>
            </button>
          );
        })}
      </div>

      {/* Staffing Velocity Overview */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-indigo-400" />
          Daily Staffing Distribution for {activeProcess}
        </h4>
        <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-30 gap-1 text-center">
          {dailyCounts.map(item => {
            const d = new Date(item.date);
            const hasGap = item.gapsCount > 0;

            return (
              <div
                key={item.date}
                className={`p-1.5 rounded border text-[11px] ${
                  hasGap 
                    ? 'bg-rose-950/50 border-rose-800 text-rose-300' 
                    : item.workingCount > 0 
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
                      : 'bg-slate-900 border-slate-800 text-slate-500'
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
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800">
          <h4 className="font-semibold text-slate-200 text-sm">
            Brand Schedules Requiring {activeProcess} ({relevantBrands.length} Accounts)
          </h4>
        </div>
        <div className="divide-y divide-slate-800/60">
          {relevantBrands.map(brand => {
            const procConfig = brand.processes.find(p => p.processName === activeProcess);
            const assigned = employees.filter(e => brand.assignedEmployeeIds.includes(e.id));
            const brandConflicts = roster.conflicts.filter(c => c.brandId === brand.id && c.process === activeProcess);

            return (
              <div key={brand.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100 text-sm">{brand.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      brand.staffingType === 'SINGLE_RESOURCE' ? 'bg-amber-950 text-amber-300' : 'bg-cyan-950 text-cyan-300'
                    }`}>
                      {brand.staffingType === 'SINGLE_RESOURCE' ? '1 Agent' : 'Multi'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Calendar: <span className="text-slate-300">{procConfig?.operatingCalendar || brand.defaultOperatingCalendar}</span> • Min Staffing: <span className="text-slate-300">{procConfig?.minStaffing || 1}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Assigned Resources</div>
                    <div className="text-xs font-medium text-slate-200">
                      {assigned.map(a => a.name).join(', ') || 'None'}
                    </div>
                  </div>

                  <div>
                    {brandConflicts.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                        <AlertTriangle className="h-3.5 w-3.5" /> {brandConflicts.length} Unstaffed Days
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
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

