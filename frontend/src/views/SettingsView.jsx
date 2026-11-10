import React from 'react';
import { useRoster } from '../context/RosterContext';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

import {
  Settings,
  RotateCcw,
  Sliders,
  Shield,
  Clock,
  Database,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function SettingsView() {
  const {
    month,
    resetSeed,
    isResetting,
    brands,
    employees,
    pods,
  } = useRoster();

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings & Operational Preferences"
        subtitle="Configure solver scheduling parameters, database state, operating calendars, and organizational rules."
        badge="Enterprise Config"
        badgeVariant="indigo"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Settings' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Solver Configuration */}
        <Card
          title="Engine Solver Parameters"
          subtitle="Deterministic multi-objective constraint weights"
        >
          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-semibold">Single-Resource Brand Dedication:</span>
              <Badge variant="amber" size="xs">
                Weight: Mandatory (100)
              </Badge>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-semibold">Weekly Off Quota Guarantee:</span>
              <Badge variant="emerald" size="xs">
                Weight: Hard (90)
              </Badge>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-semibold">Max Consecutive Days Limit (6):</span>
              <Badge variant="indigo" size="xs">
                Weight: Hard (90)
              </Badge>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-semibold">Pod Floater Affinity Matching:</span>
              <Badge variant="blue" size="xs">
                Weight: Soft (75)
              </Badge>
            </div>
          </div>
        </Card>

        {/* Card 2: Database State & Reset */}
        <Card
          title="Data Management & State"
          subtitle="Local cache and seed data synchronization"
          actions={
            <Button
              variant="outline"
              size="xs"
              icon={RotateCcw}
              onClick={resetSeed}
              isLoading={isResetting}
            >
              Reset Database
            </Button>
          }
        >
          <div className="space-y-3 text-xs text-slate-600">
            <p>
              The system is loaded with realistic operational data including <strong>{employees.length} employees</strong>, <strong>{brands.length} D2C brands</strong>, and <strong>{pods.length} pods</strong>.
            </p>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span>Active Period:</span>
                <span className="font-bold text-slate-900">{month}</span>
              </div>
              <div className="flex justify-between">
                <span>Storage Provider:</span>
                <span className="font-semibold text-emerald-700">MongoDB Atlas / In-Memory Cache</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

