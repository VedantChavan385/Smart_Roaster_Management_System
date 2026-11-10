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
import OverviewView from './views/OverviewView';
import RosterSchedulingView from './views/RosterSchedulingView';
import CompanyDirectoryView from './views/CompanyDirectoryView';
import ConflictCenterView from './views/ConflictCenterView';
import RosterAutomationView from './views/RosterAutomationView';
import ReportsAnalyticsView from './views/ReportsAnalyticsView';
import AttendanceLeavesView from './views/AttendanceLeavesView';
import RolesPermissionsView from './views/RolesPermissionsView';
import SettingsView from './views/SettingsView';

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
        return <OverviewView />;

      case 'roster':
        return <RosterSchedulingView />;

      case 'employees':
        return (
          <EmployeeView
            selectedEmployeeId={selectedEmployeeId}
            onSelectEmployee={(id) => setSelectedEmployeeId(id)}
          />
        );

      case 'companies':
        return <CompanyDirectoryView />;

      case 'pods':
        return <PodView onSelectEmployee={(id) => setSelectedEmployeeId(id)} />;

      case 'brand-coverage':
        return (
          <div className="space-y-6">
            <PageHeader
              title="Brand Coverage Matrix"
              subtitle="Monitor SLA coverage across all 14 D2C brand accounts with single-resource enforcement."
              badge={`${brands.length} Client Accounts`}
              badgeVariant="blue"
              breadcrumbs={[
                { label: 'Operations' },
                { label: 'Brand Coverage' },
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

      case 'conflicts':
        return <ConflictCenterView />;

      case 'automation':
        return <RosterAutomationView />;

      case 'leaves':
        return <AttendanceLeavesView />;

      case 'reports':
        return <ReportsAnalyticsView />;

      case 'roles':
        return <RolesPermissionsView />;

      case 'settings':
        return <SettingsView />;

      default:
        return <OverviewView />;
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
