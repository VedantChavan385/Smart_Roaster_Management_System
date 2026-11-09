import React, { useState } from 'react';
import { User, Filter, Search } from 'lucide-react';

export default function CompanyView({ roster, employees, brands, pods, onSelectEmployee }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPod, setSelectedPod] = useState('ALL');

  if (!roster || !roster.shifts) {
    return <div className="p-8 text-center text-slate-500">No roster data loaded.</div>;
  }

  const dates = Array.from(new Set(roster.shifts.map(s => s.date))).sort();

  const shiftLookup = new Map();
  roster.shifts.forEach(s => {
    shiftLookup.set(`${s.date}_${s.employeeId}`, s);
  });

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPod = selectedPod === 'ALL' || emp.podId === selectedPod;
    return matchesSearch && matchesPod;
  });

  const getStatusBadge = (shift) => {
    if (!shift) return <span className="text-slate-300">-</span>;

    switch (shift.status) {
      case 'WORKING':
        if (shift.isBackup) {
          return (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs" title={shift.notes}>
              BACKUP
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs" title={shift.notes}>
            {shift.process || 'WORK'}
          </span>
        );
      case 'OFF':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200" title={shift.notes}>
            OFF
          </span>
        );
      case 'LEAVE':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs" title={shift.notes}>
            LEAVE
          </span>
        );
      case 'HOLIDAY':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200 shadow-2xs" title={shift.notes}>
            HOLIDAY
          </span>
        );
      default:
        return <span className="text-slate-400 text-xs">{shift.status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee or skill (CS, ACC, NDR)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedPod}
              onChange={(e) => setSelectedPod(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="ALL">All Pods (3)</option>
              {pods.map(p => (
                <option key={p.id} value={p.id}>{p.name.split('(')[0]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Working
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Backup Cover
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Leave
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Holiday
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Off Day
          </span>
        </div>
      </div>

      {/* Monthly Roster Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[640px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="sticky left-0 z-30 bg-slate-50 px-4 py-3 font-bold text-slate-800 min-w-[220px] shadow-xs">
                  Employee / Pod
                </th>
                <th className="sticky left-[220px] z-30 bg-slate-50 px-3 py-3 font-bold text-slate-700 min-w-[170px] border-r border-slate-200 shadow-xs">
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
                      className={`px-2 py-2 text-center min-w-[70px] border-r border-slate-200 ${
                        isWeekend ? 'bg-indigo-50/50 text-indigo-900 font-bold' : 'text-slate-700 font-semibold'
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
              {filteredEmployees.map((emp) => {
                const pod = pods.find(p => p.id === emp.podId);
                const assignedBrand = emp.assignedBrands?.[0] ? brands.find(b => b.id === emp.assignedBrands[0].brandId) : null;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Fixed Employee Column */}
                    <td className="sticky left-0 z-10 bg-white px-4 py-2.5 min-w-[220px] border-r border-slate-200 shadow-xs">
                      <div 
                        className="cursor-pointer group"
                        onClick={() => onSelectEmployee && onSelectEmployee(emp.id)}
                      >
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>{emp.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium">{pod ? pod.name.split(' ')[1] : ''}</span>
                          <span>•</span>
                          <span className="text-indigo-600 font-mono font-semibold text-[10px]">{emp.skills.join(', ')}</span>
                        </div>
                      </div>
                    </td>

                    {/* Fixed Brand Column */}
                    <td className="sticky left-[220px] z-10 bg-white px-3 py-2.5 min-w-[170px] border-r border-slate-200 shadow-xs">
                      {assignedBrand ? (
                        <div>
                          <div className="font-semibold text-slate-800 truncate max-w-[155px]" title={assignedBrand.name}>
                            {assignedBrand.name}
                          </div>
                          <div className="text-[10px]">
                            {assignedBrand.staffingType === 'SINGLE_RESOURCE' ? (
                              <span className="text-amber-700 font-mono font-bold">Single-Resource (80%)</span>
                            ) : (
                              <span className="text-sky-700 font-mono font-bold">Multi-Resource</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
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
                          className="px-1.5 py-2 text-center border-r border-slate-100 cursor-pointer"
                          onClick={() => onSelectEmployee && onSelectEmployee(emp.id)}
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
