import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
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
  CheckCircle2
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
        setIsConflictDrawerOpen(true); // Open conflicts drawer to immediately show impact!
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

  const handleResolveConflictFromMatrix = (conflict) => {
    setIsConflictDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
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
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Toast Notification */}
        {notification && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-lg animate-fade-in ${
            notification.type === 'error'
              ? 'bg-rose-950/90 text-rose-300 border-rose-800'
              : 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>{notification.msg}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">✕</button>
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
        <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveView('COMPANY')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeView === 'COMPANY'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Company-Wide View</span>
          </button>

          <button
            onClick={() => setActiveView('PODS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeView === 'PODS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Pod-Wise View ({pods.length})</span>
          </button>

          <button
            onClick={() => setActiveView('BRANDS')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeView === 'BRANDS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Brand Coverage Matrix ({brands.length})</span>
          </button>

          <button
            onClick={() => setActiveView('PROCESSES')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeView === 'PROCESSES'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Process-Wise Staffing</span>
          </button>

          <button
            onClick={() => setActiveView('EMPLOYEE')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
              activeView === 'EMPLOYEE'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Employee-Wise View</span>
          </button>
        </div>

        {/* View Contents */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">Initializing Smart Roster System & Constraint Solver...</p>
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
                onResolveConflict={handleResolveConflictFromMatrix}
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

