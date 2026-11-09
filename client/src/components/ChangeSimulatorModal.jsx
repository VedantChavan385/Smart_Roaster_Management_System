import React, { useState } from 'react';
import { X, Sparkles, AlertOctagon, UserMinus, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ChangeSimulatorModal({ isOpen, onClose, employees, brands, month, onSimulate, isSimulating }) {
  if (!isOpen) return null;

  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 'emp_01');
  const [targetDate, setTargetDate] = useState('2026-11-18');
  const [changeType, setChangeType] = useState('SICK_LEAVE');
  const [reason, setReason] = useState('Sudden medical emergency / viral fever');

  const selectedEmp = employees.find(e => e.id === selectedEmpId);
  const primaryBrand = selectedEmp?.assignedBrands?.[0] 
    ? brands.find(b => b.id === selectedEmp.assignedBrands[0].brandId) 
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSimulate) {
      onSimulate({
        month,
        employeeId: selectedEmpId,
        date: targetDate,
        changeType,
        reason
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Roster "What-If" Change Simulator</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Simulate post-generation leaves & evaluate real-time coverage impact
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-900 leading-relaxed font-medium">
            <strong>Demonstrates Section 3-F requirement:</strong> Test how the engine flags sudden gaps without rebuilding the entire roster manually, and verifies whether peers or pod floaters can maintain required client coverage.
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Select Unavailable Employee
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 px-3 py-2 focus:outline-none focus:border-indigo-500 font-semibold"
            >
              {employees.map(emp => {
                const b = emp.assignedBrands?.[0] ? brands.find(brand => brand.id === emp.assignedBrands[0].brandId) : null;
                return (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — {b ? `${b.name} (${b.staffingType === 'SINGLE_RESOURCE' ? 'Sole Resource' : 'Multi'})` : 'Floater Pool'}
                  </option>
                );
              })}
            </select>
          </div>

          {primaryBrand && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 font-medium">Assigned Client:</span>{' '}
                <span className="font-bold text-slate-900">{primaryBrand.name}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                primaryBrand.staffingType === 'SINGLE_RESOURCE' 
                  ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                  : 'bg-sky-50 text-sky-800 border border-sky-200'
              }`}>
                {primaryBrand.staffingType === 'SINGLE_RESOURCE' ? '⚠️ High Impact (Single Resource)' : 'Moderate Impact'}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Absence Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 px-3 py-2 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Change Event Type
              </label>
              <select
                value={changeType}
                onChange={(e) => setChangeType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 px-3 py-2 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="SICK_LEAVE">Sudden Sick Leave</option>
                <option value="EMERGENCY_LEAVE">Emergency Personal Leave</option>
                <option value="CLIENT_RULE_CHANGE">Brand Requirement Surge</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Reason / Operational Context
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Sudden medical illness, unexpected transit delay..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSimulating}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <span>{isSimulating ? 'Simulating...' : 'Run Simulation & Recalculate'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
