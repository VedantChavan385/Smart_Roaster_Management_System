import React, { useState } from 'react';
import { useRoster } from '../context/RosterContext';
import { useNavigation } from '../context/NavigationContext';
import PageHeader from '../components/layout/PageHeader';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import {
  Users,
  Building2,
  Activity,
  AlertTriangle,
  ShieldCheck,
  CalendarDays,
  Zap,
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export default function OverviewView() {
  const {
    month,
    roster,
    employees,
    brands,
    pods,
    leaves,
    holidays,
    criticalGapsCount,
    generateRoster,
    isGenerating,
    autoResolveAll,
    isAutoResolving,
    applyFix,
    isApplyingFix,
    exportCSV,
    setIsConflictDrawerOpen,
    setIsSimulatorModalOpen,
    openShiftEditor,
    setSelectedEmployeeId,
  } = useRoster();

  const { setActiveView } = useNavigation();

  // Selected date for Operational Shift drilldown (default to mid-month or Nov 15 where leave conflict occurs)
  const [selectedDate, setSelectedDate] = useState('2026-11-15');

  const metadata = roster?.metadata || {};
  const coverageRate = metadata.coverageRate || (criticalGapsCount === 0 ? 100 : Math.max(70, Math.round(100 - criticalGapsCount * 2.5)));
  const singleResourceCount = brands.filter((b) => b.staffingType === 'SINGLE_RESOURCE').length;
  const multiResourceCount = brands.filter((b) => b.staffingType === 'MULTI_RESOURCE').length;
  const singleResourcePercent = brands.length > 0 ? Math.round((singleResourceCount / brands.length) * 100) : 0;

  // Active employees count
  const activeEmployees = employees.length;

  // Shifts for selected date
  const shiftsOnDate = roster?.shifts?.filter((s) => s.date === selectedDate) || [];
  const workingShiftsOnDate = shiftsOnDate.filter((s) => s.status === 'WORKING');
  const offShiftsOnDate = shiftsOnDate.filter((s) => s.status === 'WEEKLY_OFF');
  const leaveShiftsOnDate = shiftsOnDate.filter((s) => s.status === 'LEAVE');

  // Gaps on selected date
  const gapsOnDate = roster?.conflicts?.filter((c) => c.date === selectedDate) || [];

  // Pod Distribution Data
  const podStats = pods.map((pod) => {
    const podEmps = employees.filter((e) => e.podId === pod.id);
    const podBrands = brands.filter((b) => b.podId === pod.id);
    const podConflicts = roster?.conflicts?.filter((c) => {
      const brand = brands.find((b) => b.id === c.brandId);
      return brand?.podId === pod.id;
    }) || [];

    return {
      ...pod,
      employeeCount: podEmps.length,
      brandCount: podBrands.length,
      conflictCount: podConflicts.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Executive Overview"
        subtitle="Workforce operations, real-time coverage health score, SLA compliance & conflict action center."
        badge={`${month} Active Period`}
        badgeVariant="indigo"
        breadcrumbs={[{ label: 'Workspace' }, { label: 'Overview' }]}
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

      {/* 2. Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total & Active Employees */}
        <StatCard
          title="Total Workforce"
          value={activeEmployees}
          badgeText="100% Active"
          badgeVariant="emerald"
          icon={Users}
          subtext={`${pods.length} cross-functional pods`}
          trend={{ value: '32 Qualified', isPositive: true }}
          onClick={() => setActiveView('employees')}
        />

        {/* Client Accounts (80/20 Rule) */}
        <StatCard
          title="Client Accounts"
          value={brands.length}
          badgeText={`${singleResourcePercent}% Dedicated`}
          badgeVariant="blue"
          icon={Building2}
          subtext={`${singleResourceCount} single • ${multiResourceCount} multi-resource`}
          iconBg="bg-blue-50 border-blue-100"
          iconColor="text-blue-600"
          onClick={() => setActiveView('companies')}
        />

        {/* Coverage Health Score */}
        <StatCard
          title="Coverage Health Score"
          value={`${coverageRate}%`}
          badgeText={coverageRate >= 95 ? 'Optimal' : 'Needs Action'}
          badgeVariant={coverageRate >= 95 ? 'emerald' : 'amber'}
          icon={Activity}
          subtext={`${roster?.shifts?.length || 0} rostered shifts`}
          iconBg={coverageRate >= 95 ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}
          iconColor={coverageRate >= 95 ? 'text-emerald-600' : 'text-amber-600'}
          onClick={() => setActiveView('roster')}
        />

        {/* Unresolved Coverage Gaps */}
        <StatCard
          title="Unresolved Gaps"
          value={criticalGapsCount}
          badgeText={criticalGapsCount === 0 ? 'Zero Gaps' : 'Action Required'}
          badgeVariant={criticalGapsCount === 0 ? 'emerald' : 'rose'}
          icon={AlertTriangle}
          subtext={criticalGapsCount > 0 ? 'Immediate backup recommended' : 'All brand SLAs covered'}
          iconBg={criticalGapsCount === 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}
          iconColor={criticalGapsCount === 0 ? 'text-emerald-600' : 'text-rose-600'}
          onClick={() => setIsConflictDrawerOpen(true)}
        />
      </div>

      {/* 3. Section C: Action Center (High Priority Alert & 1-Click Fixes) */}
      <Card
        title="Operational Action Center"
        subtitle="Critical single-resource violations, leave coverage gaps and auto-resolution engine"
        actions={
          criticalGapsCount > 0 ? (
            <Button
              variant="success"
              size="sm"
              icon={Zap}
              onClick={autoResolveAll}
              isLoading={isAutoResolving}
            >
              Auto-Resolve All ({criticalGapsCount})
            </Button>
          ) : (
            <Badge variant="emerald" size="sm" withDot>
              All Shifts Fully Staffed
            </Badge>
          )
        }
      >
        {criticalGapsCount > 0 ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Assessment Constraint Flagged:</strong> Client brands with dedicated 1-person staffing (like GlowSkin Organics on Nov 15) risk downtime when dedicated staff are on leave.
                </span>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setIsConflictDrawerOpen(true)}
              >
                Review Full Diagnostic
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roster?.conflicts?.slice(0, 4).map((conflict) => {
                const bestBackup = conflict.suggestedResolutions?.[0];

                return (
                  <div
                    key={conflict.id}
                    className="p-3.5 rounded-xl border border-rose-200 bg-white hover:border-rose-300 transition-all space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 uppercase">
                          {conflict.severity}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {conflict.date}
                        </span>
                      </div>
                      <Badge variant="slate" size="xs">
                        {conflict.process}
                      </Badge>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        {conflict.brandName}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {conflict.description}
                      </p>
                    </div>

                    {bestBackup ? (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="text-[11px] text-indigo-700 font-medium truncate">
                          💡 Backup: <strong>{bestBackup.employeeName}</strong>
                        </div>
                        <Button
                          variant="success"
                          size="xs"
                          icon={Zap}
                          onClick={() => applyFix(conflict.id, bestBackup.backupEmployeeId)}
                          isLoading={isApplyingFix}
                        >
                          Assign Backup
                        </Button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setIsConflictDrawerOpen(true)}
                        >
                          Manual Resolution
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {criticalGapsCount > 4 && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsConflictDrawerOpen(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <span>View all {criticalGapsCount} detected gaps in Diagnostics Drawer</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={ShieldCheck}
            title="Clean Operations Score"
            description="All single-resource and multi-resource brands have verified coverage. No schedule conflicts or unfilled shifts detected."
          />
        )}
      </Card>

      {/* 4. Section A: Workforce Analytics & Pod Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pod Distribution */}
        <Card
          title="Pod Workforce Distribution"
          subtitle="Cross-brand pod clusters & capacity status"
          actions={
            <Button
              variant="ghost"
              size="xs"
              iconRight={ChevronRight}
              onClick={() => setActiveView('pods')}
            >
              View Pods
            </Button>
          }
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            {podStats.map((pod) => (
              <div
                key={pod.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{pod.name}</h4>
                    <span className="text-[11px] text-slate-500">Lead: {pod.leadName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="indigo" size="xs">
                      {pod.employeeCount} Staff
                    </Badge>
                    <Badge variant="slate" size="xs">
                      {pod.brandCount} Brands
                    </Badge>
                    {pod.conflictCount > 0 ? (
                      <Badge variant="rose" size="xs" withDot>
                        {pod.conflictCount} Gaps
                      </Badge>
                    ) : (
                      <Badge variant="emerald" size="xs" withDot>
                        Optimal
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Staffing Capacity</span>
                    <span>{Math.round((pod.employeeCount / activeEmployees) * 100)}% of total team</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pod.conflictCount > 0 ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${(pod.employeeCount / activeEmployees) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Workforce Utilization & Calendar Policies */}
        <Card
          title="Workforce Policies"
          subtitle="Engine constraints & quotas"
          actions={
            <Badge variant="emerald" size="xs" withDot>
              Enforced
            </Badge>
          }
        >
          <div className="space-y-3.5 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Weekly Off Quota</span>
                <span className="text-indigo-600">1–2 Days / Wk</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Guaranteed minimum off-days per 7-day rolling window with preferred day matching.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Max Consecutive Days</span>
                <span className="text-emerald-700">6 Days Max</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Prevents agent burnout by blocking 7+ consecutive working shifts.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Single-Resource Rule</span>
                <span className="text-amber-700">~80% Dedicated</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Dedicated staffing for specialized brands; floaters step in only during planned/unplanned absence.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 5. Section B: Operational Overview & Date Shift Inspection */}
      <Card
        title="Day-by-Day Shift Inspection"
        subtitle={`Rostered duty, leaves & backup coverage for ${selectedDate}`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <label htmlFor="shift-date-picker" className="text-slate-500 font-medium">Date:</label>
              <input
                id="shift-date-picker"
                type="date"
                min="2026-11-01"
                max="2026-11-30"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setSelectedDate('2026-11-15')}
              title="Jump to Nov 15 Leave Conflict scenario"
            >
              Nov 15
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Summary Stats for Selected Date */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
              <div className="text-[10px] font-bold text-emerald-800 uppercase">Working on Duty</div>
              <div className="text-lg font-extrabold text-emerald-900 mt-0.5">
                {workingShiftsOnDate.length} Staff
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-100/70 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-600 uppercase">Weekly Off</div>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                {offShiftsOnDate.length} Staff
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-100">
              <div className="text-[10px] font-bold text-amber-800 uppercase">On Leave</div>
              <div className="text-lg font-extrabold text-amber-900 mt-0.5">
                {leaveShiftsOnDate.length} Staff
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-100">
              <div className="text-[10px] font-bold text-rose-800 uppercase">Unstaffed Gaps</div>
              <div className="text-lg font-extrabold text-rose-900 mt-0.5">
                {gapsOnDate.length} Gaps
              </div>
            </div>
          </div>

          {/* List of Shifts on Selected Date */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase grid grid-cols-12 gap-2">
              <span className="col-span-4">Employee / Pod</span>
              <span className="col-span-4">Assigned Brand & Process</span>
              <span className="col-span-2">Shift Status</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {shiftsOnDate.length > 0 ? (
                shiftsOnDate.map((shift) => {
                  const emp = employees.find((e) => e.id === shift.employeeId);
                  const brand = brands.find((b) => b.id === shift.brandId);
                  const pod = pods.find((p) => p.id === emp?.podId);

                  return (
                    <div
                      key={`${shift.employeeId}-${shift.date}`}
                      className="px-4 py-2.5 text-xs grid grid-cols-12 gap-2 items-center hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="col-span-4 flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {emp ? emp.name.split(' ').map((n) => n[0]).join('') : '??'}
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEmployeeId(shift.employeeId);
                              setActiveView('employees');
                            }}
                            className="font-semibold text-slate-900 hover:text-indigo-600 truncate block text-left"
                          >
                            {emp ? emp.name : shift.employeeId}
                          </button>
                          <span className="text-[10px] text-slate-400 truncate block">
                            {pod ? pod.name.split(' ')[1] : 'Unassigned Pod'}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-4 min-w-0">
                        {brand ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-800 truncate">
                              {brand.name}
                            </span>
                            {shift.process && (
                              <Badge variant="indigo" size="xs">
                                {shift.process}
                              </Badge>
                            )}
                            {shift.isBackup && (
                              <Badge variant="emerald" size="xs">
                                Floater Backup
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No brand assignment</span>
                        )}
                        {shift.notes && (
                          <span className="text-[10px] text-slate-400 block truncate">
                            {shift.notes}
                          </span>
                        )}
                      </div>

                      <div className="col-span-2">
                        {shift.status === 'WORKING' && (
                          <Badge variant="emerald" size="xs" withDot>
                            Working
                          </Badge>
                        )}
                        {shift.status === 'WEEKLY_OFF' && (
                          <Badge variant="slate" size="xs">
                            Weekly Off
                          </Badge>
                        )}
                        {shift.status === 'LEAVE' && (
                          <Badge variant="rose" size="xs" withDot>
                            On Leave
                          </Badge>
                        )}
                        {shift.status === 'HOLIDAY' && (
                          <Badge variant="amber" size="xs">
                            Holiday
                          </Badge>
                        )}
                      </div>

                      <div className="col-span-2 text-right">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => openShiftEditor(shift, emp)}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  No shifts loaded for this date. Run "Generate Roster" to compute.
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
