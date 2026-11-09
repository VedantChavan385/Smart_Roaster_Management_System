import React, { useState } from 'react';
import { User, Mail, Calendar, Briefcase, Award, Clock, AlertCircle } from 'lucide-react';

export default function EmployeeView({ roster, employees, brands, pods, selectedEmployeeId, onSelectEmployee }) {
  const [currentEmpId, setCurrentEmpId] = useState(selectedEmployeeId || employees[0]?.id || 'emp_01');

  if (!roster || !roster.shifts || employees.length === 0) {
    return <div className="p-8 text-center text-slate-400">No employee data.</div>;
  }

  const employee = employees.find(e => e.id === currentEmpId) || employees[0];
  const pod = pods.find(p => p.id === employee.podId);
  const primaryBrand = employee.assignedBrands?.[0] ? brands.find(b => b.id === employee.assignedBrands[0].brandId) : null;

  // Filter shifts for this employee
  const employeeShifts = roster.shifts
    .filter(s => s.employeeId === employee.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Compute personal monthly stats
  const workingDays = employeeShifts.filter(s => s.status === 'WORKING').length;
  const offDays = employeeShifts.filter(s => s.status === 'OFF').length;
  const leaveDays = employeeShifts.filter(s => s.status === 'LEAVE').length;
  const holidayDays = employeeShifts.filter(s => s.status === 'HOLIDAY').length;
  const backupDays = employeeShifts.filter(s => s.isBackup).length;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Employee Selector Bar */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select Employee:
          </label>
          <select
            value={currentEmpId}
            onChange={(e) => {
              setCurrentEmpId(e.target.value);
              if (onSelectEmployee) onSelectEmployee(e.target.value);
            }}
            className="bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({pods.find(p => p.id === emp.podId)?.name.split(' ')[1] || 'Pod'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Contract Weekly Offs: <strong className="text-slate-200">{employee.weeklyOffQuota} Day(s)/week</strong></span>
          <span>•</span>
          <span>Preferred Day: <strong className="text-slate-200">{employee.preferredOffDays?.map(d => dayNames[d]).join(', ') || 'Any'}</strong></span>
        </div>
      </div>

      {/* Employee Profile Header & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-lg">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">{employee.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Mail className="h-3 w-3" /> {employee.email}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Operational Pod:</span>
              <span className="text-slate-200 font-medium">{pod?.name || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Primary Account:</span>
              <span className="text-indigo-400 font-medium">{primaryBrand?.name || 'Floater Backup Pool'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Qualified Skills:</span>
              <div className="flex gap-1">
                {employee.skills.map(s => (
                  <span key={s} className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px] border border-indigo-800">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Attendance Breakdown */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Working Days</span>
            <div className="text-2xl font-bold text-emerald-400 mt-2">{workingDays}</div>
            <span className="text-[11px] text-slate-500 mt-1">Scheduled on duty</span>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Weekly Offs</span>
            <div className="text-2xl font-bold text-slate-300 mt-2">{offDays}</div>
            <span className="text-[11px] text-slate-500 mt-1">Rest & recuperation</span>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Leaves & Comp-Offs</span>
            <div className="text-2xl font-bold text-amber-400 mt-2">{leaveDays}</div>
            <span className="text-[11px] text-slate-500 mt-1">Approved absences</span>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Emergency Backups</span>
            <div className="text-2xl font-bold text-cyan-400 mt-2">{backupDays}</div>
            <span className="text-[11px] text-slate-500 mt-1">Floater coverage shifts</span>
          </div>
        </div>
      </div>

      {/* Monthly Timeline Cards */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 shadow-xl">
        <h4 className="font-semibold text-slate-200 text-sm mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-400" />
          Individual Monthly Schedule Timeline
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {employeeShifts.map(s => {
            const d = new Date(s.date);
            const dayOfWeek = dayNames[d.getDay()];
            const dayNumber = d.getDate();

            let borderStyle = 'border-slate-800 bg-slate-950/60';
            let badgeText = s.status;
            let badgeColor = 'bg-slate-800 text-slate-400';

            if (s.status === 'WORKING') {
              if (s.isBackup) {
                borderStyle = 'border-cyan-800/80 bg-cyan-950/30';
                badgeText = 'BACKUP';
                badgeColor = 'bg-cyan-950 text-cyan-300 border border-cyan-800';
              } else {
                borderStyle = 'border-emerald-800/80 bg-emerald-950/30';
                badgeText = s.process || 'WORK';
                badgeColor = 'bg-emerald-950 text-emerald-300 border border-emerald-800';
              }
            } else if (s.status === 'LEAVE') {
              borderStyle = 'border-amber-800/80 bg-amber-950/30';
              badgeColor = 'bg-amber-950 text-amber-300 border border-amber-800';
            } else if (s.status === 'HOLIDAY') {
              borderStyle = 'border-purple-800/80 bg-purple-950/30';
              badgeColor = 'bg-purple-950 text-purple-300 border border-purple-800';
            }

            return (
              <div 
                key={s.date} 
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between min-h-[90px] ${borderStyle}`}
                title={s.notes}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{dayNumber}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{dayOfWeek}</span>
                </div>

                <div className="my-1.5">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold truncate max-w-full ${badgeColor}`}>
                    {badgeText}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 truncate" title={s.notes}>
                  {s.notes || s.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

