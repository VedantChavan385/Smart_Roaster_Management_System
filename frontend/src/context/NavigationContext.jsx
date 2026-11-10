import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext(null);

export const NAV_SECTIONS = [
  {
    title: 'WORKSPACE',
    items: [
      { id: 'overview', label: 'Overview', icon: 'LayoutDashboard', description: 'Executive KPIs & workforce snapshot' },
      { id: 'roster', label: 'Roster & Scheduling', icon: 'CalendarDays', badge: 'Core', description: 'Interactive multi-view shift calendar' },
      { id: 'employees', label: 'Employees', icon: 'Users', description: 'Directory, skills, quotas & history' },
      { id: 'companies', label: 'Client Companies', icon: 'Building2', description: 'Enterprise accounts & dedicated brands' },
      { id: 'pods', label: 'Pods & Teams', icon: 'Layers', description: 'Cross-functional operational clusters' },
      { id: 'leaves', label: 'Attendance & Leaves', icon: 'CalendarOff', description: 'Leave requests, holidays & off-days' },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { id: 'brand-coverage', label: 'Brand Coverage', icon: 'ShieldCheck', description: 'SLA matrix & single-resource monitoring' },
      { id: 'automation', label: 'Roster Automation', icon: 'Cpu', description: 'Constraint solver & what-if simulator' },
      { id: 'conflicts', label: 'Conflicts & Gaps', icon: 'AlertTriangle', badgeKey: 'criticalGapsCount', description: 'Live operational gap detection & 1-click fixes' },
      { id: 'reports', label: 'Reports & Analytics', icon: 'BarChart3', description: 'Workforce utilization & SLA reports' },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { id: 'roles', label: 'Roles & Permissions', icon: 'ShieldAlert', description: 'RBAC, manager access & audit logs' },
      { id: 'settings', label: 'Settings', icon: 'Settings', description: 'Operating calendar & system preferences' },
    ],
  },
];

export function NavigationProvider({ children }) {
  const [activeView, setActiveView] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find active nav metadata for breadcrumbs and title
  const allNavItems = NAV_SECTIONS.flatMap((s) =>
    s.items.map((item) => ({ ...item, section: s.title }))
  );
  const currentNav = allNavItems.find((item) => item.id === activeView) || allNavItems[0];

  const value = {
    activeView,
    setActiveView,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    toggleSidebar: () => setIsSidebarCollapsed((prev) => !prev),
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    searchQuery,
    setSearchQuery,
    currentNav,
    NAV_SECTIONS,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

