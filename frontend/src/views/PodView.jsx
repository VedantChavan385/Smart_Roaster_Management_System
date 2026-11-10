import React, { useState, useMemo } from 'react';
import { useRoster } from '../context/RosterContext';
import { useNavigation } from '../context/NavigationContext';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

import {
  ShieldCheck,
  Mail,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Calendar,
  Sparkles,
  Zap,
  ArrowRight,
  UserCheck,
  Clock,
  Briefcase,
} from 'lucide-react';

export default function PodView({
  onSelectEmployee: onExternalSelectEmployee,
}) {
  const {
    pods,
    employees,
    brands,
    roster,
    month,
    criticalGapsCount,
    autoResolveAll,
    isAutoResolving,
    openShiftEditor,
    setSelectedEmployeeId,
    setIsConflictDrawerOpen,
  } = useRoster();

  const { setActiveView } = useNavigation();

  // Active selected pod
  const [activePodId, setActivePodId] = useState(pods[0]?.id || 'pod_alpha');

  // Sub-view within the pod: 'STAFF' | 'BRANDS' | 'ROSTER'
  const [podSubTab, setPodSubTab] = useState('STAFF');

  const activePod = useMemo(() => {
    return pods.find((p) => p.id === activePodId) || pods[0] || null;
  }, [pods, activePodId]);

  // Data for active pod
  const podEmployees = useMemo(() => {
    return employees.filter((e) => e.podId === activePodId);
  }, [employees, activePodId]);

  const podBrands = useMemo(() => {
    return brands.filter((b) => b.podId === activePodId);
  }, [brands, activePodId]);

  const podConflicts = useMemo(() => {
    if (!roster?.conflicts) return [];
    return roster.conflicts.filter((c) => {
      const brand = brands.find((b) => b.id === c.brandId);
      return brand?.podId === activePodId;
    });
  }, [roster, brands, activePodId]);

  // Fast shift lookup for pod shifts
  const allDates = useMemo(() => {
    if (!roster?.shifts) return [];
    return Array.from(new Set(roster.shifts.map((s) => s.date))).sort();
  }, [roster]);

  const shiftLookup = useMemo(() => {
    const map = new Map();
    if (roster?.shifts) {
      roster.shifts.forEach((s) => {
        map.set(`${s.date}_${s.employeeId}`, s);
      });
    }
    return map;
  }, [roster]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Pods & Cross-Functional Teams"
        subtitle="Manage cross-brand operational clusters, dedicated client leads, floater backup pools and capacity SLAs."
        badge={`${pods.length} Active Pods`}
        badgeVariant="purple"
        breadcrumbs={[{ label: 'Workspace' }, { label: 'Pods & Teams' }]}
        actions={
          podConflicts.length > 0 && (
            <Button
              variant="success"
              size="sm"
              icon={Zap}
              onClick={autoResolveAll}
              isLoading={isAutoResolving}
            >
              Auto-Resolve Pod Gaps ({podConflicts.length})
            </Button>
          )
        }
      />

      {/* 2. Pod Selection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pods.map((pod) => {
          const isSelected = pod.id === activePodId;
          const memberCount = employees.filter((e) => e.podId === pod.id).length;
          const brandCount = brands.filter((b) => b.podId === pod.id).length;
          const conflictCount = roster?.conflicts?.filter((c) => {
            const b = brands.find((brand) => brand.id === c.brandId);
            return b && b.podId === pod.id;
          })?.length || 0;

          return (
            <button
              type="button"
              key={pod.id}
              onClick={() => setActivePodId(pod.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/10'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  {pod.id.replace('_', ' ')}
                </span>
                {conflictCount > 0 ? (
                  <Badge variant="rose" size="xs" withDot>
                    {conflictCount} Gaps
                  </Badge>
                ) : (
                  <Badge variant="emerald" size="xs" withDot>
                    100% Covered
                  </Badge>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-sm">{pod.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                Lead: {pod.leadName}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Users className="h-3.5 w-3.5 text-slate-400" /> {memberCount} Staff
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" /> {brandCount} Brands
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Pod Lead & Operational Profile Banner */}
      {activePod && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-600">
                  Pod Lead & Operations
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 truncate">{activePod.description}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">{activePod.leadName}</h2>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{activePod.leadEmail}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center min-w-[90px]">
              <div className="text-xl font-extrabold text-slate-900">{podEmployees.length}</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Staff</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center min-w-[90px]">
              <div className="text-xl font-extrabold text-indigo-700">{podBrands.length}</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Brands Managed</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center min-w-[90px]">
              <div
                className={`text-xl font-extrabold ${
                  podConflicts.length > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {podConflicts.length}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Coverage Gaps</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sub-Navigation Tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-1">
        <button
          type="button"
          onClick={() => setPodSubTab('STAFF')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
            podSubTab === 'STAFF'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Pod Team Members ({podEmployees.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setPodSubTab('BRANDS')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
            podSubTab === 'BRANDS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Assigned Brands ({podBrands.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setPodSubTab('ROSTER')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
            podSubTab === 'ROSTER'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Pod Shift Schedule</span>
        </button>
      </div>

      {/* 5. Sub-Tab Contents */}
      {podSubTab === 'STAFF' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {podEmployees.map((emp) => {
            const primaryBrand = emp.assignedBrands?.[0]
              ? brands.find((b) => b.id === emp.assignedBrands[0].brandId)
              : null;

            return (
              <Card
                key={emp.id}
                className="hover:border-slate-300 transition-all flex flex-col justify-between"
                bodyClassName="p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {emp.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>

                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEmployeeId(emp.id);
                          setActiveView('employees');
                        }}
                        className="font-bold text-xs text-slate-900 hover:text-indigo-600 truncate block text-left cursor-pointer"
                      >
                        {emp.name}
                      </button>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        {emp.id}
                      </span>
                    </div>
                  </div>

                  <Badge variant={primaryBrand ? 'amber' : 'indigo'} size="xs">
                    {primaryBrand ? 'Dedicated' : 'Floater Pool'}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
                  <div className="flex justify-between text-slate-500">
                    <span>Account:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                      {primaryBrand ? primaryBrand.name : 'Pod Floater Backup'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-500">
                    <span>Skills:</span>
                    <div className="flex gap-1">
                      {emp.skills?.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Off Quota: {emp.weeklyOffQuota || 1}d/wk
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEmployeeId(emp.id);
                      setActiveView('employees');
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Full Schedule</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {podSubTab === 'BRANDS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {podBrands.map((brand) => {
            const assignedStaff = employees.filter((e) =>
              brand.assignedEmployeeIds?.includes(e.id)
            );
            const brandGaps = podConflicts.filter((c) => c.brandId === brand.id);

            return (
              <Card
                key={brand.id}
                className="hover:border-slate-300 transition-all flex flex-col justify-between"
                bodyClassName="p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {brand.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {brand.category || 'D2C Consumer'}
                    </p>
                  </div>

                  {brandGaps.length > 0 ? (
                    <Badge variant="rose" size="xs" withDot>
                      {brandGaps.length} Gaps
                    </Badge>
                  ) : (
                    <Badge variant="emerald" size="xs" withDot>
                      Covered
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <Badge
                    variant={brand.staffingType === 'SINGLE_RESOURCE' ? 'amber' : 'blue'}
                    size="xs"
                  >
                    {brand.staffingType === 'SINGLE_RESOURCE' ? '1 Agent (80%)' : 'Multi-Staff'}
                  </Badge>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {brand.defaultOperatingCalendar.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                  <span className="text-slate-500 block">Assigned Staff:</span>
                  <div className="font-semibold text-slate-800">
                    {assignedStaff.length > 0
                      ? assignedStaff.map((s) => s.name).join(', ')
                      : 'Covered by Pod Floater Pool'}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {podSubTab === 'ROSTER' && (
        <Card className="p-0 overflow-hidden border border-slate-200">
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="sticky left-0 z-30 bg-slate-50 px-4 py-3 font-bold text-slate-800 min-w-[200px]">
                    Pod Member
                  </th>
                  <th className="sticky left-[200px] z-30 bg-slate-50 px-3 py-3 font-bold text-slate-700 min-w-[150px] border-r border-slate-200">
                    Primary Brand
                  </th>
                  {allDates.map((dateStr) => {
                    const d = new Date(dateStr);
                    const dayNum = d.getDate();
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

                    return (
                      <th
                        key={dateStr}
                        className={`px-1.5 py-2 text-center min-w-[44px] border-r border-slate-200 ${
                          isWeekend ? 'bg-indigo-50/40 text-indigo-900 font-bold' : 'text-slate-700 font-semibold'
                        }`}
                      >
                        <div className="text-[9px] text-slate-400 font-mono">
                          {d.toLocaleDateString('en-US', { weekday: 'narrow' })}
                        </div>
                        <div className="font-bold text-[11px]">{dayNum}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {podEmployees.map((emp) => {
                  const assignedBrand = emp.assignedBrands?.[0]
                    ? brands.find((b) => b.id === emp.assignedBrands[0].brandId)
                    : null;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="sticky left-0 z-10 bg-white px-4 py-2 min-w-[200px] border-r border-slate-200">
                        <span className="font-bold text-slate-900 block truncate">
                          {emp.name}
                        </span>
                        <span className="text-[10px] text-indigo-600 font-mono">
                          {emp.skills.join(', ')}
                        </span>
                      </td>

                      <td className="sticky left-[200px] z-10 bg-white px-3 py-2 min-w-[150px] border-r border-slate-200 text-slate-700 truncate">
                        {assignedBrand ? assignedBrand.name : 'Floater Pool'}
                      </td>

                      {allDates.map((dateStr) => {
                        const shift = shiftLookup.get(`${dateStr}_${emp.id}`) || {
                          date: dateStr,
                          employeeId: emp.id,
                          status: 'OFF',
                        };

                        let badge = <span className="text-slate-300">-</span>;
                        if (shift.status === 'WORKING') {
                          badge = (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                shift.isBackup
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {shift.isBackup ? 'BACKUP' : (shift.process || 'WORK')}
                            </span>
                          );
                        } else if (shift.status === 'LEAVE') {
                          badge = (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              LV
                            </span>
                          );
                        } else if (shift.status === 'HOLIDAY') {
                          badge = (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                              HOL
                            </span>
                          );
                        } else if (shift.status === 'OFF' || shift.status === 'WEEKLY_OFF') {
                          badge = (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                              OFF
                            </span>
                          );
                        }

                        return (
                          <td
                            key={dateStr}
                            onClick={() => openShiftEditor(shift, emp)}
                            className="px-1 py-1.5 text-center border-r border-slate-100 cursor-pointer hover:bg-indigo-50/50"
                            title={`Click to edit shift for ${emp.name} on ${dateStr}`}
                          >
                            {badge}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
