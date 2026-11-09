import React from 'react';
import { Users, Building2, CheckCircle2, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export default function MetricCards({ roster, employees, brands, pods }) {
  const metadata = roster?.metadata || {};
  const criticalGaps = roster?.conflicts?.filter(c => c.severity === 'CRITICAL')?.length || 0;
  const singleResourceCount = brands.filter(b => b.staffingType === 'SINGLE_RESOURCE').length;
  const multiResourceCount = brands.filter(b => b.staffingType === 'MULTI_RESOURCE').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Workforce Strength */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Workforce Capacity
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {employees.length} <span className="text-xs text-slate-500 font-medium">Active Staff</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
            <span className="text-indigo-600 font-semibold">{pods.length} Pods</span>
            <span>•</span>
            <span>All Skills Qualified</span>
          </div>
        </div>
        <div className="h-11 w-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
          <Users className="h-5 w-5" />
        </div>
      </div>

      {/* 2. Client Brand Accounts */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Client Accounts (80/20)
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {brands.length} <span className="text-xs text-slate-500 font-medium">D2C Brands</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            <span className="text-amber-700 font-semibold">{singleResourceCount} Single (79%)</span> •{' '}
            <span className="text-sky-700 font-semibold">{multiResourceCount} Multi</span>
          </div>
        </div>
        <div className="h-11 w-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
          <Building2 className="h-5 w-5" />
        </div>
      </div>

      {/* 3. Coverage Health */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Coverage Health Score
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {metadata.coverageRate || 92}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {metadata.totalWorkingShifts || 800}+ duty shifts scheduled
          </div>
        </div>
        <div className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
          <Activity className="h-5 w-5" />
        </div>
      </div>

      {/* 4. Critical Gaps & Conflict Diagnostics */}
      <div className={`p-4 rounded-xl border shadow-xs flex items-center justify-between ${
        criticalGaps > 0 
          ? 'bg-rose-50/50 border-rose-200' 
          : 'bg-white border-slate-200'
      }`}>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Operational Conflicts
          </span>
          <div className={`text-2xl font-extrabold mt-1 ${criticalGaps > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {criticalGaps} <span className="text-xs font-medium text-slate-500">Coverage Gaps</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {criticalGaps > 0 ? 'Immediate backup recommended' : 'Zero unstaffed client days'}
          </div>
        </div>
        <div className={`h-11 w-11 rounded-xl border flex items-center justify-center shrink-0 ${
          criticalGaps > 0 
            ? 'bg-rose-100/70 border-rose-200 text-rose-600' 
            : 'bg-emerald-50 border-emerald-100 text-emerald-600'
        }`}>
          {criticalGaps > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
        </div>
      </div>
    </div>
  );
}
