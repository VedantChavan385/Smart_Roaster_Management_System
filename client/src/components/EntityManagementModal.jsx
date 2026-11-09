import React, { useState } from 'react';
import { X, Database, Building2, Users, Shield, Calendar, Plus, Check } from 'lucide-react';

export default function EntityManagementModal({ isOpen, onClose, brands, employees, pods, holidays }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('BRANDS');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl h-[650px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Operations Entity & Rule Management</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect and configure operational rules without changing code (Section 3-A)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('BRANDS')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'BRANDS'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Brands ({brands.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('EMPLOYEES')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'EMPLOYEES'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Employees ({employees.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('PODS')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'PODS'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Pods & Leads ({pods.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('HOLIDAYS')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'HOLIDAYS'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Holidays ({holidays.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* BRANDS TAB */}
          {activeTab === 'BRANDS' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {brands.map(brand => {
                  const pod = pods.find(p => p.id === brand.podId);
                  const assignedStaff = employees.filter(e => brand.assignedEmployeeIds.includes(e.id));

                  return (
                    <div key={brand.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 text-sm">{brand.name}</span>
                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                          brand.staffingType === 'SINGLE_RESOURCE' 
                            ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {brand.staffingType === 'SINGLE_RESOURCE' ? '1-Agent (80%)' : 'Multi-Agent (20%)'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Pod: <span className="text-slate-300">{pod?.name}</span> • Category: <span className="text-slate-300">{brand.category}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Default Calendar: <span className="text-indigo-400 font-mono">{brand.defaultOperatingCalendar}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {brand.processes.map(p => (
                          <span key={p.processName} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {p.processName} ({p.minStaffing} staff)
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-slate-400 pt-1 border-t border-slate-850">
                        Assigned: <span className="text-slate-200">{assignedStaff.map(s => s.name).join(', ') || 'None'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EMPLOYEES TAB */}
          {activeTab === 'EMPLOYEES' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Employee Name</th>
                    <th className="p-3">Pod</th>
                    <th className="p-3">Skills</th>
                    <th className="p-3">Assigned Brand</th>
                    <th className="p-3">Weekly Off Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {employees.map(emp => {
                    const pod = pods.find(p => p.id === emp.podId);
                    const b = emp.assignedBrands?.[0] ? brands.find(brand => brand.id === emp.assignedBrands[0].brandId) : null;

                    return (
                      <tr key={emp.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-medium text-slate-100">{emp.name}</td>
                        <td className="p-3 text-slate-400">{pod ? pod.name.split(' ')[1] : ''}</td>
                        <td className="p-3">
                          <span className="font-mono text-indigo-400">{emp.skills.join(', ')}</span>
                        </td>
                        <td className="p-3 text-slate-300">
                          {b ? b.name : <span className="text-slate-500 italic">Floater Pool</span>}
                        </td>
                        <td className="p-3 text-slate-400">
                          {emp.weeklyOffQuota} Day/wk (Pref: {emp.preferredOffDays?.join(', ') || 'Sun'})
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* PODS TAB */}
          {activeTab === 'PODS' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pods.map(pod => (
                <div key={pod.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="text-xs uppercase font-bold text-indigo-400 font-mono">{pod.id}</span>
                  <h4 className="font-bold text-slate-100 text-sm">{pod.name}</h4>
                  <p className="text-xs text-slate-400">{pod.description}</p>
                  <div className="border-t border-slate-800 pt-3 text-xs space-y-1">
                    <div><span className="text-slate-400">Pod Lead:</span> <strong className="text-slate-200">{pod.leadName}</strong></div>
                    <div><span className="text-slate-400">Email:</span> <span className="text-slate-300">{pod.leadEmail}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* HOLIDAYS TAB */}
          {activeTab === 'HOLIDAYS' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {holidays.map(h => (
                  <div key={h.date} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-100 text-sm">{h.name}</div>
                      <div className="text-xs text-indigo-400 font-mono mt-0.5">{h.date}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-purple-950 text-purple-300 border border-purple-800">
                      {h.isMandatoryOff ? 'Mandatory Off' : 'Optional Off'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

