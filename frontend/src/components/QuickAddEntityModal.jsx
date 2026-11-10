import React, { useState } from 'react';
import { X, UserPlus, Building2, Plus, Check } from 'lucide-react';

export default function QuickAddEntityModal({
  isOpen,
  onClose,
  pods,
  brands,
  onAddEmployee,
  onAddBrand,
  isSubmitting
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('EMPLOYEE');

  // Employee Form State
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPodId, setEmpPodId] = useState(pods[0]?.id || 'pod_alpha');
  const [empSkills, setEmpSkills] = useState(['CS']);
  const [empWeeklyOff, setEmpWeeklyOff] = useState(1);
  const [empBrandId, setEmpBrandId] = useState('');

  // Brand Form State
  const [brandName, setBrandName] = useState('');
  const [brandCategory, setBrandCategory] = useState('D2C Retail');
  const [brandPodId, setBrandPodId] = useState(pods[0]?.id || 'pod_alpha');
  const [brandStaffing, setBrandStaffing] = useState('SINGLE_RESOURCE');
  const [brandCalendar, setBrandCalendar] = useState('DAILY_EXCEPT_HOLIDAYS');

  const handleToggleSkill = (skill) => {
    if (empSkills.includes(skill)) {
      if (empSkills.length > 1) {
        setEmpSkills(empSkills.filter(s => s !== skill));
      }
    } else {
      setEmpSkills([...empSkills, skill]);
    }
  };

  const handleEmployeeSubmit = (e) => {
    e.preventDefault();
    if (!empName.trim()) return;

    if (onAddEmployee) {
      onAddEmployee({
        name: empName.trim(),
        email: empEmail.trim() || `${empName.toLowerCase().replace(/\s+/g, '.')}@datastraw.io`,
        podId: empPodId,
        skills: empSkills,
        weeklyOffQuota: parseInt(empWeeklyOff, 10) || 1,
        brandId: empBrandId || null
      });
    }
  };

  const handleBrandSubmit = (e) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    if (onAddBrand) {
      onAddBrand({
        name: brandName.trim(),
        category: brandCategory,
        podId: brandPodId,
        staffingType: brandStaffing,
        defaultOperatingCalendar: brandCalendar,
        processes: [
          { processName: 'CS', operatingCalendar: brandCalendar, minStaffing: 1 },
          { processName: 'ACC', operatingCalendar: brandCalendar, minStaffing: 1 }
        ]
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
              {activeTab === 'EMPLOYEE' ? <UserPlus className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {activeTab === 'EMPLOYEE' ? 'Add New Employee' : 'Add New Brand Account'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Dynamic Operations Management (Section 3-A)
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/40 px-5 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('EMPLOYEE')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'EMPLOYEE'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>+ Add Employee</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('BRAND')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'BRAND'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>+ Add D2C Brand</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5">
          {activeTab === 'EMPLOYEE' ? (
            <form onSubmit={handleEmployeeSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ishan Verma"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Operational Pod *</label>
                  <select
                    value={empPodId}
                    onChange={(e) => setEmpPodId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 px-3 py-2 focus:outline-none focus:border-indigo-500"
                  >
                    {pods.map(p => (
                      <option key={p.id} value={p.id}>{p.name.split('(')[0]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Weekly Off Quota</label>
                  <select
                    value={empWeeklyOff}
                    onChange={(e) => setEmpWeeklyOff(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 px-3 py-2 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="1">1 Day per week</option>
                    <option value="2">2 Days per week</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Qualified Skills (Processes)</label>
                <div className="flex flex-wrap gap-2">
                  {['CS', 'ACC', 'NDR', 'Retention'].map(skill => {
                    const isChecked = empSkills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => handleToggleSkill(skill)}
                        className={`px-3 py-1 rounded-md text-xs font-bold border transition-all ${
                          isChecked
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-500/20'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isChecked ? `✓ ${skill}` : skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Primary Brand Assignment</label>
                <select
                  value={empBrandId}
                  onChange={(e) => setEmpBrandId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Floater / Backup Pool (Unassigned) --</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

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
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? 'Adding...' : 'Add Employee'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleBrandSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BlueSky Organic Teas"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 px-3 py-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Operational Pod *</label>
                  <select
                    value={brandPodId}
                    onChange={(e) => setBrandPodId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 px-3 py-2 focus:outline-none focus:border-indigo-500"
                  >
                    {pods.map(p => (
                      <option key={p.id} value={p.id}>{p.name.split('(')[0]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Staffing Model *</label>
                  <select
                    value={brandStaffing}
                    onChange={(e) => setBrandStaffing(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 px-3 py-2 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="SINGLE_RESOURCE">Single Resource (1 dedicated agent)</option>
                    <option value="MULTI_RESOURCE">Multi Resource (2–3 agents)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Operating Calendar Rule</label>
                <select
                  value={brandCalendar}
                  onChange={(e) => setBrandCalendar(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="365_DAYS">365 Days (Sundays & Holidays Working)</option>
                  <option value="DAILY_EXCEPT_HOLIDAYS">Daily Operations (Public Holidays Off)</option>
                  <option value="MON_SAT_EXCEPT_HOLIDAYS">Mon–Sat Operations (Sundays & Holidays Off)</option>
                  <option value="MON_FRI_EXCEPT_HOLIDAYS">Mon–Fri Operations (Weekends Off)</option>
                </select>
              </div>

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
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? 'Adding...' : 'Add Brand'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

