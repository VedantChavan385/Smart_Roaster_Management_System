import React from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import GuidedTourBar from '../GuidedTourBar';
import ConflictDrawer from '../ConflictDrawer';
import ChangeSimulatorModal from '../ChangeSimulatorModal';
import EntityManagementModal from '../EntityManagementModal';
import ShiftEditorModal from '../ShiftEditorModal';
import QuickAddEntityModal from '../QuickAddEntityModal';
import CommandPalette from '../CommandPalette';
import ToastContainer from '../ui/ToastContainer';
import { useRoster } from '../../context/RosterContext';
import { useNavigation } from '../../context/NavigationContext';
import { AlertCircle, CheckCircle2, AlertTriangle, Zap, ArrowRight } from 'lucide-react';

export default function AppLayout({ children }) {
  const {
    month,
    roster,
    employees,
    brands,
    pods,
    holidays,
    criticalGapsCount,
    toasts,
    dismissToast,
    isGuideOpen,
    setIsGuideOpen,
    isConflictDrawerOpen,
    setIsConflictDrawerOpen,
    isSimulatorModalOpen,
    setIsSimulatorModalOpen,
    isEntityModalOpen,
    setIsEntityModalOpen,
    isShiftEditorOpen,
    setIsShiftEditorOpen,
    activeShiftToEdit,
    activeEmpToEdit,
    saveShift,
    isSavingShift,
    isQuickAddOpen,
    setIsQuickAddOpen,
    addEmployee,
    addBrand,
    isSubmittingEntity,
    autoResolveAll,
    isAutoResolving,
    applyFix,
    isApplyingFix,
    simulateChange,
    isSimulating,
    showNotification,
  } = useRoster();

  const { setActiveView } = useNavigation();

  // Quick Tour triggers
  const handleTourScenario1 = () => {
    setActiveView('brand-coverage');
    showNotification('Switched to Brand Coverage: Inspecting ~80% single-resource dedicated staff.');
  };

  const handleTourScenario2 = () => {
    setIsConflictDrawerOpen(true);
    showNotification('Opening Diagnostics Drawer: Inspecting Nov 15 leave coverage gap.');
  };

  const handleTourScenario3 = () => {
    autoResolveAll();
  };

  const handleTourScenario4 = () => {
    setIsSimulatorModalOpen(true);
    showNotification('Testing What-If Simulator: Simulate sudden sick leave & observe instant gap detection.');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Dark Navy Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <AppHeader />

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

        {/* Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Critical Gaps Alert Banner */}
            {criticalGapsCount > 0 && (
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-amber-950 font-bold block text-sm">
                      {criticalGapsCount} Operational Coverage Gaps Detected
                    </span>
                    <span className="text-amber-800 font-medium">
                      Client operations are understaffed on specific days due to employee leave collisions.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={autoResolveAll}
                    disabled={isAutoResolving}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    <span>{isAutoResolving ? 'Resolving...' : 'Auto-Resolve All'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsConflictDrawerOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Review Gaps</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* View Content Injected Here */}
            {children}
          </div>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <ConflictDrawer
        isOpen={isConflictDrawerOpen}
        onClose={() => setIsConflictDrawerOpen(false)}
        conflicts={roster?.conflicts || []}
        month={month}
        onApplyFix={applyFix}
        onAutoResolveAll={autoResolveAll}
        isApplying={isApplyingFix || isAutoResolving}
      />

      <ChangeSimulatorModal
        isOpen={isSimulatorModalOpen}
        onClose={() => setIsSimulatorModalOpen(false)}
        employees={employees}
        brands={brands}
        month={month}
        onSimulate={simulateChange}
        isSimulating={isSimulating}
      />

      <EntityManagementModal
        isOpen={isEntityModalOpen}
        onClose={() => setIsEntityModalOpen(false)}
        brands={brands}
        employees={employees}
        pods={pods}
        holidays={holidays}
      />

      <ShiftEditorModal
        isOpen={isShiftEditorOpen}
        onClose={() => setIsShiftEditorOpen(false)}
        shiftData={activeShiftToEdit}
        employee={activeEmpToEdit}
        brands={brands}
        onSaveShift={saveShift}
        isSaving={isSavingShift}
      />

      <QuickAddEntityModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        pods={pods}
        brands={brands}
        onAddEmployee={addEmployee}
        onAddBrand={addBrand}
        isSubmitting={isSubmittingEntity}
      />

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette />

      {/* Stacked Floating Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

