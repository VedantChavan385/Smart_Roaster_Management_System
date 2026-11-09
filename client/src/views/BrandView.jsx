import React, { useState } from 'react';
import { Building2, CheckCircle2, AlertTriangle, Calendar, Users, Info } from 'lucide-react';

export default function BrandView({ roster, brands, employees, pods, onResolveConflict }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStaffingType, setSelectedStaffingType] = useState('ALL');

  if (!roster || !roster.shifts) {
    return <div className="p-8 text-center text-slate-400">No roster loaded.</div>;
  }

  const dates = Array.from(new Set(roster.shifts.map(s => s.date))).sort();

  // Create Conflict Lookup: `${date}_${brandId}_${process}` => conflict
  const conflictLookup = new Map();
  roster.conflicts.forEach(c => {
    conflictLookup.set(`${c.date}_${c.brandId}_${c.process}`, c);
  });

  // Create Daily Brand Process Working Staff Lookup: `${date}_${brandId}_${process}` => [empName]
  const coverageLookup = new Map();
  roster.shifts.forEach(s => {
    if (s.status === 'WORKING' && s.brandId) {
      // If process contains ' + ', e.g. 'CS + ACC + NDR'
      const procs = s.process ? s.process.split(' + ') : [];
      procs.forEach(p => {
        const key = `${s.date}_${s.brandId}_${p.trim()}`;
        if (!coverageLookup.has(key)) coverageLookup.set(key, []);
        const emp = employees.find(e => e.id === s.employeeId);
        coverageLookup.get(key).push({
          name: emp ? emp.name : s.employeeId,
          isBackup: s.isBackup
        });
      });
    }
  });

  const filteredBrands = brands.filter(b => {
    const matchesCategory = selectedCategory === 'ALL' || b.category === selectedCategory;
    const matchesType = selectedStaffingType === 'ALL' || b.staffingType === selectedStaffingType;
    return matchesCategory && matchesType;
  });

  const categories = Array.from(new Set(brands.map(b => b.category)));

  return (
    <div className="space-y-4">
      {/* Filters and Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">Staffing Model</label>
            <select
              value={selectedStaffingType}
              onChange={(e) => setSelectedStaffingType(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Staffing Types (14 Brands)</option>
              <option value="SINGLE_RESOURCE">Single-Resource Brands (~80%)</option>
              <option value="MULTI_RESOURCE">Multi-Resource Brands (~20%)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">Industry Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-3 w-3 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-[9px] font-bold">✓</span>
            <span>Covered</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="h-3 w-3 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-[9px] font-bold">!</span>
            <span>Gap (Action Needed)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="h-3 w-3 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px]">-</span>
            <span>Closed Today</span>
          </div>
        </div>
      </div>

      {/* Brand Coverage Matrix */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto max-h-[640px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="sticky left-0 z-30 bg-slate-900 px-4 py-3 font-semibold text-slate-200 min-w-[220px] shadow-sm">
                  Brand & Operating Rule
                </th>
                <th className="sticky left-[220px] z-30 bg-slate-900 px-3 py-3 font-semibold text-slate-300 min-w-[130px] border-r border-slate-800 shadow-sm">
                  Process
                </th>
                {dates.map(dateStr => {
                  const d = new Date(dateStr);
                  const dayNum = d.getDate();
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;

                  return (
                    <th
                      key={dateStr}
                      className={`px-1.5 py-2 text-center min-w-[42px] border-r border-slate-800/60 ${
                        isWeekend ? 'bg-slate-800/50 text-indigo-300' : 'text-slate-300'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400 font-mono">
                        {d.toLocaleDateString('en-US', { weekday: 'narrow' })}
                      </div>
                      <div className="font-bold text-xs">{dayNum}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBrands.map(brand => {
                const pod = pods.find(p => p.id === brand.podId);
                const assignedEmployees = employees.filter(e => brand.assignedEmployeeIds.includes(e.id));

                return brand.processes.map((proc, pIdx) => {
                  return (
                    <tr 
                      key={`${brand.id}_${proc.processName}`} 
                      className={`hover:bg-slate-800/20 transition-colors ${
                        pIdx === 0 ? 'border-t-2 border-slate-800/80' : ''
                      }`}
                    >
                      {/* Fixed Brand Column (only on first process row) */}
                      {pIdx === 0 ? (
                        <td
                          rowSpan={brand.processes.length}
                          className="sticky left-0 z-10 bg-slate-900/95 px-4 py-3 min-w-[220px] border-r border-slate-800 align-top shadow-sm"
                        >
                          <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate">{brand.name}</span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              brand.staffingType === 'SINGLE_RESOURCE' 
                                ? 'bg-amber-950/70 text-amber-300 border border-amber-800/50' 
                                : 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/50'
                            }`}>
                              {brand.staffingType === 'SINGLE_RESOURCE' ? '1 Agent (80%)' : 'Multi-Staff'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {brand.defaultOperatingCalendar.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="mt-2 text-[11px] text-slate-400">
                            <span className="font-medium text-slate-300">Assigned:</span>{' '}
                            {assignedEmployees.map(e => e.name).join(', ') || 'Unassigned'}
                          </div>
                        </td>
                      ) : null}

                      {/* Process Column */}
                      <td className="sticky left-[220px] z-10 bg-slate-900/95 px-3 py-2 min-w-[130px] border-r border-slate-800 shadow-sm">
                        <div className="font-semibold text-indigo-300 font-mono">{proc.processName}</div>
                        <div className="text-[10px] text-slate-500">
                          Min Req: {proc.minStaffing || 1}
                        </div>
                      </td>

                      {/* 30 Days Coverage Cells */}
                      {dates.map(dateStr => {
                        const conflict = conflictLookup.get(`${dateStr}_${brand.id}_${proc.processName}`);
                        const workers = coverageLookup.get(`${dateStr}_${brand.id}_${proc.processName}`) || [];

                        if (conflict) {
                          return (
                            <td
                              key={dateStr}
                              className="px-1 py-1.5 text-center border-r border-slate-800/40 bg-rose-950/40 cursor-pointer group"
                              title={`${conflict.description}\nClick to view backup recommendation.`}
                              onClick={() => onResolveConflict && onResolveConflict(conflict)}
                            >
                              <div className="inline-flex items-center justify-center h-6 w-6 rounded bg-rose-600/30 text-rose-300 border border-rose-500/80 group-hover:scale-110 group-hover:bg-rose-600 transition-all">
                                <AlertTriangle className="h-3.5 w-3.5" />
                              </div>
                            </td>
                          );
                        }

                        if (workers.length > 0) {
                          const hasBackup = workers.some(w => w.isBackup);
                          return (
                            <td
                              key={dateStr}
                              className={`px-1 py-1.5 text-center border-r border-slate-800/40 ${
                                hasBackup ? 'bg-cyan-950/20' : 'bg-emerald-950/20'
                              }`}
                              title={`Covered by: ${workers.map(w => w.name + (w.isBackup ? ' (Backup)' : '')).join(', ')}`}
                            >
                              <div className={`inline-flex items-center justify-center h-6 w-6 rounded text-[11px] font-bold ${
                                hasBackup 
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60' 
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60'
                              }`}>
                                ✓
                              </div>
                            </td>
                          );
                        }

                        // Not operating today (Closed)
                        return (
                          <td
                            key={dateStr}
                            className="px-1 py-1.5 text-center border-r border-slate-800/40 bg-slate-900/40 text-slate-600"
                            title="Brand / Process closed today per calendar rule"
                          >
                            <span className="text-slate-600 text-xs">-</span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

