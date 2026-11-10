import React, { useState, useMemo } from 'react';
import { useRoster } from '../context/RosterContext';
import { useNavigation } from '../context/NavigationContext';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

import {
  User,
  Mail,
  Calendar,
  Briefcase,
  Award,
  Clock,
  Search,
  Filter,
  Plus,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Zap,
  RotateCcw,
} from 'lucide-react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EmployeeView({
  selectedEmployeeId: initialSelectedId,
  onSelectEmployee: onExternalSelect,
}) {
  const {
    employees,
    brands,
    pods,
    roster,
    month,
    openShiftEditor,
    setIsQuickAddOpen,
  } = useRoster();

  const { setActiveView } = useNavigation();

  // Selected employee for drilldown profile
  const [selectedEmpId, setSelectedEmpId] = useState(
    initialSelectedId || employees[0]?.id || null
  );

  // Tab mode: 'DIRECTORY' or 'PROFILE'
  const [viewMode, setViewMode] = useState(initialSelectedId ? 'PROFILE' : 'DIRECTORY');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPodId, setSelectedPodId] = useState('ALL');
  const [selectedSkill, setSelectedSkill] = useState('ALL');
  const [assignmentFilter, setAssignmentFilter] = useState('ALL'); // 'ALL' | 'DEDICATED' | 'FLOATERS'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Selected employee object
  const activeEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedEmpId) || employees[0] || null;
  }, [employees, selectedEmpId]);

  // Enhanced employees with calculated stats
  const enhancedEmployees = useMemo(() => {
    return employees.map((emp) => {
      const empPod = pods.find((p) => p.id === emp.podId);
      const primaryBrand = emp.assignedBrands?.[0]
        ? brands.find((b) => b.id === emp.assignedBrands[0].brandId)
        : null;

      const empShifts = roster?.shifts?.filter((s) => s.employeeId === emp.id) || [];
      const workingDays = empShifts.filter((s) => s.status === 'WORKING').length;
      const offDays = empShifts.filter((s) => s.status === 'WEEKLY_OFF' || s.status === 'OFF').length;
      const leaveDays = empShifts.filter((s) => s.status === 'LEAVE').length;
      const backupDays = empShifts.filter((s) => s.isBackup).length;

      return {
        ...emp,
        pod: empPod,
        primaryBrand,
        workingDays,
        offDays,
        leaveDays,
        backupDays,
        isFloater: !emp.assignedBrands || emp.assignedBrands.length === 0,
      };
    });
  }, [employees, pods, brands, roster]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return enhancedEmployees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPod = selectedPodId === 'ALL' || emp.podId === selectedPodId;
      const matchesSkill = selectedSkill === 'ALL' || emp.skills?.includes(selectedSkill);

      let matchesAssignment = true;
      if (assignmentFilter === 'DEDICATED') {
        matchesAssignment = !emp.isFloater;
      } else if (assignmentFilter === 'FLOATERS') {
        matchesAssignment = emp.isFloater;
      }

      return matchesSearch && matchesPod && matchesSkill && matchesAssignment;
    });
  }, [enhancedEmployees, searchTerm, selectedPodId, selectedSkill, assignmentFilter]);

  // Paginated employees
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  const handleOpenProfile = (empId) => {
    setSelectedEmpId(empId);
    setViewMode('PROFILE');
    if (onExternalSelect) onExternalSelect(empId);
  };

  // Profile data for activeEmployee
  const activeEmpStats = useMemo(() => {
    if (!activeEmployee || !roster?.shifts) return null;

    const empShifts = roster.shifts
      .filter((s) => s.employeeId === activeEmployee.id)
      .sort((a, b) => a.date.localeCompare(b.date));

    const empPod = pods.find((p) => p.id === activeEmployee.podId);
    const primaryBrand = activeEmployee.assignedBrands?.[0]
      ? brands.find((b) => b.id === activeEmployee.assignedBrands[0].brandId)
      : null;

    const workingDays = empShifts.filter((s) => s.status === 'WORKING').length;
    const offDays = empShifts.filter((s) => s.status === 'WEEKLY_OFF' || s.status === 'OFF').length;
    const leaveDays = empShifts.filter((s) => s.status === 'LEAVE').length;
    const holidayDays = empShifts.filter((s) => s.status === 'HOLIDAY').length;
    const backupDays = empShifts.filter((s) => s.isBackup).length;

    return {
      shifts: empShifts,
      pod: empPod,
      primaryBrand,
      workingDays,
      offDays,
      leaveDays,
      holidayDays,
      backupDays,
    };
  }, [activeEmployee, roster, pods, brands]);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Employee & Talent Management"
        subtitle="Directory of active team members, operational pod clusters, skill qualifications, and weekly off quotas."
        badge={`${employees.length} Active Staff`}
        badgeVariant="indigo"
        breadcrumbs={[
          { label: 'Workspace' },
          { label: 'Employees', onClick: () => setViewMode('DIRECTORY') },
          ...(viewMode === 'PROFILE' && activeEmployee
            ? [{ label: activeEmployee.name }]
            : []),
        ]}
        actions={
          viewMode === 'PROFILE' ? (
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              onClick={() => setViewMode('DIRECTORY')}
            >
              Back to Directory
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsQuickAddOpen(true)}
            >
              Onboard Employee
            </Button>
          )
        }
      />

      {/* 2. DIRECTORY VIEW */}
      {viewMode === 'DIRECTORY' ? (
        <div className="space-y-4">
          {/* Filters and Search Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
              {/* Search */}
              <div className="relative min-w-[200px] flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Pod Filter */}
              <select
                value={selectedPodId}
                onChange={(e) => {
                  setSelectedPodId(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Pods ({pods.length})</option>
                {pods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.split('(')[0]}
                  </option>
                ))}
              </select>

              {/* Skill Filter */}
              <select
                value={selectedSkill}
                onChange={(e) => {
                  setSelectedSkill(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Skills</option>
                <option value="CS">CS (Support)</option>
                <option value="ACC">ACC (Account)</option>
                <option value="NDR">NDR (Logistics)</option>
                <option value="Retention">Retention</option>
              </select>

              {/* Assignment Filter */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAssignmentFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    assignmentFilter === 'ALL'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({employees.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentFilter('DEDICATED')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    assignmentFilter === 'DEDICATED'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  Dedicated (80%)
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentFilter('FLOATERS')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    assignmentFilter === 'FLOATERS'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  Floaters
                </button>
              </div>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredEmployees.length} employee(s)
            </span>
          </div>

          {/* Employee Directory Grid */}
          {filteredEmployees.length === 0 ? (
            <EmptyState
              icon={User}
              title="No Employees Found"
              description="No staff profiles match the chosen search criteria."
              actionLabel="Reset Search"
              onAction={() => {
                setSearchTerm('');
                setSelectedPodId('ALL');
                setSelectedSkill('ALL');
                setAssignmentFilter('ALL');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedEmployees.map((emp) => (
                <Card
                  key={emp.id}
                  className="hover:border-slate-300 transition-all flex flex-col justify-between"
                  bodyClassName="p-4 space-y-3"
                >
                  {/* Avatar & Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                        {emp.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>

                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => handleOpenProfile(emp.id)}
                          className="font-bold text-sm text-slate-900 hover:text-indigo-600 truncate block text-left cursor-pointer"
                        >
                          {emp.name}
                        </button>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {emp.id} • {emp.pod ? emp.pod.name.split(' ')[1] : 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    <Badge variant={emp.isFloater ? 'indigo' : 'amber'} size="xs">
                      {emp.isFloater ? 'Floater' : 'Dedicated'}
                    </Badge>
                  </div>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap gap-1">
                    {emp.skills?.map((s) => (
                      <span
                        key={s}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Assignment & Off Day Info */}
                  <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Primary Account:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                        {emp.primaryBrand ? emp.primaryBrand.name : 'Floater Backup Pool'}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-500">
                      <span>Weekly Off Quota:</span>
                      <span className="font-semibold text-emerald-700">
                        {emp.weeklyOffQuota || 1} Day/Wk ({emp.preferredOffDays?.map((d) => DAY_NAMES[d]).join(', ') || 'Any'})
                      </span>
                    </div>
                  </div>

                  {/* Shift Stats Row */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
                      <div className="font-bold text-sm">{emp.workingDays}</div>
                      <div className="text-[9px] uppercase font-bold text-emerald-600">Working</div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                      <div className="font-bold text-sm">{emp.offDays}</div>
                      <div className="text-[9px] uppercase font-bold text-slate-500">Off Days</div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
                      <div className="font-bold text-sm">{emp.leaveDays}</div>
                      <div className="text-[9px] uppercase font-bold text-amber-600">Leaves</div>
                    </div>
                  </div>

                  {/* Profile Drilldown Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {emp.email}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenProfile(emp.id)}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>View Schedule</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Page {currentPage} of {totalPages}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="xs"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 3. PROFILE DRILLDOWN VIEW */
        activeEmployee && activeEmpStats && (
          <div className="space-y-6">
            {/* Employee Quick Switcher */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="staff-profile-selector" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Switch Staff Profile:
                </label>
                <select
                  id="staff-profile-selector"
                  value={activeEmployee.id}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 font-semibold cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({pods.find((p) => p.id === emp.podId)?.name.split(' ')[1] || 'Pod'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Contract Off Quota: <strong className="text-slate-800">{activeEmployee.weeklyOffQuota} Day(s)/week</strong></span>
                <span>•</span>
                <span>Preferred: <strong className="text-slate-800">{activeEmployee.preferredOffDays?.map((d) => DAY_NAMES[d]).join(', ') || 'Any'}</strong></span>
              </div>
            </div>

            {/* Profile Overview Card + Shift Breakdown Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left Profile Card */}
              <Card className="lg:col-span-1 p-5 space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-indigo-900/20 shrink-0">
                    {activeEmployee.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {activeEmployee.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {activeEmployee.id}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {activeEmployee.email}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Operational Pod:</span>
                    <span className="font-semibold text-slate-900">
                      {activeEmpStats.pod ? activeEmpStats.pod.name : 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Primary Account:</span>
                    <span className="font-semibold text-indigo-700">
                      {activeEmpStats.primaryBrand ? activeEmpStats.primaryBrand.name : 'Floater Backup Pool'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Qualified Skills:</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {activeEmployee.skills?.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px] border border-indigo-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Max Consecutive Days:</span>
                    <span className="font-semibold text-slate-800">
                      {activeEmployee.maxConsecutiveDays || 6} Days
                    </span>
                  </div>
                </div>
              </Card>

              {/* Attendance & Shift Breakdown Metrics */}
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Working Shifts
                  </span>
                  <div className="text-3xl font-extrabold text-emerald-600 mt-2">
                    {activeEmpStats.workingDays}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1">Scheduled in {month}</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Weekly Offs
                  </span>
                  <div className="text-3xl font-extrabold text-slate-700 mt-2">
                    {activeEmpStats.offDays}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1">Guaranteed off quota</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Approved Leaves
                  </span>
                  <div className="text-3xl font-extrabold text-amber-600 mt-2">
                    {activeEmpStats.leaveDays}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1">Planned absences</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Floater Backups
                  </span>
                  <div className="text-3xl font-extrabold text-sky-600 mt-2">
                    {activeEmpStats.backupDays}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1">Emergency pod covers</span>
                </div>
              </div>
            </div>

            {/* Individual Monthly Calendar Grid for Active Employee */}
            <Card
              title={`${activeEmployee.name} – ${month} Shift Calendar`}
              subtitle="Click any calendar cell to view shift timing or edit assignment in the right drawer."
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2">
                {activeEmpStats.shifts.map((shift) => {
                  const d = new Date(shift.date);
                  const dayName = DAY_NAMES[d.getDay()];
                  const dayNum = d.getDate();
                  const shiftBrand = brands.find((b) => b.id === shift.brandId);

                  let badgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
                  if (shift.status === 'WORKING') {
                    badgeColor = shift.isBackup
                      ? 'bg-sky-100 text-sky-900 border-sky-300'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-300';
                  } else if (shift.status === 'LEAVE') {
                    badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
                  } else if (shift.status === 'HOLIDAY') {
                    badgeColor = 'bg-purple-100 text-purple-900 border-purple-300';
                  }

                  return (
                    <button
                      key={shift.date}
                      type="button"
                      onClick={() => openShiftEditor(shift, activeEmployee)}
                      className={`p-2.5 rounded-xl border text-left transition-all hover:scale-105 hover:shadow-xs cursor-pointer ${badgeColor}`}
                      title={`Click to edit shift for ${shift.date}`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                        <span className="font-mono text-slate-500">{dayName}</span>
                        <span className="text-xs">{dayNum}</span>
                      </div>

                      <div className="font-bold text-xs truncate">
                        {shift.status === 'WORKING'
                          ? shiftBrand ? shiftBrand.name : (shift.process || 'Working')
                          : shift.status}
                      </div>

                      {shift.process && shift.status === 'WORKING' && (
                        <div className="text-[10px] font-medium opacity-80 mt-0.5">
                          {shift.process} {shift.isBackup && '• Floater'}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        )
      )}
    </div>
  );
}
