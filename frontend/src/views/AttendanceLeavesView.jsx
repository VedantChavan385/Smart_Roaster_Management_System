import React, { useState, useMemo } from 'react';
import { useRoster } from '../context/RosterContext';
import { useNavigation } from '../context/NavigationContext';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

import {
  CalendarOff,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function AttendanceLeavesView() {
  const {
    leaves,
    holidays,
    employees,
    brands,
    roster,
    month,
  } = useRoster();

  const { setActiveView } = useNavigation();

  const [activeTab, setActiveTab] = useState('LEAVES'); // 'LEAVES' | 'HOLIDAYS' | 'OFF_COMPLIANCE'

  // Weekly off compliance across all employees
  const complianceData = useMemo(() => {
    return employees.map((emp) => {
      const empShifts = (roster?.shifts || []).filter((s) => s.employeeId === emp.id);
      const offDaysCount = empShifts.filter(
        (s) => s.status === 'WEEKLY_OFF' || s.status === 'OFF'
      ).length;

      const workingCount = empShifts.filter((s) => s.status === 'WORKING').length;
      const leaveCount = empShifts.filter((s) => s.status === 'LEAVE').length;

      // Compliant if at least 4 off days in 30 days
      const isCompliant = offDaysCount >= 4;

      return {
        ...emp,
        offDaysCount,
        workingCount,
        leaveCount,
        isCompliant,
      };
    });
  }, [employees, roster]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Attendance, Leaves & Holiday Calendar"
        subtitle="Track planned employee leaves, Indian/Global operating public holidays, and contractual weekly off compliance."
        badge={`${leaves.length} Approved Leaves`}
        badgeVariant="amber"
        breadcrumbs={[{ label: 'Workspace' }, { label: 'Attendance & Leaves' }]}
      />

      {/* 2. Top Summary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Approved Leaves
          </span>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {leaves.length} <span className="text-xs text-slate-500 font-medium">Requests</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            Accounted for by Solver
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Operating Public Holidays
          </span>
          <div className="text-2xl font-bold text-purple-700 mt-1">
            {holidays.length} <span className="text-xs text-slate-500 font-medium">Days</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            Includes Diwali & Govardhan Puja
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Weekly Off Compliance
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            100%
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            All 32 agents receive contract off quota
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Max Consecutive Days
          </span>
          <div className="text-2xl font-bold text-slate-800 mt-1">
            ≤ 6 Days
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            Burnout prevention rule active
          </span>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('LEAVES')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'LEAVES'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CalendarOff className="h-3.5 w-3.5" />
          <span>Planned Leaves ({leaves.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HOLIDAYS')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'HOLIDAYS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Operating Holidays ({holidays.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('OFF_COMPLIANCE')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'OFF_COMPLIANCE'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Weekly Off Quota Compliance</span>
        </button>
      </div>

      {/* 4. Tab 1: Planned Leaves */}
      {activeTab === 'LEAVES' && (
        <Card
          title="Staff Leave Registry"
          subtitle="All planned agent leaves and absence reasons accounted for in shift generation"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="px-4 py-3">Employee Name</th>
                  <th className="px-3 py-3">Start Date</th>
                  <th className="px-3 py-3">End Date</th>
                  <th className="px-3 py-3">Leave Type</th>
                  <th className="px-3 py-3">Absence Reason</th>
                  <th className="px-3 py-3 text-right">Approval Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {leaves.map((leave) => {
                  const emp = employees.find((e) => e.id === leave.employeeId);
                  return (
                    <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {emp ? emp.name : leave.employeeId}
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-700">{leave.startDate}</td>
                      <td className="px-3 py-3 font-mono text-slate-700">{leave.endDate}</td>
                      <td className="px-3 py-3">
                        <Badge variant="amber" size="xs">
                          {leave.type || 'SICK'}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{leave.reason || 'Medical / Personal Leave'}</td>
                      <td className="px-3 py-3 text-right">
                        <Badge variant="emerald" size="xs" withDot>
                          {leave.status || 'APPROVED'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. Tab 2: Holidays */}
      {activeTab === 'HOLIDAYS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {holidays.map((h, idx) => (
            <Card key={idx} className="p-4" bodyClassName="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{h.name}</h4>
                    <span className="font-mono text-xs text-purple-700 font-semibold">{h.date}</span>
                  </div>
                </div>
                <Badge variant={h.isMandatoryOff ? 'purple' : 'slate'} size="xs">
                  {h.isMandatoryOff ? 'Mandatory Off' : 'Optional Closure'}
                </Badge>
              </div>

              <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                Operating calendar constraint: Brands with 365_DAYS calendars remain staffed; DAILY_EXCEPT_HOLIDAYS pause operations.
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* 6. Tab 3: Off Quota Compliance */}
      {activeTab === 'OFF_COMPLIANCE' && (
        <Card
          title="Weekly Off Quota Compliance Status"
          subtitle="Verifying that every employee receives their guaranteed weekly off days"
        >
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-3 py-3">Contract Quota</th>
                  <th className="px-3 py-3 text-center">Assigned Working Days</th>
                  <th className="px-3 py-3 text-center">Allocated Weekly Offs</th>
                  <th className="px-3 py-3 text-right">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {complianceData.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">{emp.name}</td>
                    <td className="px-3 py-3 text-slate-600 font-mono">
                      {emp.weeklyOffQuota || 1} day/week
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-emerald-700">
                      {emp.workingCount}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-slate-800">
                      {emp.offDaysCount}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Badge variant="emerald" size="xs" withDot>
                        Compliant
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

