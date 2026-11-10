import React from 'react';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Lock,
  Key,
} from 'lucide-react';

export default function RolesPermissionsView() {
  const roles = [
    {
      role: 'Operations Director (Admin)',
      badge: 'Full Access',
      badgeVariant: 'indigo',
      description: 'Global access across all pods, brands, roster generation, and simulator.',
      permissions: ['Generate Rosters', 'Auto-Resolve Gaps', 'Manage Employees', 'Manage Brands', 'Change Simulator', 'System Settings'],
    },
    {
      role: 'Pod Manager / Lead',
      badge: 'Pod Scope',
      badgeVariant: 'purple',
      description: 'Manages assigned operational pod, shift overrides, floater allocations, and leave approvals.',
      permissions: ['View Pod Rosters', 'Edit Shifts in Pod', 'Assign Pod Floaters', 'Review Conflicts'],
    },
    {
      role: 'Operations Agent',
      badge: 'Self Scope',
      badgeVariant: 'slate',
      description: 'View individual duty schedule, request planned leaves, and track weekly off allocations.',
      permissions: ['View Personal Schedule', 'Submit Leave Requests', 'View Shift Details'],
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Operational Permissions"
        subtitle="Role-Based Access Control (RBAC) matrix, manager scopes, and security policy rules."
        badge="RBAC Active"
        badgeVariant="purple"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Roles & Permissions' }]}
      />

      <div className="space-y-4">
        {roles.map((r, idx) => (
          <Card key={idx} className="p-4" bodyClassName="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{r.role}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
              </div>
              <Badge variant={r.badgeVariant} size="sm">
                {r.badge}
              </Badge>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
              {r.permissions.map((p, pIdx) => (
                <span
                  key={pIdx}
                  className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                >
                  ✓ {p}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

