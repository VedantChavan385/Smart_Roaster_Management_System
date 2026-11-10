import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Building2, Check, Clock, AlertTriangle } from 'lucide-react';

export default function ShiftEditorModal({
  isOpen,
  onClose,
  shiftData,
  employee,
  brands,
  onSaveShift,
  isSaving
}) {
  if (!isOpen || !shiftData || !employee) return null;

  const [status, setStatus] = useState(shiftData.status || 'WORKING');
  const [brandId, setBrandId] = useState(shiftData.brandId || employee.assignedBrands?.[0]?.brandId || '');
  const [process, setProcess] = useState(shiftData.process || employee.skills?.[0] || 'CS');
  const [notes, setNotes] = useState(shiftData.notes || '');

  useEffect(() => {
    setStatus(shiftData.status || 'WORKING');
    setBrandId(shiftData.brandId || employee.assignedBrands?.[0]?.brandId || '');
    setProcess(shiftData.process || employee.skills?.[0] || 'CS');
    setNotes(shiftData.notes || '');
  }, [shiftData, employee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSaveShift) {
      onSaveShift({
        date: shiftData.date,
        employeeId: employee.id,
        status,
        brandId: status === 'WORKING' ? brandId : null,
        process: status === 'WORKING' ? process : null,
        notes
      });
    }
  };

  const d = new Date(shiftData.date);
  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-sm">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Edit Shift Schedule</h3>
              <p className="text-xs text-slate-500 font-medium">
                {employee.name} • {shiftData.date} ({dayName})
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
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Shift Status
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'WORKING', label: 'Working', color: 'border-emerald-300 text-emerald-800 bg-emerald-50' },
                { id: 'OFF', label: 'Weekly Off', color: 'border-slate-300 text-slate-700 bg-slate-100' },
                { id: 'LEAVE', label: 'Leave', color: 'border-amber-300 text-amber-800 bg-amber-50' },
                { id: 'HOLIDAY', label: 'Holiday', color: 'border-purple-300 text-purple-800 bg-purple-50' }
              ].map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setStatus(opt.id)}
                  className={`py-2 px-1 text-center rounded-lg text-xs font-bold border transition-all ${
                    status === opt.id
                      ? `${opt.color} ring-2 ring-indigo-500/30 font-extrabold shadow-xs`
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {status === 'WORKING' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Assigned Brand Account
                </label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- No Specific Brand (Pod Floater) --</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.staffingType === 'SINGLE_RESOURCE' ? 'Single' : 'Multi'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Assigned Operational Process
                </label>
                <select
                  value={process}
                  onChange={(e) => setProcess(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  {['CS', 'ACC', 'NDR', 'Retention', 'CS + ACC + NDR'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Shift Notes / Context
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Approved leave, peer swap, or emergency backup..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 px-3 py-2 focus:outline-none focus:border-indigo-500 placeholder-slate-400"
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
              disabled={isSaving}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{isSaving ? 'Updating...' : 'Save Shift Change'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

