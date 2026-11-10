import React, { useState } from 'react';
import { RosterProvider, useRoster } from './context/RosterContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import AppLayout from './components/layout/AppLayout';
import PageHeader from './components/layout/PageHeader';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import MetricCards from './components/MetricCards';
import LoadingState from './components/ui/LoadingState';
import EmptyState from './components/ui/EmptyState';

import CompanyView from './views/CompanyView';
import PodView from './views/PodView';
import BrandView from './views/BrandView';
import ProcessView from './views/ProcessView';
import EmployeeView from './views/EmployeeView';

import {
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  Sliders,
  FileSpreadsheet,
  Building2,
  Users,
  Layers,
  Activity,
  User,
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Info,
} from 'lucide-react';

function MainAppContent() {
  const {
    month,
    roster,
    employees,
    brands,
    pods,
    isLoading,
    isGenerating,
    generateRoster,
    isAutoResolving,
    autoResolveAll,
    exportCSV,
    resetSeed,
    isResetting,
    setIsConflictDrawerOpen,
    setIsSimulatorModalOpen,
    setIsEntityModalOpen,
    openShiftEditor,
    selectedEmployeeId,
    setSelectedEmployeeId,
    criticalGapsCount,
  } = useRoster();

  const { activeView, setActiveView, currentNav } = useNavigation();

  // Sub-tabs for Roster & Scheduling
  const [rosterSubView, setRosterSubView] = useState('COMPANY'); // 'COMPANY' | 'PODS' | 'BRANDS' | 'PROCESSES' | 'EMPLOYEE'

  const handleSelectEmployeeForDrilldown = (empId) => {
    setSelectedEmployeeId(empId);
    setRosterSubView('EMPLOYEE');
    setActiveView('roster');
  };

  if (isLoading) {
    return (
      <Card className="p-12">
        <LoadingState
          title="Connecting to Smart Roster Solver"
          message={`Retrieving workforce constraints, ${employees.length || 32} staff profiles and active rosters for ${month}...`}
        />
      </Card>
    );
  }

  // RENDER PER ACTIVE NAVIGATION ROUTE
  const renderViewContent = () => {
    switch (activeView) {
      case 'overview':
      case 'roster':
        return (
          <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
              title={activeView === 'overview' ? 'Operations Overview' : 'Roster & Scheduling'}
              subtitle="Multi-brand workforce scheduling matrix with automated constraint solving and backup coverage."
              badge={`${month} Schedule`}
              badgeVariant="indigo"
              breadcrumbs={[
                { label: 'Workspace' },
                { label: activeView === 'overview' ? 'Overview' : 'Roster & Scheduling' },
              ]}
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

            {/* Metric KPI Cards */}
            <MetricCards
              roster={roster}
              employees={employees}
              brands={brands}
              pods={pods}
            />

            {/* Roster Perspective Tabs */}
            <div className="bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setRosterSubView('COMPANY')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  rosterSubView === 'COMPANY'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Company-Wide View</span>
              </button>

              <button
                type="button"
                onClick={() => setRosterSubView('PODS')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  rosterSubView === 'PODS'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Pod-Wise View ({pods.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setRosterSubView('BRANDS')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  rosterSubView === 'BRANDS'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Brand Coverage Matrix ({brands.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setRosterSubView('PROCESSES')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  rosterSubView === 'PROCESSES'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Process-Wise Staffing</span>
              </button>

              <button
                type="button"
                onClick={() => setRosterSubView('EMPLOYEE')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  rosterSubView === 'EMPLOYEE'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Employee-Wise Drilldown</span>
              </button>
            </div>

            {/* Active View Container */}
            <div>
              {rosterSubView === 'COMPANY' && (
                <CompanyView
                  roster={roster}
                  employees={employees}
                  brands={brands}
                  pods={pods}
                  onSelectEmployee={handleSelectEmployeeForDrilldown}
                  onOpenShiftEditor={openShiftEditor}
                />
              )}

              {rosterSubView === 'PODS' && (
                <PodView
                  roster={roster}
                  employees={employees}
                  brands={brands}
                  pods={pods}
                  onSelectEmployee={handleSelectEmployeeForDrilldown}
                />
              )}

              {rosterSubView === 'BRANDS' && (
                <BrandView
                  roster={roster}
                  brands={brands}
                  employees={employees}
                  pods={pods}
                  onResolveConflict={() => setIsConflictDrawerOpen(true)}
                />
              )}

              {rosterSubView === 'PROCESSES' && (
                <ProcessView
                  roster={roster}
                  brands={brands}
                  employees={employees}
                />
              )}

              {rosterSubView === 'EMPLOYEE' && (
                <EmployeeView
                  roster={roster}
                  employees={employees}
                  brands={brands}
                  pods={pods}
                  selectedEmployeeId={selectedEmployeeId}
                  onSelectEmployee={(id) => setSelectedEmployeeId(id)}
                />
              )}
            </div>
          </div>
        );

      case 'employees':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Employee Management"
              subtitle="Directory of active team members, skill qualifications, weekly off quotas, and brand assignments."
              badge={`${employees.length} Staff Members`}
              badgeVariant="indigo"
              breadcrumbs={[{ label: 'Workspace' }, { label: 'Employees' }]}
            />
            <EmployeeView
              roster={roster}
              employees={employees}
              brands={brands}
              pods={pods}
              selectedEmployeeId={selectedEmployeeId}
              onSelectEmployee={(id) => setSelectedEmployeeId(id)}
            />
          </div>
        );

      case 'companies':
      case 'brand-coverage':
        return (
          <div className="space-y-6">
            <PageHeader
              title={activeView === 'companies' ? 'Client Companies & Brands' : 'Brand Coverage Matrix'}
              subtitle="Monitor SLA coverage across all 14 D2C brand accounts with single-resource enforcement."
              badge={`${brands.length} Client Accounts`}
              badgeVariant="blue"
              breadcrumbs={[
                { label: activeView === 'companies' ? 'Workspace' : 'Operations' },
                { label: activeView === 'companies' ? 'Client Companies' : 'Brand Coverage' },
              ]}
              actions={
                <Button
                  variant="primary"
                  size="sm"
                  icon={Zap}
                  onClick={autoResolveAll}
                  isLoading={isAutoResolving}
                >
                  Auto-Resolve Gaps
                </Button>
              }
            />
            <BrandView
              roster={roster}
              brands={brands}
              employees={employees}
              pods={pods}
              onResolveConflict={() => setIsConflictDrawerOpen(true)}
            />
          </div>
        );

      case 'pods':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Pods & Teams"
              subtitle="Cross-brand pod clusters providing dedicated and backup support."
              badge={`${pods.length} Active Pods`}
              badgeVariant="purple"
              breadcrumbs={[{ label: 'Workspace' }, { label: 'Pods & Teams' }]}
            />
            <PodView
              roster={roster}
              employees={employees}
              brands={brands}
              pods={pods}
              onSelectEmployee={handleSelectEmployeeForDrilldown}
            />
          </div>
        );

      case 'conflicts':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Conflicts & Gaps Center"
              subtitle="Automated constraint violation diagnostics, leave coverage gaps, and 1-click resolution recommendations."
              badge={`${criticalGapsCount} Active Issues`}
              badgeVariant={criticalGapsCount > 0 ? 'rose' : 'emerald'}
              breadcrumbs={[{ label: 'Operations' }, { label: 'Conflicts & Gaps' }]}
              actions={
                <Button
                  variant="primary"
                  size="sm"
                  icon={Zap}
                  onClick={autoResolveAll}
                  isLoading={isAutoResolving}
                >
                  Auto-Resolve All ({criticalGapsCount})
                </Button>
              }
            />
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    Active Operational Conflicts & Recommended Fixes
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={AlertTriangle}
                    onClick={() => setIsConflictDrawerOpen(true)}
                  >
                    Open Diagnostic Drawer
                  </Button>
                </div>

                {roster?.conflicts && roster.conflicts.length > 0 ? (
                  <div className="space-y-3">
                    {roster.conflicts.map((conflict) => (
                      <div
                        key={conflict.id}
                        className="p-4 rounded-xl border border-rose-200/90 bg-rose-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 uppercase">
                              {conflict.severity}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {conflict.date} • {conflict.brandName} ({conflict.process})
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">{conflict.description}</p>
                          {conflict.suggestedResolutions?.length > 0 && (
                            <p className="text-xs text-indigo-700 font-medium">
                              💡 Recommended Floater Backup: {conflict.suggestedResolutions[0].employeeName} ({conflict.suggestedResolutions[0].reason})
                            </p>
                          )}
                        </div>

                        <Button
                          variant="success"
                          size="sm"
                          icon={Zap}
                          onClick={() => setIsConflictDrawerOpen(true)}
                        >
                          Review & Resolve
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={ShieldCheck}
                    title="All Shift Slots Fully Covered"
                    description="No coverage gaps or single-resource violations detected in this month's roster."
                  />
                )}
              </div>
            </Card>
          </div>
        );

      case 'automation':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Roster Automation & Solver"
              subtitle="Execute high-performance constraint solver, test what-if operational disruptions, and manage rules."
              badge="Deterministic Engine"
              badgeVariant="emerald"
              breadcrumbs={[{ label: 'Operations' }, { label: 'Roster Automation' }]}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card
                title="Constraint Solver"
                subtitle="Run 7-stage deterministic assignment algorithm"
                actions={
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Sparkles}
                    onClick={generateRoster}
                    isLoading={isGenerating}
                  >
                    Run Solver
                  </Button>
                }
              >
                <div className="space-y-3 text-xs text-slate-600">
                  <p>
                    Re-evaluates dedicated single-resource brand staffing, off-day quotas, and dynamically allocates pod floaters.
                  </p>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    Current coverage health:{' '}
                    <strong className="text-emerald-700 font-bold">
                      {roster?.metadata?.coverageRate || 75}%
                    </strong>
                  </div>
                </div>
              </Card>

              <Card
                title="What-If Disruption Simulator"
                subtitle="Section 3-F Change Management"
                actions={
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Sliders}
                    onClick={() => setIsSimulatorModalOpen(true)}
                  >
                    Open Simulator
                  </Button>
                }
              >
                <div className="space-y-3 text-xs text-slate-600">
                  <p>
                    Simulate unexpected medical absences, sudden attrition, or brand workload spikes to stress-test pod resilience.
                  </p>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setIsSimulatorModalOpen(true)}
                  >
                    Launch Simulation Modal
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'leaves':
      case 'reports':
      case 'roles':
      case 'settings':
      default:
        return (
          <div className="space-y-6">
            <PageHeader
              title={currentNav.label}
              subtitle={currentNav.description}
              badge="Module Active"
              badgeVariant="slate"
              breadcrumbs={[{ label: currentNav.section }, { label: currentNav.label }]}
            />
            <Card className="p-8 text-center">
              <div className="max-w-md mx-auto space-y-3">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{currentNav.label} Ready for Phase Expansion</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The enterprise navigation shell and state architecture for this section are active. You can review live rosters and brand matrices right now.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={CalendarDays}
                    onClick={() => setActiveView('roster')}
                  >
                    Go to Roster & Scheduling
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Layers}
                    onClick={() => setActiveView('brand-coverage')}
                  >
                    View Brand Matrix
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );
    }
  };

  return <AppLayout>{renderViewContent()}</AppLayout>;
}

export default function App() {
  return (
    <NavigationProvider>
      <RosterProvider>
        <MainAppContent />
      </RosterProvider>
    </NavigationProvider>
  );
}
