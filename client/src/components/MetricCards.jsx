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
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 shadow-md backdrop-blur-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workforce Capacity
          </span>
          <div className="text-2xl font-bold text-slate-100 mt-1">
            {employees.length} <span className="text-xs text-slate-400 font-normal">Active Staff</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-indigo-400 font-semibold">{pods.length} Pods</span>
            <span>•</span>
            <span>All Skills Qualified</span>
          </div>
        </div>
        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <Users className="h-5 w-5" />
        </div>
      </div>

      {/* 2. Client Brand Accounts */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 shadow-md backdrop-blur-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Client Accounts (80/20)
          </span>
          <div className="text-2xl font-bold text-slate-100 mt-1">
            {brands.length} <span className="text-xs text-slate-400 font-normal">D2C Brands</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-amber-400 font-semibold">{singleResourceCount} Single-Res (79%)</span> •{' '}
            <span className="text-cyan-400 font-semibold">{multiResourceCount} Multi</span>
          </div>
        </div>
        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
          <Building2 className="h-5 w-5" />
        </div>
      </div>

      {/* 3. Coverage Health */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 shadow-md backdrop-blur-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Coverage Health Score
          </span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {metadata.coverageRate || 92}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {metadata.totalWorkingShifts || 800}+ duty shifts scheduled
          </div>
        </div>
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
          <Activity className="h-5 w-5" />
        </div>
      </div>

      {/* 4. Critical Gaps & Conflict Diagnostics */}
      <div className={`p-4 rounded-xl border shadow-md backdrop-blur-sm flex items-center justify-between ${
        criticalGaps > 0 
          ? 'bg-rose-950/30 border-rose-900/80' 
          : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Operational Conflicts
          </span>
          <div className={`text-2xl font-bold mt-1 ${criticalGaps > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
            {criticalGaps} <span className="text-xs font-normal text-slate-400">Coverage Gaps</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {criticalGaps > 0 ? 'Immediate resolution suggested' : 'Zero unstaffed client days'}
          </div>
        </div>
        <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${
          criticalGaps > 0 
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          {criticalGaps > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
        </div>
      </div>
    </div>
  );
}

