import React, { useState } from 'react';
import { ShieldCheck, Mail, Users, Building, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function PodView({ roster, employees, brands, pods, onSelectEmployee }) {
  const [activePodId, setActivePodId] = useState(pods[0]?.id || 'pod_alpha');

  if (!roster || !roster.shifts) {
    return <div className="p-8 text-center text-slate-400">No roster loaded.</div>;
  }

  const activePod = pods.find(p => p.id === activePodId) || pods[0];
  const podEmployees = employees.filter(e => e.podId === activePodId);
  const podBrands = brands.filter(b => b.podId === activePodId);
  const podConflicts = roster.conflicts.filter(c => {
    const brand = brands.find(b => b.id === c.brandId);
    return brand && brand.podId === activePodId;
  });

  const dates = Array.from(new Set(roster.shifts.map(s => s.date))).sort();
  const shiftLookup = new Map();
  roster.shifts.forEach(s => {
    shiftLookup.set(`${s.date}_${s.employeeId}`, s);
  });

  return (
    <div className="space-y-6">
      {/* Pod Selection Tabs */}
      <div className="flex flex-wrap gap-3">
        {pods.map(pod => {
          const isSelected = pod.id === activePodId;
          const memberCount = employees.filter(e => e.podId === pod.id).length;
          const brandCount = brands.filter(b => b.podId === pod.id).length;
          const conflictCount = roster.conflicts.filter(c => {
            const b = brands.find(brand => brand.id === c.brandId);
            return b && b.podId === pod.id;
          }).length;

          return (
            <button
              key={pod.id}
              onClick={() => setActivePodId(pod.id)}
              className={`flex-1 min-w-[260px] p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-950/60 to-slate-900 border-indigo-500/80 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {pod.id.replace('_', ' ')}
                </span>
                {conflictCount > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800/60">
                    <AlertTriangle className="h-3 w-3" /> {conflictCount} Gaps
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    <CheckCircle2 className="h-3 w-3" /> 100% Covered
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-slate-100 text-sm">{pod.name}</h3>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-slate-400" /> {memberCount} Staff
                </span>
                <span className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-slate-400" /> {brandCount} Brands
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Pod Lead & Operational Summary Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">Pod Lead</span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-400">{activePod.description}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-0.5">{activePod.leadName}</h2>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>{activePod.leadEmail}</span>
            </div>
          </div>
        </div>

        {/* Assigned Brands in Pod */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-300">Managed Brand Accounts ({podBrands.length})</span>
          <div className="flex flex-wrap gap-1.5 max-w-lg">
            {podBrands.map(b => (
              <span 
                key={b.id} 
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
              >
                {b.name} ({b.staffingType === 'SINGLE_RESOURCE' ? '1-Agent' : 'Multi'})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pod Members Roster Table */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h4 className="font-semibold text-slate-200 text-sm">
            {activePod.name} – Team Schedule ({podEmployees.length} Members)
          </h4>
          <span className="text-xs text-slate-400">
            Click on any member to inspect individual shift breakdown
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="sticky left-0 z-30 bg-slate-900 px-4 py-3 font-semibold text-slate-200 min-w-[200px]">
                  Team Member
                </th>
                <th className="px-3 py-3 font-semibold text-slate-300 min-w-[150px] border-r border-slate-800">
                  Role / Brand
                </th>
                {dates.map(dateStr => {
                  const d = new Date(dateStr);
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
                  const dayNum = d.getDate();
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;

                  return (
                    <th
                      key={dateStr}
                      className={`px-2 py-2 text-center min-w-[65px] border-r border-slate-800/60 ${
                        isWeekend ? 'bg-slate-800/50 text-indigo-300' : 'text-slate-300'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400 font-mono">{dayName}</div>
                      <div className="font-bold text-xs">{dayNum}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {podEmployees.map(emp => {
                const brand = emp.assignedBrands?.[0] ? brands.find(b => b.id === emp.assignedBrands[0].brandId) : null;

                return (
                  <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-slate-900/95 px-4 py-2.5 min-w-[200px] border-r border-slate-800">
                      <div 
                        className="cursor-pointer"
                        onClick={() => onSelectEmployee && onSelectEmployee(emp.id)}
                      >
                        <div className="font-medium text-slate-100 hover:text-indigo-400">{emp.name}</div>
                        <div className="text-[11px] text-indigo-400/90 font-mono">{emp.skills.join(', ')}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 min-w-[150px] border-r border-slate-800">
                      {brand ? (
                        <div>
                          <div className="font-medium text-slate-200 truncate">{brand.name}</div>
                          <div className="text-[10px] text-slate-400">{emp.assignedBrands[0].processes.join('+')}</div>
                        </div>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                          Pod Floater
                        </span>
                      )}
                    </td>
                    {dates.map(dateStr => {
                      const shift = shiftLookup.get(`${dateStr}_${emp.id}`);
                      if (!shift) return <td key={dateStr} className="text-center text-slate-600">-</td>;

                      let badgeClass = 'bg-slate-800 text-slate-400';
                      let text = shift.status;

                      if (shift.status === 'WORKING') {
                        badgeClass = shift.isBackup ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800';
                        text = shift.isBackup ? 'BACKUP' : (shift.process || 'WORK');
                      } else if (shift.status === 'LEAVE') {
                        badgeClass = 'bg-amber-950 text-amber-300 border border-amber-800';
                        text = 'LEAVE';
                      } else if (shift.status === 'HOLIDAY') {
                        badgeClass = 'bg-purple-950 text-purple-300 border border-purple-800';
                        text = 'HOLIDAY';
                      }

                      return (
                        <td key={dateStr} className="px-1 py-2 text-center border-r border-slate-800/40">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${badgeClass}`}>
                            {text}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

