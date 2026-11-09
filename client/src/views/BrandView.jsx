import React, { useState } from 'react';
import { Building2, CheckCircle2, AlertTriangle, Filter, Search, ArrowRight, ShieldAlert } from 'lucide-react';

export default function BrandView({ roster, brands, employees, pods, onResolveConflict }) {
  const [selectedStaffingType, setSelectedStaffingType] = useState('ALL');
  const [filterGapsOnly, setFilterGapsOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!roster || !roster.shifts) {
    return <div className="p-8 text-center text-slate-500">No roster loaded.</div>;
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

  // Filter brands
  const filteredBrands = brands.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedStaffingType === 'ALL' || b.staffingType === selectedStaffingType;
    const hasGaps = roster.conflicts.some(c => c.brandId === b.id);
    const matchesGapFilter = !filterGapsOnly || hasGaps;
    return matchesSearch && matchesType && matchesGapFilter;
  });

  // Calculate brand health stats
  const getBrandHealth = (brand) => {
    const brandConflicts = roster.conflicts.filter(c => c.brandId === brand.id);
    const hasGaps = brandConflicts.length > 0;
    return {
      conflictCount: brandConflicts.length,
      hasGaps
    };
  };

  return (
    <div className="space-y-4">
      {/* Filters and Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search brand name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Staffing Model Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedStaffingType}
              onChange={(e) => setSelectedStaffingType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="ALL">All Staffing Types (14 Brands)</option>
              <option value="SINGLE_RESOURCE">Single-Resource Brands (~80%)</option>
              <option value="MULTI_RESOURCE">Multi-Resource Brands (~20%)</option>
            </select>
          </div>

          {/* Gap Filter Toggle */}
          <button
            onClick={() => setFilterGapsOnly(!filterGapsOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              filterGapsOnly
                ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span>Show Only Brands with Gaps</span>
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <span className="h-4 w-4 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[10px] font-bold">✓</span>
            <span>Covered</span>
          </div>
          <div className="flex items-center gap-1.5 text-sky-700">
            <span className="h-4 w-4 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center text-[10px] font-bold">★</span>
            <span>Backup Cover</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700">
            <span className="h-4 w-4 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-[10px] font-bold">!</span>
            <span>Unstaffed Gap</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="h-4 w-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px]">-</span>
            <span>Closed</span>
          </div>
        </div>
      </div>

      {/* Brand Coverage Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[640px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="sticky left-0 z-30 bg-slate-50 px-4 py-3 font-bold text-slate-800 min-w-[240px] shadow-xs">
                  Brand & Operating Rule
                </th>
                <th className="sticky left-[240px] z-30 bg-slate-50 px-3 py-3 font-bold text-slate-700 min-w-[130px] border-r border-slate-200 shadow-xs">
                  Process
                </th>
                {dates.map(dateStr => {
                  const d = new Date(dateStr);
                  const dayNum = d.getDate();
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;

                  return (
                    <th
                      key={dateStr}
                      className={`px-1.5 py-2 text-center min-w-[42px] border-r border-slate-200 ${
                        isWeekend ? 'bg-indigo-50/50 text-indigo-900 font-bold' : 'text-slate-700 font-semibold'
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
            <tbody className="divide-y divide-slate-100">
              {filteredBrands.map(brand => {
                const assignedEmployees = employees.filter(e => brand.assignedEmployeeIds.includes(e.id));
                const health = getBrandHealth(brand);

                return brand.processes.map((proc, pIdx) => {
                  return (
                    <tr 
                      key={`${brand.id}_${proc.processName}`} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        pIdx === 0 ? 'border-t-2 border-slate-200' : ''
                      }`}
                    >
                      {/* Fixed Brand Column (only on first process row) */}
                      {pIdx === 0 ? (
                        <td
                          rowSpan={brand.processes.length}
                          className="sticky left-0 z-10 bg-white px-4 py-3 min-w-[240px] border-r border-slate-200 align-top shadow-xs"
                        >
                          <div className="font-bold text-slate-900 flex items-center justify-between gap-1.5">
                            <span className="truncate">{brand.name}</span>
                            {health.hasGaps ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                {health.conflictCount} Gaps
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-600">
                                100% OK
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              brand.staffingType === 'SINGLE_RESOURCE' 
                                ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                : 'bg-sky-50 text-sky-800 border border-sky-200'
                            }`}>
                              {brand.staffingType === 'SINGLE_RESOURCE' ? '1 Agent (80%)' : 'Multi-Staff'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {brand.defaultOperatingCalendar.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <div className="mt-2 text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-700">Assigned:</span>{' '}
                            {assignedEmployees.map(e => e.name).join(', ') || 'Unassigned'}
                          </div>
                        </td>
                      ) : null}

                      {/* Process Column */}
                      <td className="sticky left-[240px] z-10 bg-white px-3 py-2 min-w-[130px] border-r border-slate-200 shadow-xs">
                        <div className="font-bold text-indigo-700 font-mono">{proc.processName}</div>
                        <div className="text-[10px] text-slate-400">
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
                              className="px-1 py-1.5 text-center border-r border-slate-100 bg-rose-50/60 cursor-pointer group"
                              title={`${conflict.description}\nClick to view backup recommendation.`}
                              onClick={() => onResolveConflict && onResolveConflict(conflict)}
                            >
                              <div className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-rose-600 text-white font-bold text-xs shadow-xs group-hover:scale-110 transition-all">
                                !
                              </div>
                            </td>
                          );
                        }

                        if (workers.length > 0) {
                          const hasBackup = workers.some(w => w.isBackup);
                          return (
                            <td
                              key={dateStr}
                              className={`px-1 py-1.5 text-center border-r border-slate-100 ${
                                hasBackup ? 'bg-sky-50/40' : 'bg-emerald-50/30'
                              }`}
                              title={`Covered by: ${workers.map(w => w.name + (w.isBackup ? ' (Backup)' : '')).join(', ')}`}
                            >
                              <div className={`inline-flex items-center justify-center h-6 w-6 rounded-md text-[11px] font-bold ${
                                hasBackup 
                                  ? 'bg-sky-100 text-sky-800 border border-sky-300' 
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}>
                                {hasBackup ? '★' : '✓'}
                              </div>
                            </td>
                          );
                        }

                        // Not operating today (Closed)
                        return (
                          <td
                            key={dateStr}
                            className="px-1 py-1.5 text-center border-r border-slate-100 bg-slate-50 text-slate-400"
                            title="Brand / Process closed today per calendar rule"
                          >
                            <span className="text-slate-300 text-xs">-</span>
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
