import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useRoster } from '../../context/RosterContext';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Dropdown from '../ui/Dropdown';
import {
  Menu,
  Search,
  Calendar,
  Zap,
  Plus,
  AlertTriangle,
  Bell,
  Compass,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  Settings,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

export default function AppHeader() {
  const {
    currentNav,
    setIsMobileSidebarOpen,
    searchQuery,
    setSearchQuery,
    setActiveView,
  } = useNavigation();

  const {
    month,
    setMonth,
    criticalGapsCount,
    isGenerating,
    generateRoster,
    isAutoResolving,
    autoResolveAll,
    setIsQuickAddOpen,
    setIsConflictDrawerOpen,
    setIsGuideOpen,
    isGuideOpen,
    exportCSV,
    resetSeed,
  } = useRoster();

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const monthsList = [
    { label: 'November 2026', value: '2026-11' },
    { label: 'December 2026', value: '2026-12' },
    { label: 'January 2027', value: '2027-01' },
  ];

  const userMenuItems = [
    {
      label: 'Alex Rivera',
      description: 'Operations Director (Admin)',
      icon: Sparkles,
      onClick: () => {},
    },
    { divider: true },
    {
      label: 'System Settings',
      icon: Settings,
      onClick: () => setActiveView('settings'),
    },
    {
      label: 'Evaluator Guided Tour',
      icon: Compass,
      onClick: () => setIsGuideOpen(true),
    },
    {
      label: 'Export Roster (CSV)',
      icon: FileSpreadsheet,
      onClick: exportCSV,
    },
    {
      label: 'Reset Sample Dataset',
      icon: RotateCcw,
      onClick: resetSeed,
    },
    { divider: true },
    {
      label: 'Documentation & Spec',
      icon: HelpCircle,
      onClick: () => window.open('https://github.com', '_blank'),
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile hamburger & Context breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Open Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
            {currentNav.section}
          </span>
          <span className="hidden sm:inline text-slate-300">/</span>
          <span className="text-sm font-bold text-slate-900 truncate">
            {currentNav.label}
          </span>

          <Badge variant="emerald" size="xs" withDot className="hidden lg:inline-flex ml-1.5">
            Solver Online
          </Badge>
        </div>
      </div>

      {/* Middle: Global Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search employees, brands, pods, shifts... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`w-full h-9 pl-9 pr-12 text-xs bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder:text-slate-500 rounded-lg border transition-all outline-hidden ${
              isSearchFocused
                ? 'border-indigo-500 ring-2 ring-indigo-500/10'
                : 'border-slate-200'
            }`}
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-slate-200/60 border border-slate-300/80 rounded shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions, Month Switcher, Tour Pill, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Month Selector Pill */}
        <div className="relative">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="appearance-none h-9 pl-8 pr-7 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs transition-colors"
          >
            {monthsList.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <Calendar className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Conflict Gaps Pill */}
        {criticalGapsCount > 0 ? (
          <button
            type="button"
            onClick={() => setIsConflictDrawerOpen(true)}
            className="h-9 flex items-center gap-1.5 px-3 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer animate-pulse"
            title={`${criticalGapsCount} critical coverage gaps detected`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span>{criticalGapsCount} Gaps</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsConflictDrawerOpen(true)}
            className="h-9 hidden sm:flex items-center gap-1.5 px-3 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
          >
            <span>0 Gaps</span>
          </button>
        )}

        {/* Auto-Resolve Quick Action */}
        <Button
          variant="success"
          size="sm"
          icon={Zap}
          onClick={autoResolveAll}
          isLoading={isAutoResolving}
          className="hidden sm:inline-flex h-9"
          title="Automatically resolve all coverage gaps with optimal pod backups"
        >
          Auto-Resolve
        </Button>

        {/* Quick Add Entity Action */}
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsQuickAddOpen(true)}
          className="h-9"
          title="Quick onboard new employee or client brand"
        >
          <span className="hidden sm:inline">Add Entity</span>
        </Button>

        {/* Notifications Icon */}
        <button
          type="button"
          onClick={() => setIsConflictDrawerOpen(true)}
          className="relative h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Operational Notifications"
        >
          <Bell className="h-4 w-4" />
          {criticalGapsCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>

        {/* User Profile Dropdown */}
        <Dropdown
          trigger={
            <button
              type="button"
              className="h-9 flex items-center gap-2 pl-1 pr-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
            >
              <div className="h-7 w-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                AR
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
            </button>
          }
          items={userMenuItems}
          align="right"
        />
      </div>
    </header>
  );
}
