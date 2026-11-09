import React, { useState } from 'react';
import { User, Shield, Briefcase, Filter, Search } from 'lucide-react';

export default function CompanyView({ roster, employees, brands, pods, onSelectEmployee }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPod, setSelectedPod] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  if (!roster || !roster.shifts) {
    return <div className="p-8 text-center text-slate-400">No roster data loaded.</div>;
  }

  // Extract all distinct dates in month
  const dates = Array.from(new Set(roster.shifts.map(s => s.date))).sort();

  // Create shift lookup: `${date}_${empId}` => shift
  const shiftLookup = new Map();
  roster.shifts.forEach(s => {
    shiftLookup.set(`${s.date}_${s.employeeId}`, s);
  });

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPod = selectedPod === 'ALL' || emp.podId === selectedPod;
    return matchesSearch && matchesPod;
  });

  const getStatusBadge = (shift) => {
    if (!shift) return <span className="text-slate-600">-</span>;

    switch (shift.status) {
      case 'WORKING':
        if (shift.isBackup) {
          return (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60" title={shift.notes}>
              BACKUP
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60" title={shift.notes}>
            {shift.process || 'WORK'}
          </span>
        );
      case 'OFF':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/50" title={shift.notes}>
            OFF
          </span>
        );
      case 'LEAVE':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60" title={shift.notes}>
            LEAVE
          </span>
        );
      case 'HOLIDAY':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/60" title={shift.notes}>
            HOLIDAY
          </span>
        );
      default:
        return <span className="text-slate-500 text-xs">{shift.status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee or skill (CS, ACC, NDR)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedPod}
              onChange={(e) => setSelectedPod(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Pods (3)</option>
              {pods.map(p => (
                <option key={p.id} value={p.id}>{p.name.split('(')[0]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Working
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Backup Cover
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Leave
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span> Holiday
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span> Off Day
          </span>
        </div>
      </div>

      {/* Monthly Roster Grid */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto max-h-[640px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="sticky left-0 z-30 bg-slate-900 px-4 py-3 font-semibold text-slate-200 min-w-[220px] shadow-sm">
                  Employee / Pod
                </th>
                <th className="sticky left-[220px] z-30 bg-slate-900 px-3 py-3 font-semibold text-slate-300 min-w-[160px] border-r border-slate-800 shadow-sm">
                  Primary Brand
                </th>
                {dates.map(dateStr => {
                  const d = new Date(dateStr);
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
                  const dayNum = d.getDate();
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;

                  return (
                    <th
                      key={dateStr}
                      className={`px-2 py-2 text-center min-w-[70px] border-r border-slate-800/60 ${
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
              {filteredEmployees.map((emp) => {
                const pod = pods.find(p => p.id === emp.podId);
                const assignedBrand = emp.assignedBrands?.[0] ? brands.find(b => b.id === emp.assignedBrands[0].brandId) : null;

                return (
                  <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Fixed Employee Column */}
                    <td className="sticky left-0 z-10 bg-slate-900/95 px-4 py-2.5 min-w-[220px] border-r border-slate-800 shadow-sm">
                      <div 
                        className="cursor-pointer group"
                        onClick={() => onSelectEmployee && onSelectEmployee(emp.id)}
                      >
                        <div className="font-medium text-slate-100 group-hover:text-indigo-400 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>{emp.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="text-slate-500">{pod ? pod.name.split(' ')[1] : ''}</span>
                          <span>•</span>
                          <span className="text-indigo-400/90 font-mono text-[10px]">{emp.skills.join(', ')}</span>
                        </div>
                      </div>
                    </td>

                    {/* Fixed Brand Column */}
                    <td className="sticky left-[220px] z-10 bg-slate-900/95 px-3 py-2.5 min-w-[160px] border-r border-slate-800 shadow-sm">
                      {assignedBrand ? (
                        <div>
                          <div className="font-medium text-slate-200 truncate max-w-[150px]" title={assignedBrand.name}>
                            {assignedBrand.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {assignedBrand.staffingType === 'SINGLE_RESOURCE' ? (
                              <span className="text-amber-400/80 font-mono">Single Resource (80%)</span>
                            ) : (
                              <span className="text-cyan-400/80 font-mono">Multi-Resource</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                          Floater / Backup Pool
                        </span>
                      )}
                    </td>

                    {/* Date Shift Cells */}
                    {dates.map(dateStr => {
                      const shift = shiftLookup.get(`${dateStr}_${emp.id}`);
                      return (
                        <td
                          key={dateStr}
                          className="px-1.5 py-2 text-center border-r border-slate-800/40"
                        >
                          {getStatusBadge(shift)}
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

