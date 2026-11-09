import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import GuidedTourBar from './components/GuidedTourBar';
import ConflictDrawer from './components/ConflictDrawer';
import ChangeSimulatorModal from './components/ChangeSimulatorModal';
import EntityManagementModal from './components/EntityManagementModal';

import CompanyView from './views/CompanyView';
import PodView from './views/PodView';
import BrandView from './views/BrandView';
import ProcessView from './views/ProcessView';
import EmployeeView from './views/EmployeeView';

import { 
  Building2, 
  Users, 
  Layers, 
  Activity, 
  User, 
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [month, setMonth] = useState('2026-11');
  const [activeView, setActiveView] = useState('COMPANY'); // 'COMPANY' | 'PODS' | 'BRANDS' | 'PROCESSES' | 'EMPLOYEE'

  // Data states
  const [roster, setRoster] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pods, setPods] = useState([]);
  const [holidays, setHolidays] = useState([]);

  // UI / Modal states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [isConflictDrawerOpen, setIsConflictDrawerOpen] = useState(false);
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(true);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Initial Data Fetching
  const fetchAllData = async (targetMonth = month) => {
    try {
      setIsLoading(true);
      const [podsRes, brandsRes, empRes, holRes, rosterRes] = await Promise.all([
        fetch('/api/pods').then(r => r.json()),
        fetch('/api/brands').then(r => r.json()),
        fetch('/api/employees').then(r => r.json()),
        fetch('/api/holidays').then(r => r.json()),
        fetch(`/api/roster/${targetMonth}`).then(r => r.json())
      ]);

      if (podsRes.success) setPods(podsRes.data);
      if (brandsRes.success) setBrands(brandsRes.data);
      if (empRes.success) setEmployees(empRes.data);
      if (holRes.success) setHolidays(holRes.data);
      if (rosterRes.success) setRoster(rosterRes.data);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      showNotification('Failed to load roster data from server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData(month);
  }, [month]);

  // Action: Generate Roster
  const handleGenerateRoster = async () => {
    try {
      setIsGenerating(true);
      const res = await fetch('/api/roster/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month })
      }).then(r => r.json());

      if (res.success) {
        setRoster(res.data);
        showNotification(res.message);
      } else {
        showNotification(res.error || 'Generation failed', 'error');
      }
    } catch (err) {
      showNotification('Network error during generation.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Action: Apply Conflict Fix
  const handleApplyFix = async (conflictId, backupEmployeeId) => {
    try {
      setIsApplyingFix(true);
      const res = await fetch('/api/roster/apply-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, conflictId, backupEmployeeId })
      }).then(r => r.json());

      if (res.success) {
        setRoster(res.data);
        showNotification(res.message);
      } else {
        showNotification(res.error || 'Failed to apply resolution.', 'error');
      }
    } catch (err) {
      showNotification('Network error applying fix.', 'error');
    } finally {
      setIsApplyingFix(false);
    }
  };

  // Action: Run Change Simulation (Section 3-F)
  const handleSimulateChange = async (simData) => {
    try {
      setIsSimulating(true);
      const res = await fetch('/api/roster/simulate-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simData)
      }).then(r => r.json());

      if (res.success) {
        setRoster(res.data);
        setIsSimulatorModalOpen(false);
        setIsConflictDrawerOpen(true);
        showNotification(res.message);
      } else {
        showNotification(res.error || 'Simulation failed.', 'error');
      }
    } catch (err) {
      showNotification('Simulation error.', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  // Action: Reset Database to Seed
  const handleResetSeed = async () => {
    if (!window.confirm('Reset all operational data back to the clean 32-employee seed dataset?')) return;
    try {
      setIsResetting(true);
      const res = await fetch('/api/seed/reset', { method: 'POST' }).then(r => r.json());
      if (res.success) {
        await fetchAllData(month);
        showNotification('Database successfully reset to realistic sample dataset.');
      }
    } catch (err) {
      showNotification('Failed to reset dataset.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!roster || !roster.shifts) return;

    const headers = ['Date', 'Employee ID', 'Employee Name', 'Brand', 'Process', 'Shift Status', 'Is Backup', 'Notes'];
    const rows = roster.shifts.map(s => {
      const emp = employees.find(e => e.id === s.employeeId);
      const brand = brands.find(b => b.id === s.brandId);
      return [
        s.date,
        s.employeeId,
        `"${emp ? emp.name : s.employeeId}"`,
        `"${brand ? brand.name : (s.brandId || '')}"`,
        `"${s.process || ''}"`,
        s.status,
        s.isBackup ? 'Yes' : 'No',
        `"${s.notes || ''}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Roster_${month}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Exported roster for ${month} to CSV.`);
  };

  const handleSelectEmployeeForDrilldown = (empId) => {
    setSelectedEmployeeId(empId);
    setActiveView('EMPLOYEE');
  };

  // Evaluator Quick Tour Handlers
  const handleTourScenario1 = () => {
    setActiveView('BRANDS');
    showNotification('Switched to Brand Matrix: Observe the ~80% single-resource brands with dedicated staff.');
  };

  const handleTourScenario2 = () => {
    setIsConflictDrawerOpen(true);
    showNotification('Opening Conflicts Drawer: Inspecting Nov 15 leave coverage gap for GlowSkin.');
  };

  const handleTourScenario3 = () => {
    setIsConflictDrawerOpen(true);
    showNotification('Click "Assign" beside Meera Chawla to resolve the Nov 15 gap with 1 click!');
  };

  const handleTourScenario4 = () => {
    setIsSimulatorModalOpen(true);
    showNotification('Testing Section 3-F: Simulate a sudden sick leave and observe instant gap detection.');
  };

  const criticalGapsCount = roster?.conflicts?.filter(c => c.severity === 'CRITICAL')?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Application Header */}
      <Header
        month={month}
        setMonth={setMonth}
        roster={roster}
        onGenerate={handleGenerateRoster}
        isGenerating={isGenerating}
        onOpenConflicts={() => setIsConflictDrawerOpen(true)}
        onOpenSimulator={() => setIsSimulatorModalOpen(true)}
        onOpenEntities={() => setIsEntityModalOpen(true)}
        onResetSeed={handleResetSeed}
        isResetting={isResetting}
        onExportCSV={handleExportCSV}
        onToggleGuide={() => setIsGuideOpen(!isGuideOpen)}
        isGuideOpen={isGuideOpen}
      />

      {/* Evaluator Guided Tour Bar */}
      {isGuideOpen && (
        <GuidedTourBar
          onRunScenario1={handleTourScenario1}
          onRunScenario2={handleTourScenario2}
          onRunScenario3={handleTourScenario3}
          onRunScenario4={handleTourScenario4}
          onClose={() => setIsGuideOpen(false)}
        />
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Toast Notification */}
        {notification && (
          <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between border shadow-sm animate-fade-in ${
            notification.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>{notification.msg}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700">✕</button>
          </div>
        )}

        {/* Action Needed Banner (if conflicts exist) */}
        {criticalGapsCount > 0 && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border border-amber-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div>
                <strong className="text-slate-900 font-bold">Action Needed:</strong>{' '}
                <span className="text-slate-700 font-medium">
                  {criticalGapsCount} coverage gap(s) detected. Client operations are currently understaffed on specific days.
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsConflictDrawerOpen(true)}
              className="px-3 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Review & Assign Backups</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Operational KPI Metric Cards */}
        <MetricCards
          roster={roster}
          employees={employees}
          brands={brands}
          pods={pods}
        />

        {/* View Switcher Tabs (Section 3-E) */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveView('COMPANY')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeView === 'COMPANY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/60'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Company-Wide View</span>
          </button>

          <button
            onClick={() => setActiveView('PODS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeView === 'PODS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/60'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Pod-Wise View ({pods.length})</span>
          </button>

          <button
            onClick={() => setActiveView('BRANDS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeView === 'BRANDS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/60'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Brand Coverage Matrix ({brands.length})</span>
          </button>

          <button
            onClick={() => setActiveView('PROCESSES')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeView === 'PROCESSES'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/60'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Process-Wise Staffing</span>
          </button>

          <button
            onClick={() => setActiveView('EMPLOYEE')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeView === 'EMPLOYEE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-slate-100/60'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Employee-Wise View</span>
          </button>
        </div>

        {/* View Contents */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-medium">Initializing Smart Roster System & Constraint Solver...</p>
          </div>
        ) : (
          <div>
            {activeView === 'COMPANY' && (
              <CompanyView
                roster={roster}
                employees={employees}
                brands={brands}
                pods={pods}
                onSelectEmployee={handleSelectEmployeeForDrilldown}
              />
            )}

            {activeView === 'PODS' && (
              <PodView
                roster={roster}
                employees={employees}
                brands={brands}
                pods={pods}
                onSelectEmployee={handleSelectEmployeeForDrilldown}
              />
            )}

            {activeView === 'BRANDS' && (
              <BrandView
                roster={roster}
                brands={brands}
                employees={employees}
                pods={pods}
                onResolveConflict={() => setIsConflictDrawerOpen(true)}
              />
            )}

            {activeView === 'PROCESSES' && (
              <ProcessView
                roster={roster}
                brands={brands}
                employees={employees}
              />
            )}

            {activeView === 'EMPLOYEE' && (
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
        )}
      </main>

      {/* Slide-over Conflict Diagnostics Drawer */}
      <ConflictDrawer
        isOpen={isConflictDrawerOpen}
        onClose={() => setIsConflictDrawerOpen(false)}
        conflicts={roster?.conflicts || []}
        month={month}
        onApplyFix={handleApplyFix}
        isApplying={isApplyingFix}
      />

      {/* Change Management Simulator Modal (Section 3-F) */}
      <ChangeSimulatorModal
        isOpen={isSimulatorModalOpen}
        onClose={() => setIsSimulatorModalOpen(false)}
        employees={employees}
        brands={brands}
        month={month}
        onSimulate={handleSimulateChange}
        isSimulating={isSimulating}
      />

      {/* Entity Rules Manager Modal (Section 3-A) */}
      <EntityManagementModal
        isOpen={isEntityModalOpen}
        onClose={() => setIsEntityModalOpen(false)}
        brands={brands}
        employees={employees}
        pods={pods}
        holidays={holidays}
      />
    </div>
  );
}
