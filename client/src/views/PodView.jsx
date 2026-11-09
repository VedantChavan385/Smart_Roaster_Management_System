import React, { useState } from 'react';
import { ShieldCheck, Mail, Users, Building, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function PodView({ roster, employees, brands, pods, onSelectEmployee }) {
  const [activePodId, setActivePodId] = useState(pods[0]?.id || 'pod_alpha');

  if (!roster || !roster.shifts) {
    return <div className="p-8 text-center text-slate-500">No roster loaded.</div>;
  }

  const activePod = pods.find(p => p.id === activePodId) || pods[0];
  const podEmployees = employees.filter(e => e.podId === activePodId);
  const podBrands = brands.filter(b => b.podId === activePodId);

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
                  ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/10'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  {pod.id.replace('_', ' ')}
                </span>
                {conflictCount > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertTriangle className="h-3 w-3" /> {conflictCount} Gaps
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" /> 100% Covered
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{pod.name}</h3>
              <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-500">
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
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-700">Pod Lead</span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-600">{activePod.description}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">{activePod.leadName}</h2>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>{activePod.leadEmail}</span>
            </div>
          </div>
        </div>

        {/* Assigned Brands in Pod */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-slate-700">Managed Brand Accounts ({podBrands.length})</span>
          <div className="flex flex-wrap gap-1.5 max-w-lg">
            {podBrands.map(b => (
              <span 
                key={b.id} 
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 shadow-2xs"
              >
                {b.name} ({b.staffingType === 'SINGLE_RESOURCE' ? '1-Agent' : 'Multi'})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pod Members Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h4 className="font-bold text-slate-800 text-sm">
            {activePod.name} – Team Schedule ({podEmployees.length} Members)
          </h4>
          <span className="text-xs text-slate-500 font-medium">
            Click on any member to inspect individual shift breakdown
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="sticky left-0 z-30 bg-slate-50 px-4 py-3 font-bold text-slate-800 min-w-[200px]">
                  Team Member
                </th>
                <th className="px-3 py-3 font-bold text-slate-700 min-w-[150px] border-r border-slate-200">
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
                      className={`px-2 py-2 text-center min-w-[65px] border-r border-slate-200 ${
                        isWeekend ? 'bg-indigo-50/50 text-indigo-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400 font-mono">{dayName}</div>
                      <div className="font-bold text-xs">{dayNum}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {podEmployees.map(emp => {
                const brand = emp.assignedBrands?.[0] ? brands.find(b => b.id === emp.assignedBrands[0].brandId) : null;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-4 py-2.5 min-w-[200px] border-r border-slate-200">
                      <div 
                        className="cursor-pointer"
                        onClick={() => onSelectEmployee && onSelectEmployee(emp.id)}
                      >
                        <div className="font-bold text-slate-900 hover:text-indigo-600">{emp.name}</div>
                        <div className="text-[11px] text-indigo-700 font-mono font-medium">{emp.skills.join(', ')}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 min-w-[150px] border-r border-slate-200">
                      {brand ? (
                        <div>
                          <div className="font-semibold text-slate-800 truncate">{brand.name}</div>
                          <div className="text-[10px] text-slate-500">{emp.assignedBrands[0].processes.join('+')}</div>
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Pod Floater
                        </span>
                      )}
                    </td>
                    {dates.map(dateStr => {
                      const shift = shiftLookup.get(`${dateStr}_${emp.id}`);
                      if (!shift) return <td key={dateStr} className="text-center text-slate-300">-</td>;

                      let badgeClass = 'bg-slate-100 text-slate-500 border border-slate-200';
                      let text = shift.status;

                      if (shift.status === 'WORKING') {
                        badgeClass = shift.isBackup ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200';
                        text = shift.isBackup ? 'BACKUP' : (shift.process || 'WORK');
                      } else if (shift.status === 'LEAVE') {
                        badgeClass = 'bg-amber-50 text-amber-800 border border-amber-300';
                        text = 'LEAVE';
                      } else if (shift.status === 'HOLIDAY') {
                        badgeClass = 'bg-purple-50 text-purple-800 border border-purple-200';
                        text = 'HOLIDAY';
                      }

                      return (
                        <td key={dateStr} className="px-1 py-2 text-center border-r border-slate-100">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold shadow-2xs ${badgeClass}`}>
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
