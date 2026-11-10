import React, { useState, useMemo } from 'react';
import { useRoster } from '../context/RosterContext';
import { useNavigation } from '../context/NavigationContext';
import PageHeader from '../components/layout/PageHeader';
import DailyTimelineBar from '../components/DailyTimelineBar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';

import {
  Calendar,
  Search,
  Filter,
  Sparkles,
  Zap,
  Sliders,
  FileSpreadsheet,
  Users,
  Building2,
  Layers,
  Activity,
  User,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function RosterSchedulingView() {
  const {
    month,
    roster,
    employees,
    brands,
    pods,
    criticalGapsCount,
    generateRoster,
    isGenerating,
    autoResolveAll,
    isAutoResolving,
    exportCSV,
    openShiftEditor,
    setSelectedEmployeeId,
    setIsConflictDrawerOpen,
    setIsSimulatorModalOpen,
  } = useRoster();

  const { setActiveView } = useNavigation();

  // Perspective & Calendar View Modes
  const [activePerspective, setActivePerspective] = useState('COMPANY'); // 'COMPANY' | 'PODS' | 'BRANDS' | 'EMPLOYEE'
  const [calendarMode, setCalendarMode] = useState('MONTH'); // 'MONTH' | 'WEEK'
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0); // 0 to 4 (weeks in month)

  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPodId, setSelectedPodId] = useState('ALL');
  const [selectedBrandId, setSelectedBrandId] = useState('ALL');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'LEAVES_ONLY' | 'FLOATERS_ONLY' | 'BACKUP_ONLY'
  const [focusedDate, setFocusedDate] = useState(null);

  // Derive unique sorted dates
  const allDates = useMemo(() => {
    if (!roster?.shifts) return [];
    return Array.from(new Set(roster.shifts.map((s) => s.date))).sort();
  }, [roster]);

  // Group dates into 7-day weeks for weekly view
  const weeklyChunks = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < allDates.length; i += 7) {
      chunks.push(allDates.slice(i, i + 7));
    }
    return chunks;
  }, [allDates]);

  // Visible dates based on Monthly vs Weekly view
  const visibleDates = calendarMode === 'MONTH' ? allDates : weeklyChunks[selectedWeekIndex] || allDates.slice(0, 7);

  // Fast Shift Lookup Map: key = `${date}_${employeeId}`
  const shiftLookup = useMemo(() => {
    const map = new Map();
    if (roster?.shifts) {
      roster.shifts.forEach((s) => {
        map.set(`${s.date}_${s.employeeId}`, s);
      });
    }
    return map;
  }, [roster]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPod = selectedPodId === 'ALL' || emp.podId === selectedPodId;

      const matchesBrand =
        selectedBrandId === 'ALL' ||
        emp.assignedBrands?.some((b) => b.brandId === selectedBrandId);

      let matchesFilter = true;
      if (filterMode === 'LEAVES_ONLY') {
        matchesFilter = roster?.shifts?.some(
          (s) => s.employeeId === emp.id && s.status === 'LEAVE'
        );
      } else if (filterMode === 'FLOATERS_ONLY') {
        matchesFilter = !emp.assignedBrands || emp.assignedBrands.length === 0;
      } else if (filterMode === 'BACKUP_ONLY') {
        matchesFilter = roster?.shifts?.some(
          (s) => s.employeeId === emp.id && s.isBackup
        );
      }

      return matchesSearch && matchesPod && matchesBrand && matchesFilter;
    });
  }, [employees, roster, searchTerm, selectedPodId, selectedBrandId, filterMode]);

  // Status badge renderer for a shift cell
  const renderShiftBadge = (shift) => {
    if (!shift) return <span className="text-slate-300">-</span>;

    switch (shift.status) {
      case 'WORKING':
        if (shift.isBackup) {
          return (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300 shadow-2xs hover:bg-sky-200 transition-colors"
              title={`Backup Floater: ${shift.notes || 'Emergency assignment'}`}
            >
              BACKUP
            </span>
          );
        }
        return (
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs hover:bg-emerald-100 transition-colors"
            title={`${shift.process || 'CS'} on duty: 09:00 - 18:00`}
          >
            {shift.process || 'CS'}
          </span>
        );
      case 'WEEKLY_OFF':
      case 'OFF':
        return (
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition-colors"
            title="Weekly Off Quota"
          >
            OFF
          </span>
        );
      case 'LEAVE':
        return (
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs hover:bg-amber-200 transition-colors"
            title={shift.notes || 'Approved Planned Leave'}
          >
            LEAVE
          </span>
        );
      case 'HOLIDAY':
        return (
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs hover:bg-purple-200 transition-colors"
            title="Public Operating Holiday"
          >
            HOLIDAY
          </span>
        );
      default:
        return <span className="text-slate-400 text-xs">{shift.status}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Header with Solver Actions & Export */}
      <PageHeader
        title="Roster & Scheduling Matrix"
        subtitle="Dynamic multi-brand shift allocation, automated constraints solver and right-side assignment editor."
        badge={`${month} Schedule`}
        badgeVariant="indigo"
        breadcrumbs={[{ label: 'Workspace' }, { label: 'Roster & Scheduling' }]}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={FileSpreadsheet}
              onClick={exportCSV}
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Sliders}
              onClick={() => setIsSimulatorModalOpen(true)}
            >
              Simulate
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={generateRoster}
              isLoading={isGenerating}
            >
              {isGenerating ? 'Solving...' : 'Generate Roster'}
            </Button>
          </>
        }
      />

      {/* 2. Daily Timeline Health Bar */}
      <DailyTimelineBar
        dates={allDates}
        roster={roster}
        selectedDate={focusedDate}
        onSelectDate={setFocusedDate}
      />

      {/* 3. Controls, Search, Perspectives & View Mode Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        {/* Top Row: Perspectives & Calendar View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Perspectives: Company, Pods, Brands */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActivePerspective('COMPANY')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activePerspective === 'COMPANY'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Company-Wide</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePerspective('PODS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activePerspective === 'PODS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Pod-Wise ({pods.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePerspective('BRANDS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activePerspective === 'BRANDS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Brand Matrix ({brands.length})</span>
            </button>
          </div>

          {/* Calendar View Toggle: Month vs Week */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setCalendarMode('MONTH')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  calendarMode === 'MONTH'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Monthly (30 Days)
              </button>
              <button
                type="button"
                onClick={() => setCalendarMode('WEEK')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  calendarMode === 'WEEK'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Weekly View
              </button>
            </div>

            {/* Weekly Navigation Controls */}
            {calendarMode === 'WEEK' && (
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedWeekIndex(Math.max(0, selectedWeekIndex - 1))}
                  disabled={selectedWeekIndex === 0}
                  className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-semibold text-slate-700 px-1.5 text-[11px]">
                  Week {selectedWeekIndex + 1} of {weeklyChunks.length}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedWeekIndex(Math.min(weeklyChunks.length - 1, selectedWeekIndex + 1))}
                  disabled={selectedWeekIndex === weeklyChunks.length - 1}
                  className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: Search, Pod/Brand Selectors, Status Filters & Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[320px]">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff, skill, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Pod Selector */}
            <select
              value={selectedPodId}
              onChange={(e) => setSelectedPodId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Pods ({pods.length})</option>
              {pods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.split('(')[0]}
                </option>
              ))}
            </select>

            {/* Quick Status Filters */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilterMode('ALL')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  filterMode === 'ALL'
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({employees.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('LEAVES_ONLY')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  filterMode === 'LEAVES_ONLY'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                Leaves Only
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('FLOATERS_ONLY')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  filterMode === 'FLOATERS_ONLY'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                Floaters Only
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('BACKUP_ONLY')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  filterMode === 'BACKUP_ONLY'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
                }`}
              >
                Backups Only
              </button>
            </div>
          </div>

          {/* Color-Coded Status Legend */}
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600 shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Working
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Backup Floater
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Leave
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Holiday
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Weekly Off
            </span>
          </div>
        </div>
      </div>

      {/* 4. Enterprise Roster Table with Sticky Columns and Horizontal Scrolling */}
      <Card className="overflow-hidden p-0 border border-slate-200 shadow-sm">
        <div className="overflow-x-auto max-h-[640px]">
          <table className="w-full text-left border-collapse text-xs">
            {/* Table Header */}
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-2xs">
              <tr>
                {/* Sticky Column 1: Employee & Pod */}
                <th className="sticky left-0 z-30 bg-slate-50 px-4 py-3 font-bold text-slate-800 min-w-[220px] shadow-sm">
                  Employee / Pod
                </th>

                {/* Sticky Column 2: Primary Brand */}
                <th className="sticky left-[220px] z-30 bg-slate-50 px-3 py-3 font-bold text-slate-700 min-w-[170px] border-r border-slate-200 shadow-sm">
                  Primary Assignment
                </th>

                {/* Date Columns */}
                {visibleDates.map((dateStr) => {
                  const d = new Date(dateStr);
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
                  const dayNum = d.getDate();
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  const isFocused = focusedDate === dateStr;

                  return (
                    <th
                      key={dateStr}
                      onClick={() => setFocusedDate(focusedDate === dateStr ? null : dateStr)}
                      className={`px-2 py-2 text-center min-w-[72px] border-r border-slate-200 cursor-pointer transition-colors ${
                        isFocused
                          ? 'bg-indigo-100 text-indigo-950 font-extrabold ring-2 ring-indigo-500'
                          : isWeekend
                          ? 'bg-indigo-50/40 text-indigo-900 font-bold'
                          : 'text-slate-700 font-semibold hover:bg-slate-100'
                      }`}
                      title={`Date: ${dateStr}`}
                    >
                      <div className="text-[10px] text-slate-400 font-mono uppercase">{dayName}</div>
                      <div className="font-bold text-xs">{dayNum}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => {
                  const pod = pods.find((p) => p.id === emp.podId);
                  const assignedBrand = emp.assignedBrands?.[0]
                    ? brands.find((b) => b.id === emp.assignedBrands[0].brandId)
                    : null;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Sticky 1: Employee Avatar & Name */}
                      <td className="sticky left-0 z-10 bg-white px-4 py-2.5 min-w-[220px] border-r border-slate-200 shadow-xs">
                        <div
                          className="cursor-pointer group flex items-center gap-2.5"
                          onClick={() => {
                            setSelectedEmployeeId(emp.id);
                            setActiveView('employees');
                          }}
                          title={`View full profile for ${emp.name}`}
                        >
                          <div className="h-7 w-7 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            {emp.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 truncate block">
                              {emp.name}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                              <span>{pod ? pod.name.split(' ')[1] : ''}</span>
                              <span>•</span>
                              <span className="text-indigo-600 font-mono text-[10px] font-semibold">
                                {emp.skills.join(', ')}
                              </span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Sticky 2: Primary Brand */}
                      <td className="sticky left-[220px] z-10 bg-white px-3 py-2.5 min-w-[170px] border-r border-slate-200 shadow-xs">
                        {assignedBrand ? (
                          <div className="min-w-0">
                            <div
                              className="font-semibold text-slate-800 truncate max-w-[150px]"
                              title={assignedBrand.name}
                            >
                              {assignedBrand.name}
                            </div>
                            <div className="text-[10px]">
                              {assignedBrand.staffingType === 'SINGLE_RESOURCE' ? (
                                <span className="text-amber-700 font-mono font-bold">
                                  Dedicated (80%)
                                </span>
                              ) : (
                                <span className="text-sky-700 font-mono font-bold">
                                  Multi-Resource
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                            Floater Backup Pool
                          </span>
                        )}
                      </td>

                      {/* Shift Cells with Click-to-Open Drawer */}
                      {visibleDates.map((dateStr) => {
                        const shift = shiftLookup.get(`${dateStr}_${emp.id}`) || {
                          date: dateStr,
                          employeeId: emp.id,
                          status: 'WEEKLY_OFF',
                        };
                        const isFocused = focusedDate === dateStr;

                        return (
                          <td
                            key={dateStr}
                            onClick={() => openShiftEditor(shift, emp)}
                            className={`px-1.5 py-2 text-center border-r border-slate-100 cursor-pointer transition-all hover:bg-indigo-50/70 hover:scale-105 ${
                              isFocused ? 'bg-indigo-50/40' : ''
                            }`}
                            title={`Click to edit shift: ${emp.name} on ${dateStr}`}
                          >
                            {renderShiftBadge(shift)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={visibleDates.length + 2} className="py-12 text-center">
                    <EmptyState
                      icon={Calendar}
                      title="No Employees Match Current Filters"
                      description="Try clearing search or changing the Pod filter."
                      actionLabel="Reset All Filters"
                      onAction={() => {
                        setSearchTerm('');
                        setSelectedPodId('ALL');
                        setSelectedBrandId('ALL');
                        setFilterMode('ALL');
                      }}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

