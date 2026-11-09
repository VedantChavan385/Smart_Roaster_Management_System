import React, { useState } from 'react';
import { X, Database, Building2, Users, Shield, Calendar, Plus, Check } from 'lucide-react';

export default function EntityManagementModal({ isOpen, onClose, brands, employees, pods, holidays }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('BRANDS');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl h-[650px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Operations Entity & Rule Management</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Inspect and configure operational rules without changing code (Section 3-A)
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/40 px-5 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('BRANDS')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'BRANDS'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Brands ({brands.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('EMPLOYEES')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'EMPLOYEES'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Employees ({employees.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('PODS')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'PODS'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Pods & Leads ({pods.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('HOLIDAYS')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'HOLIDAYS'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
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
                    <div key={brand.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-sm">{brand.name}</span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          brand.staffingType === 'SINGLE_RESOURCE' 
                            ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                            : 'bg-sky-50 text-sky-800 border border-sky-200'
                        }`}>
                          {brand.staffingType === 'SINGLE_RESOURCE' ? '1-Agent (80%)' : 'Multi-Agent (20%)'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        Pod: <span className="text-slate-800 font-semibold">{pod?.name}</span> • Category: <span className="text-slate-800 font-semibold">{brand.category}</span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        Default Calendar: <span className="text-indigo-700 font-mono font-bold">{brand.defaultOperatingCalendar}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {brand.processes.map(p => (
                          <span key={p.processName} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {p.processName} ({p.minStaffing} staff)
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
                        Assigned: <span className="text-slate-800 font-semibold">{assignedStaff.map(s => s.name).join(', ') || 'None'}</span>
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
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3">Employee Name</th>
                    <th className="p-3">Pod</th>
                    <th className="p-3">Skills</th>
                    <th className="p-3">Assigned Brand</th>
                    <th className="p-3">Weekly Off Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {employees.map(emp => {
                    const pod = pods.find(p => p.id === emp.podId);
                    const b = emp.assignedBrands?.[0] ? brands.find(brand => brand.id === emp.assignedBrands[0].brandId) : null;

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{emp.name}</td>
                        <td className="p-3 text-slate-500">{pod ? pod.name.split(' ')[1] : ''}</td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-indigo-700">{emp.skills.join(', ')}</span>
                        </td>
                        <td className="p-3 text-slate-800">
                          {b ? b.name : <span className="text-slate-400 italic">Floater Pool</span>}
                        </td>
                        <td className="p-3 text-slate-500">
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
                <div key={pod.id} className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <span className="text-xs uppercase font-extrabold text-indigo-700 font-mono">{pod.id}</span>
                  <h4 className="font-extrabold text-slate-900 text-sm">{pod.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{pod.description}</p>
                  <div className="border-t border-slate-100 pt-3 text-xs space-y-1">
                    <div><span className="text-slate-500">Pod Lead:</span> <strong className="text-slate-900 font-bold">{pod.leadName}</strong></div>
                    <div><span className="text-slate-500">Email:</span> <span className="text-slate-700">{pod.leadEmail}</span></div>
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
                  <div key={h.date} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{h.name}</div>
                      <div className="text-xs text-indigo-700 font-mono font-semibold mt-0.5">{h.date}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono bg-purple-50 text-purple-700 border border-purple-200">
                      {h.isMandatoryOff ? 'Mandatory Off' : 'Optional Off'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
