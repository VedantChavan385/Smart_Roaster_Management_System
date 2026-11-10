import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Briefcase, ExternalLink, Check } from 'lucide-react';
import Badge from './ui/Badge';
import Button from './ui/Button';

export default function ShiftQuickPopover({
  isOpen,
  onClose,
  shift,
  employee,
  brands = [],
  onQuickUpdate,
  onOpenFullDrawer,
}) {
  if (!isOpen || !shift || !employee) return null;

  const [status, setStatus] = useState(shift.status || 'WORKING');
  const [brandId, setBrandId] = useState(
    shift.brandId || employee.assignedBrands?.[0]?.brandId || ''
  );

  useEffect(() => {
    setStatus(shift.status || 'WORKING');
    setBrandId(shift.brandId || employee.assignedBrands?.[0]?.brandId || '');
  }, [shift, employee]);

  const handleApply = (newStatus, newBrandId = brandId) => {
    onQuickUpdate({
      date: shift.date,
      employeeId: employee.id,
      status: newStatus,
      brandId: newStatus === 'WORKING' ? newBrandId : null,
      process: newStatus === 'WORKING' ? (shift.process || employee.skills?.[0] || 'CS') : null,
      notes: shift.notes || '',
    });
    onClose();
  };

  const d = new Date(shift.date);
  const formattedDate = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      role="dialog"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-4 space-y-3.5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">
              Quick Shift Assignment
            </span>
            <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5 mt-0.5">
              <span>{employee.name}</span>
              <span className="text-xs text-slate-400 font-normal">• {formattedDate}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 1-Click Status Selector */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-700 block">
            Select Shift Status:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              {
                id: 'WORKING',
                label: 'Working (On Duty)',
                styles: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
                activeStyles: 'bg-emerald-600 text-white border-emerald-600 shadow-2xs',
              },
              {
                id: 'WEEKLY_OFF',
                label: 'Weekly Off',
                styles: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200',
                activeStyles: 'bg-slate-800 text-white border-slate-800 shadow-2xs',
              },
              {
                id: 'LEAVE',
                label: 'Approved Leave',
                styles: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100',
                activeStyles: 'bg-amber-600 text-white border-amber-600 shadow-2xs',
              },
              {
                id: 'HOLIDAY',
                label: 'Public Holiday',
                styles: 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100',
                activeStyles: 'bg-purple-600 text-white border-purple-600 shadow-2xs',
              },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setStatus(opt.id);
                  if (opt.id !== 'WORKING') {
                    handleApply(opt.id, null);
                  }
                }}
                className={`py-2 px-2.5 rounded-lg font-bold border transition-all text-center cursor-pointer ${
                  status === opt.id ? opt.activeStyles : opt.styles
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Selector when Working */}
        {status === 'WORKING' && (
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Assigned Client Brand:
            </label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden cursor-pointer"
            >
              <option value="">-- Floater / Backup Pool --</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.staffingType === 'SINGLE_RESOURCE' ? 'Dedicated' : 'Multi'})
                </option>
              ))}
            </select>

            <Button
              variant="primary"
              size="sm"
              className="w-full mt-2"
              onClick={() => handleApply('WORKING', brandId)}
            >
              Confirm Shift Update
            </Button>
          </div>
        )}

        {/* Footer Link to Full Drawer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenFullDrawer) onOpenFullDrawer(shift, employee);
            }}
            className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Open Detailed Drawer</span>
            <ExternalLink className="h-3 w-3" />
          </button>

          <Button variant="secondary" size="xs" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

