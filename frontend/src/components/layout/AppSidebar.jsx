import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useRoster } from '../../context/RosterContext';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Building2,
  Layers,
  CalendarOff,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  BarChart3,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Compass,
  X,
} from 'lucide-react';

const ICON_MAP = {
  LayoutDashboard,
  CalendarDays,
  Users,
  Building2,
  Layers,
  CalendarOff,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  BarChart3,
  ShieldAlert,
  Settings,
};

export default function AppSidebar() {
  const {
    activeView,
    setActiveView,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    NAV_SECTIONS,
  } = useNavigation();

  const { criticalGapsCount, resetSeed, isResetting, setIsGuideOpen, isGuideOpen } = useRoster();

  const handleNavClick = (viewId) => {
    setActiveView(viewId);
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0b1329] text-slate-300 border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-[#070d1e]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-950 shrink-0 font-bold tracking-tight text-base">
            <Sparkles className="h-5 w-5" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white whitespace-nowrap">
                  Smart Roster
                </span>
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold uppercase tracking-wider rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Engine
                </span>
              </div>
              <span className="text-[11px] text-slate-400 truncate">Enterprise Operations</span>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden md:flex h-7 w-7 rounded-lg items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            {!isSidebarCollapsed ? (
              <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {section.title}
              </div>
            ) : (
              <div className="h-px bg-slate-800 my-2 mx-1" />
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const IconComponent = ICON_MAP[item.icon] || LayoutDashboard;
                const isActive = activeView === item.id;
                const badgeValue = item.badgeKey === 'criticalGapsCount' ? criticalGapsCount : null;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    title={isSidebarCollapsed ? `${item.label} - ${item.description}` : item.description}
                    className={`group relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-900/50'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <IconComponent
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />

                    {!isSidebarCollapsed && (
                      <div className="flex-1 flex items-center justify-between overflow-hidden">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200">
                            {item.badge}
                          </span>
                        )}
                        {badgeValue !== null && badgeValue > 0 && (
                          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                            {badgeValue}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tooltip for collapsed mode */}
                    {isSidebarCollapsed && (
                      <span className="sr-only">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Guided Tour & Reset Quick Actions */}
        {!isSidebarCollapsed && (
          <div className="pt-2 px-1">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-indigo-400" />
                  Evaluator Tour
                </span>
                <button
                  type="button"
                  onClick={() => setIsGuideOpen(!isGuideOpen)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
                >
                  {isGuideOpen ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Step through 4 core assessment scenarios including the 80% rule & simulator.
              </p>
              <button
                type="button"
                onClick={resetSeed}
                disabled={isResetting}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors border border-slate-700/50 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`h-3 w-3 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? 'Resetting...' : 'Reset to Seed Data'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User / Session Profile Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070d1e]">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="h-8 w-8 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-500/30">
              AR
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#070d1e]" />
          </div>

          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">Alex Rivera</div>
              <div className="text-[11px] text-slate-400 truncate">Operations Director</div>
            </div>
          )}

          {!isSidebarCollapsed && (
            <button
              type="button"
              onClick={() => setActiveView('settings')}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="System Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col transition-all duration-200 z-30 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-200 ease-in-out md:hidden ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}

