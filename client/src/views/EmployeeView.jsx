import React, { useState } from 'react';
import { User, Mail, Calendar, Briefcase, Award, Clock, AlertCircle } from 'lucide-react';

export default function EmployeeView({ roster, employees, brands, pods, selectedEmployeeId, onSelectEmployee }) {
  const [currentEmpId, setCurrentEmpId] = useState(selectedEmployeeId || employees[0]?.id || 'emp_01');

  if (!roster || !roster.shifts || employees.length === 0) {
    return <div className="p-8 text-center text-slate-500">No employee data.</div>;
  }

  const employee = employees.find(e => e.id === currentEmpId) || employees[0];
  const pod = pods.find(p => p.id === employee.podId);
  const primaryBrand = employee.assignedBrands?.[0] ? brands.find(b => b.id === employee.assignedBrands[0].brandId) : null;

  const employeeShifts = roster.shifts
    .filter(s => s.employeeId === employee.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  const workingDays = employeeShifts.filter(s => s.status === 'WORKING').length;
  const offDays = employeeShifts.filter(s => s.status === 'OFF').length;
  const leaveDays = employeeShifts.filter(s => s.status === 'LEAVE').length;
  const holidayDays = employeeShifts.filter(s => s.status === 'HOLIDAY').length;
  const backupDays = employeeShifts.filter(s => s.isBackup).length;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Employee Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Select Employee:
          </label>
          <select
            value={currentEmpId}
            onChange={(e) => {
              setCurrentEmpId(e.target.value);
              if (onSelectEmployee) onSelectEmployee(e.target.value);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-semibold"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({pods.find(p => p.id === emp.podId)?.name.split(' ')[1] || 'Pod'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Contract Weekly Offs: <strong className="text-slate-800">{employee.weeklyOffQuota} Day(s)/week</strong></span>
          <span>•</span>
          <span>Preferred Day: <strong className="text-slate-800">{employee.preferredOffDays?.map(d => dayNames[d]).join(', ') || 'Any'}</strong></span>
        </div>
      </div>

      {/* Employee Profile Header & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-lg shadow-2xs">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">{employee.name}</h3>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                <Mail className="h-3 w-3" /> {employee.email}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Operational Pod:</span>
              <span className="text-slate-900 font-semibold">{pod?.name || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Primary Account:</span>
              <span className="text-indigo-700 font-semibold">{primaryBrand?.name || 'Floater Backup Pool'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Qualified Skills:</span>
              <div className="flex gap-1">
                {employee.skills.map(s => (
                  <span key={s} className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px] border border-indigo-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Attendance Breakdown */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Working Days</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-2">{workingDays}</div>
            <span className="text-[11px] text-slate-400 mt-1 font-medium">On duty shifts</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Weekly Offs</span>
            <div className="text-2xl font-extrabold text-slate-700 mt-2">{offDays}</div>
            <span className="text-[11px] text-slate-400 mt-1 font-medium">Rest & recuperation</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Leaves</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-2">{leaveDays}</div>
            <span className="text-[11px] text-slate-400 mt-1 font-medium">Approved absences</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Backups</span>
            <div className="text-2xl font-extrabold text-sky-600 mt-2">{backupDays}</div>
            <span className="text-[11px] text-slate-400 mt-1 font-medium">Floater covers</span>
          </div>
        </div>
      </div>

      {/* Monthly Timeline Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-600" />
          Individual Monthly Schedule Timeline
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {employeeShifts.map(s => {
            const d = new Date(s.date);
            const dayOfWeek = dayNames[d.getDay()];
            const dayNumber = d.getDate();

            let borderStyle = 'border-slate-200 bg-slate-50/50';
            let badgeText = s.status;
            let badgeColor = 'bg-slate-100 text-slate-500 border-slate-200';

            if (s.status === 'WORKING') {
              if (s.isBackup) {
                borderStyle = 'border-sky-200 bg-sky-50/40';
                badgeText = 'BACKUP';
                badgeColor = 'bg-sky-100 text-sky-800 border-sky-300';
              } else {
                borderStyle = 'border-emerald-200 bg-emerald-50/30';
                badgeText = s.process || 'WORK';
                badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
              }
            } else if (s.status === 'LEAVE') {
              borderStyle = 'border-amber-200 bg-amber-50/40';
              badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
            } else if (s.status === 'HOLIDAY') {
              borderStyle = 'border-purple-200 bg-purple-50/40';
              badgeColor = 'bg-purple-100 text-purple-800 border-purple-300';
            }

            return (
              <div 
                key={s.date} 
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between min-h-[90px] shadow-2xs ${borderStyle}`}
                title={s.notes}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900">{dayNumber}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">{dayOfWeek}</span>
                </div>

                <div className="my-1.5">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold truncate max-w-full border ${badgeColor}`}>
                    {badgeText}
                  </span>
                </div>

                <div className="text-[10px] text-slate-500 truncate font-medium" title={s.notes}>
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
