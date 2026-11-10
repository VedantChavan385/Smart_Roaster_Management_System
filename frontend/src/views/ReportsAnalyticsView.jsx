import React, { useState, useMemo } from 'react';
import { useRoster } from '../context/RosterContext';
import { useNavigation } from '../context/NavigationContext';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Users,
  Building2,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Layers,
  Clock,
  Download,
  Filter,
} from 'lucide-react';

export default function ReportsAnalyticsView() {
  const {
    month,
    roster,
    employees,
    brands,
    pods,
    leaves,
    holidays,
    criticalGapsCount,
    exportCSV,
  } = useRoster();

  const { setActiveView } = useNavigation();
  const [activeReportTab, setActiveReportTab] = useState('UTILIZATION'); // 'UTILIZATION' | 'BRAND_SLA' | 'STAFFING_TRENDS' | 'LEAVES'

  // Fast computations
  const totalShifts = roster?.shifts?.length || 960;
  const workingShifts = useMemo(() => {
    return (roster?.shifts || []).filter((s) => s.status === 'WORKING');
  }, [roster]);

  const offShifts = useMemo(() => {
    return (roster?.shifts || []).filter(
      (s) => s.status === 'WEEKLY_OFF' || s.status === 'OFF'
    );
  }, [roster]);

  const leaveShifts = useMemo(() => {
    return (roster?.shifts || []).filter((s) => s.status === 'LEAVE');
  }, [roster]);

  const backupShifts = useMemo(() => {
    return (roster?.shifts || []).filter((s) => s.isBackup);
  }, [roster]);

  // Average utilization = working shifts / (total staff * 30 days) * 100
  const avgUtilization = employees.length > 0
    ? Math.round((workingShifts.length / (employees.length * 30)) * 100)
    : 72;

  // Pod utilization stats
  const podAnalytics = useMemo(() => {
    return pods.map((pod) => {
      const podEmps = employees.filter((e) => e.podId === pod.id);
      const podEmpIds = new Set(podEmps.map((e) => e.id));
      const podShifts = (roster?.shifts || []).filter((s) => podEmpIds.has(s.employeeId));
      const podWorking = podShifts.filter((s) => s.status === 'WORKING').length;
      const podOff = podShifts.filter((s) => s.status === 'WEEKLY_OFF' || s.status === 'OFF').length;
      const podLeaves = podShifts.filter((s) => s.status === 'LEAVE').length;
      const podBackups = podShifts.filter((s) => s.isBackup).length;
      const podConflicts = (roster?.conflicts || []).filter((c) => {
        const b = brands.find((brand) => brand.id === c.brandId);
        return b?.podId === pod.id;
      }).length;

      const utilRate = podEmps.length > 0
        ? Math.round((podWorking / (podEmps.length * 30)) * 100)
        : 70;

      return {
        ...pod,
        empCount: podEmps.length,
        workingCount: podWorking,
        offCount: podOff,
        leaveCount: podLeaves,
        backupCount: podBackups,
        conflictCount: podConflicts,
        utilizationRate: utilRate,
      };
    });
  }, [pods, employees, roster, brands]);

  // Brand SLA stats
  const brandAnalytics = useMemo(() => {
    return brands.map((brand) => {
      const brandConflicts = (roster?.conflicts || []).filter((c) => c.brandId === brand.id);
      const brandShifts = (roster?.shifts || []).filter((s) => s.brandId === brand.id && s.status === 'WORKING');
      const backupCount = brandShifts.filter((s) => s.isBackup).length;
      const coverageRate = brandConflicts.length === 0
        ? 100
        : Math.max(60, 100 - brandConflicts.length * 7);

      return {
        ...brand,
        shiftsCovered: brandShifts.length,
        conflictsCount: brandConflicts.length,
        backupCount,
        coverageRate,
      };
    });
  }, [brands, roster]);

  // Weekly Staffing Breakdown (5 Weeks of Nov 2026)
  const weeklyTrends = useMemo(() => {
    const weeks = [
      { week: 'Week 1 (Nov 01 - 07)', days: ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07'] },
      { week: 'Week 2 (Nov 08 - 14)', days: ['2026-11-08', '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14'] },
      { week: 'Week 3 (Nov 15 - 21)', days: ['2026-11-15', '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21'] },
      { week: 'Week 4 (Nov 22 - 28)', days: ['2026-11-22', '2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27', '2026-11-28'] },
      { week: 'Week 5 (Nov 29 - 30)', days: ['2026-11-29', '2026-11-30'] },
    ];

    return weeks.map((w) => {
      const daySet = new Set(w.days);
      const shiftsInWeek = (roster?.shifts || []).filter((s) => daySet.has(s.date));
      const working = shiftsInWeek.filter((s) => s.status === 'WORKING').length;
      const off = shiftsInWeek.filter((s) => s.status === 'WEEKLY_OFF' || s.status === 'OFF').length;
      const leavesCount = shiftsInWeek.filter((s) => s.status === 'LEAVE').length;
      const backups = shiftsInWeek.filter((s) => s.isBackup).length;
      const gaps = (roster?.conflicts || []).filter((c) => daySet.has(c.date)).length;

      return {
        ...w,
        working,
        off,
        leavesCount,
        backups,
        gaps,
      };
    });
  }, [roster]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Reports & Workforce Analytics"
        subtitle="Workforce utilization rates, brand SLA fulfillment, pod performance indicators, and monthly staffing trends."
        badge={`${month} Operational Period`}
        badgeVariant="indigo"
        breadcrumbs={[{ label: 'Operations' }, { label: 'Reports & Analytics' }]}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={FileSpreadsheet}
            onClick={exportCSV}
          >
            Export Comprehensive CSV
          </Button>
        }
      />

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Workforce Utilization
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {avgUtilization}%
          </div>
          <span className="text-xs text-emerald-600 font-semibold block mt-1">
            {workingShifts.length} Working Shifts
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Overall Coverage SLA
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {roster?.metadata?.coverageRate || 75}%
          </div>
          <span className="text-xs text-indigo-600 font-medium block mt-1">
            Across 14 D2C Brand Accounts
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Guaranteed Off Quota
          </span>
          <div className="text-2xl font-bold text-slate-700 mt-1">
            {offShifts.length} <span className="text-xs text-slate-500 font-medium">Days</span>
          </div>
          <span className="text-xs text-slate-500 font-medium block mt-1">
            100% contract compliance
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Floater Backup Activations
          </span>
          <div className="text-2xl font-bold text-sky-600 mt-1">
            {backupShifts.length} <span className="text-xs text-slate-500 font-medium">Shifts</span>
          </div>
          <span className="text-xs text-slate-500 font-medium block mt-1">
            Emergency cross-pod covers
          </span>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveReportTab('UTILIZATION')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeReportTab === 'UTILIZATION'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Workforce Utilization</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('BRAND_SLA')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeReportTab === 'BRAND_SLA'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Brand SLA Compliance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('STAFFING_TRENDS')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeReportTab === 'STAFFING_TRENDS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Weekly Staffing Trends</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('LEAVES')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeReportTab === 'LEAVES'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Leave & Holiday Statistics</span>
        </button>
      </div>

      {/* 4. Tab 1: Workforce Utilization by Pod */}
      {activeReportTab === 'UTILIZATION' && (
        <div className="space-y-4">
          <Card
            title="Pod Performance & Utilization Summary"
            subtitle="Comparing staffing allocation, off quotas, leaves and backup activations"
          >
            <div className="space-y-5">
              {podAnalytics.map((pod) => (
                <div key={pod.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{pod.name}</h4>
                      <p className="text-xs text-slate-500">Lead: {pod.leadName} • {pod.empCount} Staff Members</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-700">
                        {pod.utilizationRate}% Utilization
                      </span>
                      {pod.conflictCount > 0 ? (
                        <Badge variant="rose" size="xs" withDot>
                          {pod.conflictCount} Gaps
                        </Badge>
                      ) : (
                        <Badge variant="emerald" size="xs" withDot>
                          100% Covered
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Progress Gauge */}
                  <div className="space-y-1">
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${(pod.workingCount / (pod.empCount * 30)) * 100}%` }}
                        title={`Working: ${pod.workingCount} shifts`}
                      />
                      <div
                        className="bg-sky-400 h-full"
                        style={{ width: `${(pod.backupCount / (pod.empCount * 30)) * 100}%` }}
                        title={`Backups: ${pod.backupCount} shifts`}
                      />
                      <div
                        className="bg-slate-400 h-full"
                        style={{ width: `${(pod.offCount / (pod.empCount * 30)) * 100}%` }}
                        title={`Off: ${pod.offCount} shifts`}
                      />
                      <div
                        className="bg-amber-400 h-full"
                        style={{ width: `${(pod.leaveCount / (pod.empCount * 30)) * 100}%` }}
                        title={`Leaves: ${pod.leaveCount} shifts`}
                      />
                    </div>
                  </div>

                  {/* Shift Counts */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
                      <span className="font-bold">{pod.workingCount}</span> Working Shifts
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                      <span className="font-bold">{pod.offCount}</span> Weekly Offs
                    </div>
                    <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
                      <span className="font-bold">{pod.leaveCount}</span> Leaves
                    </div>
                    <div className="p-1.5 rounded-lg bg-sky-50 text-sky-800">
                      <span className="font-bold">{pod.backupCount}</span> Floater Covers
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 5. Tab 2: Brand SLA Compliance */}
      {activeReportTab === 'BRAND_SLA' && (
        <Card
          title="Brand SLA Coverage & Single-Resource Compliance"
          subtitle="Real-time coverage health and backup utilization across all 14 client brands"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="px-4 py-3">Brand Name</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Staffing Model</th>
                  <th className="px-3 py-3 text-center">Duty Shifts Covered</th>
                  <th className="px-3 py-3 text-center">Floater Interventions</th>
                  <th className="px-3 py-3">SLA Health Score</th>
                  <th className="px-3 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {brandAnalytics.map((brand) => (
                  <tr key={brand.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">{brand.name}</td>
                    <td className="px-3 py-3 text-slate-600">{brand.category}</td>
                    <td className="px-3 py-3">
                      {brand.staffingType === 'SINGLE_RESOURCE' ? (
                        <span className="font-mono text-amber-700 font-bold text-xs">
                          Dedicated 1-Agent (80%)
                        </span>
                      ) : (
                        <span className="font-mono text-sky-700 font-bold text-xs">
                          Multi-Resource
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-slate-800">
                      {brand.shiftsCovered}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-sky-700">
                      {brand.backupCount}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              brand.coverageRate === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${brand.coverageRate}%` }}
                          />
                        </div>
                        <span className="font-bold text-xs text-slate-700">
                          {brand.coverageRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {brand.conflictsCount > 0 ? (
                        <Badge variant="rose" size="xs" withDot>
                          {brand.conflictsCount} Gaps
                        </Badge>
                      ) : (
                        <Badge variant="emerald" size="xs" withDot>
                          Compliant
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 6. Tab 3: Weekly Staffing Trends */}
      {activeReportTab === 'STAFFING_TRENDS' && (
        <Card
          title="November 2026 – Weekly Shift Allocation Trends"
          subtitle="Week-by-week duty volume, floater backup activations and gap mitigation"
        >
          <div className="space-y-4">
            {weeklyTrends.map((w, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900">{w.week}</h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-emerald-700">{w.working} Working</span>
                    <span>•</span>
                    <span className="font-bold text-slate-600">{w.off} Off</span>
                    <span>•</span>
                    <span className="font-bold text-amber-700">{w.leavesCount} Leaves</span>
                    {w.gaps > 0 && (
                      <span className="text-rose-600 font-bold">• {w.gaps} Gaps</span>
                    )}
                  </div>
                </div>

                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-600 h-full"
                    style={{ width: `${(w.working / (w.working + w.off + w.leavesCount || 1)) * 100}%` }}
                    title={`Working: ${w.working}`}
                  />
                  <div
                    className="bg-slate-400 h-full"
                    style={{ width: `${(w.off / (w.working + w.off + w.leavesCount || 1)) * 100}%` }}
                    title={`Weekly Off: ${w.off}`}
                  />
                  <div
                    className="bg-amber-400 h-full"
                    style={{ width: `${(w.leavesCount / (w.working + w.off + w.leavesCount || 1)) * 100}%` }}
                    title={`Leaves: ${w.leavesCount}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 7. Tab 4: Leave & Holiday Statistics */}
      {activeReportTab === 'LEAVES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card
            title="Public Operating Holidays"
            subtitle="National and regional operating closures accounted for by solver"
          >
            <div className="space-y-2.5 text-xs">
              {holidays.map((h, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-purple-100 bg-purple-50/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">{h.name}</span>
                      <span className="font-mono text-[11px] text-purple-700">{h.date}</span>
                    </div>
                  </div>
                  <Badge variant="purple" size="xs">
                    {h.isMandatoryOff ? 'Mandatory Off' : 'Optional Closure'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Approved Staff Leaves"
            subtitle="Planned employee leaves with automated backup coverage"
          >
            <div className="space-y-2.5 text-xs">
              {leaves && leaves.length > 0 ? (
                leaves.map((l) => {
                  const emp = employees.find((e) => e.id === l.employeeId);
                  return (
                    <div
                      key={l.id}
                      className="p-3 rounded-lg border border-amber-100 bg-amber-50/50 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {emp ? emp.name : l.employeeId}
                        </span>
                        <span className="font-mono text-[11px] text-amber-800">
                          {l.startDate} to {l.endDate} • {l.reason || 'Personal Leave'}
                        </span>
                      </div>
                      <Badge variant="amber" size="xs">
                        {l.status}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-slate-400 italic">
                  No employee leave records found.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

