import React, { createContext, useContext, useState, useEffect } from 'react';
import { rosterApi } from '../api/rosterApi';

const RosterContext = createContext(null);

export function RosterProvider({ children }) {
  const [month, setMonth] = useState('2026-11');

  // Core Data Entities
  const [roster, setRoster] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pods, setPods] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]);

  // UI & Drawer States
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [isConflictDrawerOpen, setIsConflictDrawerOpen] = useState(false);
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Shift Editor State
  const [isShiftEditorOpen, setIsShiftEditorOpen] = useState(false);
  const [activeShiftToEdit, setActiveShiftToEdit] = useState(null);
  const [activeEmpToEdit, setActiveEmpToEdit] = useState(null);

  // Command Palette & Global Modal States
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState(null);

  // Quick Add Modal State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const [isAutoResolving, setIsAutoResolving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSavingShift, setIsSavingShift] = useState(false);
  const [isSubmittingEntity, setIsSubmittingEntity] = useState(false);

  // Toast Notification Stack
  const [toasts, setToasts] = useState([]);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = ({ msg, type = 'success', subtext = null, action = null, duration = 4500 }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newToast = { id, msg, type, subtext, action };

    setToasts((prev) => [...prev.slice(-3), newToast]); // keep max 4 toasts at a time

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
    return id;
  };

  // Backwards compatible showNotification
  const showNotification = (msg, type = 'success') => {
    showToast({ msg, type });
  };

  const clearNotification = () => setToasts([]);

  // Fetch all initial data
  const fetchData = async (targetMonth = month) => {
    try {
      setIsLoading(true);
      const [podsRes, brandsRes, empRes, holRes, leavesRes, rosterRes] = await Promise.all([
        rosterApi.getPods(),
        rosterApi.getBrands(),
        rosterApi.getEmployees(),
        rosterApi.getHolidays(),
        rosterApi.getLeaves(),
        rosterApi.getRoster(targetMonth),
      ]);

      if (podsRes.success) setPods(podsRes.data);
      if (brandsRes.success) setBrands(brandsRes.data);
      if (empRes.success) setEmployees(empRes.data);
      if (holRes.success) setHolidays(holRes.data);
      if (leavesRes?.success) setLeaves(leavesRes.data);
      if (rosterRes.success) setRoster(rosterRes.data);
    } catch (err) {
      console.error('Failed to fetch roster system data:', err);
      showNotification('Failed to connect to backend server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(month);
  }, [month]);

  // Actions
  const handleGenerateRoster = async () => {
    try {
      setIsGenerating(true);
      const res = await rosterApi.generateRoster(month);
      if (res.success) {
        setRoster(res.data);
        showNotification(res.message);
      } else {
        showNotification(res.error || 'Roster generation failed', 'error');
      }
    } catch (err) {
      showNotification('Network error during generation.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoResolveAll = async () => {
    try {
      setIsAutoResolving(true);
      const res = await rosterApi.autoResolveAll(month);
      if (res.success) {
        setRoster(res.data);
        showNotification(res.message);
      } else {
        showNotification(res.error || 'Auto-resolve failed', 'error');
      }
    } catch (err) {
      showNotification('Network error during auto-resolve.', 'error');
    } finally {
      setIsAutoResolving(false);
    }
  };

  const handleApplyFix = async (conflictId, backupEmployeeId) => {
    try {
      setIsApplyingFix(true);
      const res = await rosterApi.applyFix(month, conflictId, backupEmployeeId);
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

  const handleOpenShiftEditor = (shift, emp) => {
    setActiveShiftToEdit(shift);
    setActiveEmpToEdit(emp);
    setIsShiftEditorOpen(true);
  };

  const handleSaveShift = async (shiftPayload) => {
    try {
      setIsSavingShift(true);
      const res = await rosterApi.updateShift({ month, ...shiftPayload });
      if (res.success) {
        setRoster(res.data);
        setIsShiftEditorOpen(false);
        showToast({
          msg: res.message || 'Shift assignment saved',
          type: 'success',
        });
      } else {
        showToast({
          msg: res.error || 'Failed to update shift',
          type: 'error',
        });
      }
    } catch (err) {
      showToast({
        msg: 'Network error updating shift.',
        type: 'error',
      });
    } finally {
      setIsSavingShift(false);
    }
  };

  // Optimistic Quick Update Shift with Undo Support
  const handleQuickUpdateShift = async (shiftPayload, previousState = null) => {
    // 1. In-memory optimistic update
    if (roster && roster.shifts) {
      const updatedShifts = roster.shifts.map((s) => {
        if (s.date === shiftPayload.date && s.employeeId === shiftPayload.employeeId) {
          return {
            ...s,
            status: shiftPayload.status,
            brandId: shiftPayload.brandId !== undefined ? shiftPayload.brandId : s.brandId,
            process: shiftPayload.process !== undefined ? shiftPayload.process : s.process,
            notes: shiftPayload.notes !== undefined ? shiftPayload.notes : s.notes,
          };
        }
        return s;
      });
      setRoster((prev) => ({ ...prev, shifts: updatedShifts }));
    }

    // 2. Server persistence in background
    try {
      const res = await rosterApi.updateShift({ month, ...shiftPayload });
      if (res.success) {
        setRoster(res.data);
        if (previousState) {
          showToast({
            msg: `Shift updated for ${shiftPayload.date}`,
            subtext: `Changed to ${shiftPayload.status}`,
            type: 'success',
            action: {
              label: 'Undo',
              onClick: () => handleQuickUpdateShift(previousState),
            },
          });
        }
      } else {
        // Rollback
        if (previousState && roster) {
          const revertedShifts = roster.shifts.map((s) => {
            if (s.date === previousState.date && s.employeeId === previousState.employeeId) {
              return { ...s, ...previousState };
            }
            return s;
          });
          setRoster((prev) => ({ ...prev, shifts: revertedShifts }));
        }
        showToast({
          msg: res.error || 'Failed to update shift',
          type: 'error',
        });
      }
    } catch (err) {
      if (previousState && roster) {
        const revertedShifts = roster.shifts.map((s) => {
          if (s.date === previousState.date && s.employeeId === previousState.employeeId) {
            return { ...s, ...previousState };
          }
          return s;
        });
        setRoster((prev) => ({ ...prev, shifts: revertedShifts }));
      }
      showToast({
        msg: 'Network error updating shift. Reverted change.',
        type: 'error',
      });
    }
  };

  const handleAddEmployee = async (empData) => {
    try {
      setIsSubmittingEntity(true);
      const res = await rosterApi.addEmployee(empData);
      if (res.success) {
        await fetchData(month);
        setIsQuickAddOpen(false);
        showNotification(res.message);
      } else {
        showNotification(res.error || 'Failed to add employee', 'error');
      }
    } catch (err) {
      showNotification('Error adding employee.', 'error');
    } finally {
      setIsSubmittingEntity(false);
    }
  };

  const handleAddBrand = async (brandData) => {
    try {
      setIsSubmittingEntity(true);
      const res = await rosterApi.addBrand(brandData);
      if (res.success) {
        await fetchData(month);
        setIsQuickAddOpen(false);
        showNotification(res.message);
      } else {
        showNotification(res.error || 'Failed to add brand', 'error');
      }
    } catch (err) {
      showNotification('Error adding brand.', 'error');
    } finally {
      setIsSubmittingEntity(false);
    }
  };

  const handleSimulateChange = async (simData) => {
    try {
      setIsSimulating(true);
      const res = await rosterApi.simulateChange(simData);
      if (res.success) {
        setRoster(res.data);
        setIsSimulatorModalOpen(false);
        setIsConflictDrawerOpen(true);
        showNotification(res.message);
      } else {
        showNotification(res.error || 'Simulation failed.', 'error');
      }
    } catch (err) {
      showNotification('Simulation network error.', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset all operational data back to the clean 32-employee seed dataset?')) return;
    try {
      setIsResetting(true);
      const res = await rosterApi.resetSeed();
      if (res.success) {
        await fetchData(month);
        showNotification('Database successfully reset to realistic sample dataset.');
      }
    } catch (err) {
      showNotification('Failed to reset dataset.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportCSV = () => {
    if (!roster || !roster.shifts) return;

    const headers = ['Date', 'Employee ID', 'Employee Name', 'Brand', 'Process', 'Shift Status', 'Is Backup', 'Notes'];
    const rows = roster.shifts.map((s) => {
      const emp = employees.find((e) => e.id === s.employeeId);
      const brand = brands.find((b) => b.id === s.brandId);
      return [
        s.date,
        s.employeeId,
        `"${emp ? emp.name : s.employeeId}"`,
        `"${brand ? brand.name : (s.brandId || '')}"`,
        `"${s.process || ''}"`,
        s.status,
        s.isBackup ? 'Yes' : 'No',
        `"${s.notes || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartRoster_${month}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Exported roster for ${month} to CSV.`);
  };

  const criticalGapsCount = roster?.conflicts?.filter((c) => c.severity === 'CRITICAL')?.length || 0;

  const value = {
    month,
    setMonth,
    roster,
    employees,
    brands,
    pods,
    holidays,
    leaves,
    selectedEmployeeId,
    setSelectedEmployeeId,
    isConflictDrawerOpen,
    setIsConflictDrawerOpen,
    isSimulatorModalOpen,
    setIsSimulatorModalOpen,
    isGuideOpen,
    setIsGuideOpen,
    isShiftEditorOpen,
    setIsShiftEditorOpen,
    activeShiftToEdit,
    activeEmpToEdit,
    openShiftEditor: handleOpenShiftEditor,
    isQuickAddOpen,
    setIsQuickAddOpen,
    isLoading,
    isGenerating,
    isApplyingFix,
    isAutoResolving,
    isResetting,
    isSimulating,
    isSavingShift,
    isSubmittingEntity,
    notification: toasts[toasts.length - 1] || null,
    toasts,
    showToast,
    dismissToast,
    showNotification,
    clearNotification,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    selectedDateFilter,
    setSelectedDateFilter,
    criticalGapsCount,
    // Operations
    fetchData,
    generateRoster: handleGenerateRoster,
    autoResolveAll: handleAutoResolveAll,
    applyFix: handleApplyFix,
    saveShift: handleSaveShift,
    quickUpdateShift: handleQuickUpdateShift,
    addEmployee: handleAddEmployee,
    addBrand: handleAddBrand,
    simulateChange: handleSimulateChange,
    resetSeed: handleResetSeed,
    exportCSV: handleExportCSV,
  };

  return <RosterContext.Provider value={value}>{children}</RosterContext.Provider>;
}

export function useRoster() {
  const context = useContext(RosterContext);
  if (!context) {
    throw new Error('useRoster must be used within a RosterProvider');
  }
  return context;
}

