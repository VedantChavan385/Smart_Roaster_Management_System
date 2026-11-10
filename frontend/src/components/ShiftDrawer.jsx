import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Building2,
  Clock,
  Award,
  ShieldCheck,
  Zap,
  Check,
  AlertCircle,
  Briefcase,
  Layers,
} from 'lucide-react';
import Button from './ui/Button';
import Badge from './ui/Badge';

export default function ShiftDrawer({
  isOpen,
  onClose,
  shiftData,
  employee,
  brands = [],
  pods = [],
  onSaveShift,
  isSaving = false,
}) {
  if (!isOpen || !shiftData || !employee) return null;

  const [status, setStatus] = useState(shiftData.status || 'WORKING');
  const [brandId, setBrandId] = useState(
    shiftData.brandId || employee.assignedBrands?.[0]?.brandId || ''
  );
  const [process, setProcess] = useState(
    shiftData.process || employee.skills?.[0] || 'CS'
  );
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
        notes,
      });
    }
  };

  const d = new Date(shiftData.date);
  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const empPod = pods.find((p) => p.id === employee.podId);
  const selectedBrand = brands.find((b) => b.id === brandId);
  const primaryBrand = employee.assignedBrands?.[0]
    ? brands.find((b) => b.id === employee.assignedBrands[0].brandId)
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
      />

      {/* Right-Side Slide-Over Drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200/90 shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-in-right">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
              {employee.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {employee.name}
                </h3>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                  {employee.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {empPod ? empPod.name : 'Operations Pod'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
            title="Close drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
          {/* Shift Details & Timing Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-slate-900 font-semibold">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-indigo-600" />
                {formattedDate} ({dayName})
              </span>
              <Badge variant="indigo" size="xs">
                {shiftData.date}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/60">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Shift Timings
              </span>
              <span className="font-semibold text-slate-800">
                09:00 AM – 06:00 PM IST (Standard 9h)
              </span>
            </div>
          </div>

          {/* Employee Qualifications & Availability Snapshot */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Agent Qualifications & Pod Context
            </label>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500">Skills & Badges:</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {employee.skills?.map((s) => (
                    <Badge key={s} variant="slate" size="xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Primary Assignment:</span>
                <span className="font-semibold text-slate-800">
                  {primaryBrand ? primaryBrand.name : 'Floater / Backup Pool'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Weekly Off Quota:</span>
                <span className="font-semibold text-emerald-700">
                  {employee.weeklyOffQuota || 1} Day / Week
                </span>
              </div>
            </div>
          </div>

          {/* Shift Update / Reassignment Form */}
          <form id="shift-drawer-form" onSubmit={handleSubmit} className="space-y-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Update Status & Shift Allocation
            </label>

            {/* Status Selector */}
            <div className="space-y-1.5">
              <span className="font-semibold text-slate-700">Shift Status:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'WORKING', label: 'Working (On Duty)', color: 'border-emerald-300 text-emerald-800 bg-emerald-50' },
                  { id: 'WEEKLY_OFF', label: 'Weekly Off', color: 'border-slate-300 text-slate-700 bg-slate-100' },
                  { id: 'LEAVE', label: 'Approved Leave', color: 'border-amber-300 text-amber-800 bg-amber-50' },
                  { id: 'HOLIDAY', label: 'Public Holiday', color: 'border-purple-300 text-purple-800 bg-purple-50' },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setStatus(opt.id)}
                    className={`py-2 px-2 text-center rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      status === opt.id
                        ? `${opt.color} ring-2 ring-indigo-500/30 font-extrabold shadow-2xs`
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* When Status is WORKING, show Brand & Process selector */}
            {status === 'WORKING' && (
              <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3">
                {/* Brand Selector */}
                <div>
                  <label htmlFor="shift-assigned-brand" className="font-semibold text-slate-800 block mb-1">
                    Assigned Client Brand:
                  </label>
                  <select
                    id="shift-assigned-brand"
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  >
                    <option value="">-- Unassigned / Floater --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.staffingType === 'SINGLE_RESOURCE' ? 'Dedicated' : 'Multi-Staff'})
                      </option>
                    ))}
                  </select>
                  {selectedBrand && (
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Briefcase className="h-3 w-3 text-slate-400" />
                      <span>{selectedBrand.category}</span>
                      <span>•</span>
                      <span className="font-mono text-indigo-700 font-semibold">
                        {selectedBrand.defaultOperatingCalendar}
                      </span>
                    </div>
                  )}
                </div>

                {/* Process Selector */}
                <div>
                  <label htmlFor="shift-process-role" className="font-semibold text-slate-800 block mb-1">
                    Process / Role:
                  </label>
                  <select
                    id="shift-process-role"
                    value={process}
                    onChange={(e) => setProcess(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  >
                    {employee.skills?.map((s) => (
                      <option key={s} value={s}>
                        {s} (Qualified)
                      </option>
                    ))}
                    {!employee.skills?.includes('CS') && <option value="CS">CS (Customer Support)</option>}
                    {!employee.skills?.includes('ACC') && <option value="ACC">ACC (Account Mgmt)</option>}
                    {!employee.skills?.includes('NDR') && <option value="NDR">NDR (Non-Delivery Reports)</option>}
                    {!employee.skills?.includes('Retention') && <option value="Retention">Retention</option>}
                  </select>
                </div>
              </div>
            )}

            {/* Manager Shift Notes */}
            <div>
              <label htmlFor="shift-manager-notes" className="font-semibold text-slate-700 block mb-1">
                Operational Notes:
              </label>
              <textarea
                id="shift-manager-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Swapped with floater, approved emergency coverage..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>
          </form>
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5 shrink-0">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>

          <Button
            type="submit"
            form="shift-drawer-form"
            variant="primary"
            size="sm"
            isLoading={isSaving}
            icon={Check}
          >
            {isSaving ? 'Saving Changes...' : 'Save Shift'}
          </Button>
        </div>
      </aside>
    </>
  );
}
