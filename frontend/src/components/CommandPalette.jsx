import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRoster } from '../context/RosterContext';
import { useNavigation } from '../context/NavigationContext';
import {
  Search,
  Zap,
  Sparkles,
  CalendarDays,
  Users,
  Building2,
  Layers,
  AlertTriangle,
  BarChart3,
  FileSpreadsheet,
  RotateCcw,
  Sliders,
  CalendarOff,
  ShieldCheck,
  ShieldAlert,
  Settings,
  ArrowRight,
  Clock,
  X,
  CornerDownLeft,
} from 'lucide-react';

export default function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    employees = [],
    brands = [],
    pods = [],
    roster,
    generateRoster,
    autoResolveAll,
    exportCSV,
    resetSeed,
    setIsSimulatorModalOpen,
    setSelectedEmployeeId,
    setSelectedDateFilter,
  } = useRoster();

  const { setActiveView, NAV_SECTIONS } = useNavigation();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('ALL'); // 'ALL' | 'ACTIONS' | 'VIEWS' | 'STAFF' | 'BRANDS' | 'GAPS'
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Global hotkey: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  // Aggregate command items
  const allCommands = useMemo(() => {
    const items = [];

    // 1. Actions
    items.push(
      {
        id: 'act_generate',
        category: 'ACTIONS',
        title: 'Generate Roster',
        subtitle: 'Run deterministic 7-stage constraint solver',
        icon: Sparkles,
        badge: 'Solver',
        badgeVariant: 'indigo',
        action: () => {
          generateRoster();
          setIsCommandPaletteOpen(false);
        },
      },
      {
        id: 'act_autoresolve',
        category: 'ACTIONS',
        title: 'Auto-Resolve All Operational Gaps',
        subtitle: 'Instantly allocate qualified same-pod floater backups',
        icon: Zap,
        badge: 'Automate',
        badgeVariant: 'emerald',
        action: () => {
          autoResolveAll();
          setIsCommandPaletteOpen(false);
        },
      },
      {
        id: 'act_simulate',
        category: 'ACTIONS',
        title: 'Simulate Sudden Absence (What-If)',
        subtitle: 'Test operational resilience on short notice',
        icon: Sliders,
        badge: 'Sec 3-F',
        badgeVariant: 'amber',
        action: () => {
          setIsSimulatorModalOpen(true);
          setIsCommandPaletteOpen(false);
        },
      },
      {
        id: 'act_export',
        category: 'ACTIONS',
        title: 'Export Roster to CSV',
        subtitle: 'Download complete 960-shift schedule report',
        icon: FileSpreadsheet,
        badge: 'Export',
        badgeVariant: 'slate',
        action: () => {
          exportCSV();
          setIsCommandPaletteOpen(false);
        },
      },
      {
        id: 'act_reset',
        category: 'ACTIONS',
        title: 'Reset to Clean Sample Dataset',
        subtitle: 'Restore 32 employees, 14 brands, 3 pods & default leaves',
        icon: RotateCcw,
        badge: 'Admin',
        badgeVariant: 'rose',
        action: () => {
          resetSeed();
          setIsCommandPaletteOpen(false);
        },
      }
    );

    // 2. Navigation Views
    NAV_SECTIONS.forEach((sec) => {
      sec.items.forEach((navItem) => {
        items.push({
          id: `nav_${navItem.id}`,
          category: 'VIEWS',
          title: `Go to ${navItem.label}`,
          subtitle: navItem.description || `${sec.title} view`,
          icon:
            navItem.id === 'overview'
              ? Sparkles
              : navItem.id === 'roster'
              ? CalendarDays
              : navItem.id === 'employees'
              ? Users
              : navItem.id === 'companies'
              ? Building2
              : navItem.id === 'pods'
              ? Layers
              : navItem.id === 'leaves'
              ? CalendarOff
              : navItem.id === 'brand-coverage'
              ? ShieldCheck
              : navItem.id === 'conflicts'
              ? AlertTriangle
              : navItem.id === 'reports'
              ? BarChart3
              : navItem.id === 'roles'
              ? ShieldAlert
              : Settings,
          badge: sec.title,
          badgeVariant: 'slate',
          action: () => {
            setActiveView(navItem.id);
            setIsCommandPaletteOpen(false);
          },
        });
      });
    });

    // 3. Staff Members
    employees.forEach((emp) => {
      const pod = pods.find((p) => p.id === emp.podId);
      const primaryBrand = emp.assignedBrands?.[0]
        ? brands.find((b) => b.id === emp.assignedBrands[0].brandId)
        : null;

      items.push({
        id: `emp_${emp.id}`,
        category: 'STAFF',
        title: emp.name,
        subtitle: `${emp.id} • ${pod ? pod.name.split(' ')[1] : 'Unassigned'} • ${
          primaryBrand ? primaryBrand.name : 'Floater Backup'
        }`,
        icon: Users,
        badge: emp.skills?.join(', ') || 'Staff',
        badgeVariant: 'indigo',
        action: () => {
          setSelectedEmployeeId(emp.id);
          setActiveView('employees');
          setIsCommandPaletteOpen(false);
        },
      });
    });

    // 4. Client Brands
    brands.forEach((brand) => {
      items.push({
        id: `brand_${brand.id}`,
        category: 'BRANDS',
        title: brand.name,
        subtitle: `${brand.category} • ${
          brand.staffingType === 'SINGLE_RESOURCE' ? '1 Agent Dedicated (80%)' : 'Multi-Resource'
        }`,
        icon: Building2,
        badge: brand.staffingType === 'SINGLE_RESOURCE' ? 'Dedicated' : 'Multi',
        badgeVariant: brand.staffingType === 'SINGLE_RESOURCE' ? 'amber' : 'blue',
        action: () => {
          setActiveView('brand-coverage');
          setIsCommandPaletteOpen(false);
        },
      });
    });

    // 5. Active Conflicts
    if (roster?.conflicts) {
      roster.conflicts.forEach((conf) => {
        items.push({
          id: `conf_${conf.id}`,
          category: 'GAPS',
          title: `Gap: ${conf.brandName} (${conf.process || 'CS'})`,
          subtitle: `${conf.date} • ${conf.description}`,
          icon: AlertTriangle,
          badge: 'Critical Gap',
          badgeVariant: 'rose',
          action: () => {
            setSelectedDateFilter(conf.date);
            setActiveView('conflicts');
            setIsCommandPaletteOpen(false);
          },
        });
      });
    }

    return items;
  }, [
    employees,
    brands,
    pods,
    roster,
    generateRoster,
    autoResolveAll,
    exportCSV,
    resetSeed,
    setIsSimulatorModalOpen,
    setSelectedEmployeeId,
    setSelectedDateFilter,
    setActiveView,
    setIsCommandPaletteOpen,
    NAV_SECTIONS,
  ]);

  // Filter commands by active category and search query
  const filteredCommands = useMemo(() => {
    let list = allCommands;
    if (activeCategory !== 'ALL') {
      list = list.filter((item) => item.category === activeCategory);
    }

    if (!query.trim()) {
      return list.slice(0, 30);
    }

    const q = query.toLowerCase().trim();
    return list
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.badge?.toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [allCommands, activeCategory, query]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? Math.max(0, filteredCommands.length - 1) : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4 animate-fade-in"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-200 px-4 flex items-center gap-3">
          <Search className="h-5 w-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, employee name, brand, or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full py-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-300 rounded shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'ACTIONS', label: 'Quick Actions' },
            { id: 'VIEWS', label: 'Pages & Views' },
            { id: 'STAFF', label: `Staff (${employees.length})` },
            { id: 'BRANDS', label: `Brands (${brands.length})` },
            { id: 'GAPS', label: `Gaps (${roster?.conflicts?.length || 0})` },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 text-xs">
          {filteredCommands.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Search className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-700">No matching results found</p>
              <p className="text-xs mt-1">Try searching for an employee name, brand, or action like "generate".</p>
            </div>
          ) : (
            filteredCommands.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const IconComp = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/80 text-indigo-950 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <IconComp className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-xs truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200/70 text-slate-700">
                        {item.badge}
                      </span>
                    )}

                    {isSelected && (
                      <CornerDownLeft className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              Use <kbd className="font-mono bg-white px-1.5 py-0.5 border rounded">↑</kbd>{' '}
              <kbd className="font-mono bg-white px-1.5 py-0.5 border rounded">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="font-mono bg-white px-1.5 py-0.5 border rounded">Enter</kbd> to select
            </span>
            <span>
              <kbd className="font-mono bg-white px-1.5 py-0.5 border rounded">Esc</kbd> to close
            </span>
          </div>

          <span className="font-mono text-slate-400">
            {filteredCommands.length} command(s)
          </span>
        </div>
      </div>
    </div>
  );
}

