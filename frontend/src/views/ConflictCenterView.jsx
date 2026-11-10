import React, { useState, useMemo } from 'react';
import { useRoster } from '../context/RosterContext';
import { useNavigation } from '../context/NavigationContext';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

import {
  AlertTriangle,
  CheckCircle2,
  Zap,
  Sliders,
  Filter,
  Search,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Calendar,
  Building2,
  Users,
  Check,
  X,
  Sparkles,
  Info,
} from 'lucide-react';

export default function ConflictCenterView() {
  const {
    month,
    roster,
    brands,
    employees,
    pods,
    criticalGapsCount,
    applyFix,
    isApplyingFix,
    autoResolveAll,
    isAutoResolving,
    setIsSimulatorModalOpen,
    openShiftEditor,
  } = useRoster();

  const { setActiveView } = useNavigation();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPodId, setSelectedPodId] = useState('ALL');
  const [selectedBrandId, setSelectedBrandId] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'WARNING'

  // Proposed Changes Preview Confirmation Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [singleFixCandidate, setSingleFixCandidate] = useState(null); // { conflictId, backupEmployeeId, backupName, brandName, date }

  // Filtered conflicts
  const filteredConflicts = useMemo(() => {
    if (!roster?.conflicts) return [];

    return roster.conflicts.filter((c) => {
      const matchesSearch =
        c.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.process?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.date?.includes(searchTerm) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const brand = brands.find((b) => b.id === c.brandId);
      const matchesPod = selectedPodId === 'ALL' || brand?.podId === selectedPodId;
      const matchesBrand = selectedBrandId === 'ALL' || c.brandId === selectedBrandId;
      const matchesSeverity = severityFilter === 'ALL' || c.severity === severityFilter;

      return matchesSearch && matchesPod && matchesBrand && matchesSeverity;
    });
  }, [roster, brands, searchTerm, selectedPodId, selectedBrandId, severityFilter]);

  // Resolvable conflicts with suggested backups
  const resolvableConflicts = useMemo(() => {
    return (roster?.conflicts || []).filter(
      (c) => c.suggestedResolutions && c.suggestedResolutions.length > 0
    );
  }, [roster]);

  // Handler for single fix with confirmation preview
  const handleInitiateFix = (conflict, resolution) => {
    setSingleFixCandidate({
      conflictId: conflict.id,
      backupEmployeeId: resolution.backupEmployeeId,
      backupName: resolution.backupEmployeeName,
      brandName: conflict.brandName,
      date: conflict.date,
      process: conflict.process,
      reason: resolution.reason,
    });
  };

  const handleConfirmSingleFix = async () => {
    if (!singleFixCandidate) return;
    await applyFix(singleFixCandidate.conflictId, singleFixCandidate.backupEmployeeId);
    setSingleFixCandidate(null);
  };

  const handleConfirmBatchAutoResolve = async () => {
    await autoResolveAll();
    setPreviewModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Operational Conflicts & Gap Center"
        subtitle="Automated constraint violation diagnostics, leave coverage gaps, single-resource violations & 1-click resolution."
        badge={`${criticalGapsCount} Active Issues`}
        badgeVariant={criticalGapsCount > 0 ? 'rose' : 'emerald'}
        breadcrumbs={[{ label: 'Operations' }, { label: 'Conflicts & Gaps' }]}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={Sliders}
              onClick={() => setIsSimulatorModalOpen(true)}
            >
              What-If Simulator
            </Button>

            {criticalGapsCount > 0 && (
              <Button
                variant="success"
                size="sm"
                icon={Zap}
                onClick={() => setPreviewModalOpen(true)}
                isLoading={isAutoResolving}
              >
                Auto-Resolve All ({resolvableConflicts.length})
              </Button>
            )}
          </>
        }
      />

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Flagged Gaps
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {roster?.conflicts?.length || 0}
          </div>
          <span className="text-[11px] text-rose-600 font-semibold block mt-1">
            {criticalGapsCount} Critical unstaffed shifts
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            1-Click Resolvable
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {resolvableConflicts.length}
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            Pod floater recommendations ready
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Single-Resource Violations
          </span>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {brands.filter((b) => b.staffingType === 'SINGLE_RESOURCE').length} Brands
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            ~80% dedicated staffing rules
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Current Coverage SLA
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {roster?.metadata?.coverageRate || 75}%
          </div>
          <span
            className={`text-[11px] font-semibold block mt-1 ${
              criticalGapsCount === 0 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {criticalGapsCount === 0 ? '100% full coverage' : 'Reaches 100% after auto-resolve'}
          </span>
        </div>
      </div>

      {/* 3. Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by brand, process or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Pod Filter */}
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

          {/* Brand Filter */}
          <select
            value={selectedBrandId}
            onChange={(e) => setSelectedBrandId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Brands ({brands.length})</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Severity Toggle */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSeverityFilter('ALL')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                severityFilter === 'ALL'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Gaps ({roster?.conflicts?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setSeverityFilter('CRITICAL')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                severityFilter === 'CRITICAL'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              Critical ({criticalGapsCount})
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium shrink-0">
          Showing {filteredConflicts.length} of {roster?.conflicts?.length || 0} issues
        </span>
      </div>

      {/* 4. Conflict Cards Grid */}
      {filteredConflicts.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All Operational Demands Satisfied"
          description="Every client brand and operational process is fully covered. No staffing shortages or single-resource violations detected."
          actionLabel="View Roster Matrix"
          onAction={() => setActiveView('roster')}
        />
      ) : (
        <div className="space-y-3.5">
          {filteredConflicts.map((conflict) => {
            const conflictBrand = brands.find((b) => b.id === conflict.brandId);
            const conflictPod = pods.find((p) => p.id === conflictBrand?.podId);
            const topResolution = conflict.suggestedResolutions?.[0];

            return (
              <Card
                key={conflict.id}
                className="hover:border-slate-300 transition-all border border-rose-200/90 shadow-2xs"
                bodyClassName="p-4 space-y-3"
              >
                {/* Conflict Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                      {conflict.severity}
                    </span>

                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
                      {conflict.date}
                    </span>

                    <h3 className="font-bold text-sm text-slate-900">
                      {conflict.brandName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Badge variant="indigo" size="xs">
                      Process: {conflict.process}
                    </Badge>
                    <Badge variant="slate" size="xs">
                      {conflictPod ? conflictPod.name.split(' ')[1] : 'Operations'}
                    </Badge>
                  </div>
                </div>

                {/* Conflict Description & Policy Explanation */}
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {conflict.description}
                </p>

                {/* Recommended Resolutions */}
                {conflict.suggestedResolutions && conflict.suggestedResolutions.length > 0 ? (
                  <div className="pt-2.5 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Recommended Floater Backup Solutions:
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {conflict.suggestedResolutions.map((res, rIdx) => (
                        <div
                          key={rIdx}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80 text-xs shadow-2xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5 truncate">
                              <UserCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{res.backupEmployeeName}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                              {res.reason}
                            </span>
                          </div>

                          <Button
                            variant="success"
                            size="xs"
                            icon={Zap}
                            onClick={() => handleInitiateFix(conflict, res)}
                            isLoading={isApplyingFix}
                            className="shrink-0"
                          >
                            Assign Backup
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="italic">No immediate pod floater available. Reassign peer manually.</span>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => openShiftEditor({ date: conflict.date, brandId: conflict.brandId, process: conflict.process }, employees[0])}
                    >
                      Manual Override
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* 5. PREVIEW & CONFIRMATION MODAL (Section 10 Requirement) */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-modal overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Confirm Proposed Auto-Resolution Changes
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review floater backup assignments before committing to roster
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2">
                <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  The solver has calculated optimal backup replacements for <strong>{resolvableConflicts.length}</strong> coverage gaps based on agent skill certifications, pod affinity, and maximum consecutive shift policies.
                </span>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                  Proposed Shift Reassignments:
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {resolvableConflicts.slice(0, 8).map((c) => {
                    const topRes = c.suggestedResolutions[0];
                    return (
                      <div key={c.id} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">
                            {c.date} • {c.brandName} ({c.process})
                          </div>
                          <span className="text-[11px] text-slate-500">{topRes.reason}</span>
                        </div>
                        <Badge variant="emerald" size="xs">
                          → Assign {topRes.backupEmployeeName}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Coverage will increase to <strong>100%</strong>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPreviewModalOpen(false)}
                  disabled={isAutoResolving}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  icon={Check}
                  onClick={handleConfirmBatchAutoResolve}
                  isLoading={isAutoResolving}
                >
                  Confirm & Apply All ({resolvableConflicts.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Single Fix Confirmation Dialog */}
      {singleFixCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-modal overflow-hidden p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Confirm Backup Assignment
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Assign <strong>{singleFixCandidate.backupName}</strong> to cover{' '}
              <strong>{singleFixCandidate.brandName}</strong> ({singleFixCandidate.process}) on{' '}
              <strong>{singleFixCandidate.date}</strong>?
            </p>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
              💡 {singleFixCandidate.reason}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSingleFixCandidate(null)}
                disabled={isApplyingFix}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                size="sm"
                icon={Check}
                onClick={handleConfirmSingleFix}
                isLoading={isApplyingFix}
              >
                Confirm Assignment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

