import React, { useState, useMemo } from 'react';
import { useRoster } from '../context/RosterContext';
import { useNavigation } from '../context/NavigationContext';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

import {
  Building2,
  Users,
  Search,
  Filter,
  Plus,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Edit3,
  Layers,
  Sparkles,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  Briefcase,
  X,
  Upload,
} from 'lucide-react';

// Deterministic brand colors based on name/id
const BRAND_COLORS = [
  '#4f46e5', // indigo
  '#0284c7', // sky
  '#059669', // emerald
  '#d97706', // amber
  '#dc2626', // rose
  '#7c3aed', // violet
  '#db2777', // pink
  '#0d9488', // teal
  '#ea580c', // orange
  '#475569', // slate
];

export default function CompanyDirectoryView() {
  const {
    brands,
    employees,
    pods,
    roster,
    setIsQuickAddOpen,
    setSelectedEmployeeId,
    setIsConflictDrawerOpen,
  } = useRoster();

  const { setActiveView } = useNavigation();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPodId, setSelectedPodId] = useState('ALL');
  const [staffingFilter, setStaffingFilter] = useState('ALL'); // 'ALL' | 'SINGLE_RESOURCE' | 'MULTI_RESOURCE'
  const [coverageFilter, setCoverageFilter] = useState('ALL'); // 'ALL' | 'GAPS_ONLY' | 'PERFECT_ONLY'
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'TABLE'

  // Selected company for detail / edit modal
  const [selectedBrandForEdit, setSelectedBrandForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Brand color helper
  const getBrandColor = (brand, index) => {
    return brand.color || BRAND_COLORS[index % BRAND_COLORS.length];
  };

  // Calculate coverage and assigned employees for each brand
  const enhancedBrands = useMemo(() => {
    return brands.map((brand, idx) => {
      const assignedStaff = employees.filter((e) =>
        brand.assignedEmployeeIds?.includes(e.id) ||
        e.assignedBrands?.some((ab) => ab.brandId === brand.id)
      );

      const brandPod = pods.find((p) => p.id === brand.podId);
      const brandConflicts = roster?.conflicts?.filter((c) => c.brandId === brand.id) || [];
      const hasGaps = brandConflicts.length > 0;

      // Coverage percentage
      const coverageRate = hasGaps
        ? Math.max(65, 100 - brandConflicts.length * 8)
        : 100;

      return {
        ...brand,
        color: getBrandColor(brand, idx),
        assignedStaff,
        pod: brandPod,
        conflicts: brandConflicts,
        coverageRate,
        hasGaps,
        contactEmail: `ops@${brand.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      };
    });
  }, [brands, employees, pods, roster]);

  // Filtered brand list
  const filteredBrands = useMemo(() => {
    return enhancedBrands.filter((brand) => {
      const matchesSearch =
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPod = selectedPodId === 'ALL' || brand.podId === selectedPodId;
      const matchesStaffing =
        staffingFilter === 'ALL' || brand.staffingType === staffingFilter;

      let matchesCoverage = true;
      if (coverageFilter === 'GAPS_ONLY') {
        matchesCoverage = brand.hasGaps;
      } else if (coverageFilter === 'PERFECT_ONLY') {
        matchesCoverage = !brand.hasGaps;
      }

      return matchesSearch && matchesPod && matchesStaffing && matchesCoverage;
    });
  }, [enhancedBrands, searchTerm, selectedPodId, staffingFilter, coverageFilter]);

  // Metrics
  const singleResourceCount = enhancedBrands.filter((b) => b.staffingType === 'SINGLE_RESOURCE').length;
  const multiResourceCount = enhancedBrands.filter((b) => b.staffingType === 'MULTI_RESOURCE').length;
  const brandsWithGapsCount = enhancedBrands.filter((b) => b.hasGaps).length;

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Client Companies & Brand Directory"
        subtitle="Manage client enterprise accounts, dedicated 80% staffing rules, operating calendars, and assigned staff."
        badge={`${brands.length} Client Accounts`}
        badgeVariant="blue"
        breadcrumbs={[{ label: 'Workspace' }, { label: 'Client Companies' }]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={Layers}
              onClick={() => setActiveView('brand-coverage')}
            >
              View Coverage Matrix
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsQuickAddOpen(true)}
            >
              Add Client Brand
            </Button>
          </>
        }
      />

      {/* 2. Top Summary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Client Accounts
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {brands.length} <span className="text-xs text-slate-500 font-medium">Brands</span>
          </div>
          <span className="text-[11px] text-indigo-600 font-medium block mt-1">
            Across {pods.length} Operational Pods
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Single-Resource Rule
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {singleResourceCount}{' '}
            <span className="text-xs text-amber-700 font-semibold font-mono">
              ({Math.round((singleResourceCount / brands.length) * 100)}%)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            Dedicated primary personnel
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Multi-Resource Accounts
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {multiResourceCount}{' '}
            <span className="text-xs text-sky-700 font-semibold font-mono">
              ({Math.round((multiResourceCount / brands.length) * 100)}%)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            High-volume scale brands
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            SLA Coverage Health
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {brands.length - brandsWithGapsCount}/{brands.length}
          </div>
          <span
            className={`text-[11px] font-semibold block mt-1 ${
              brandsWithGapsCount > 0 ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {brandsWithGapsCount > 0
              ? `${brandsWithGapsCount} brand(s) require backup`
              : '100% full coverage compliance'}
          </span>
        </div>
      </div>

      {/* 3. Filter & View Switcher Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Pod Filter */}
          <select
            value={selectedPodId}
            onChange={(e) => setSelectedPodId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Pods ({pods.length})</option>
            {pods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name.split('(')[0]}
              </option>
            ))}
          </select>

          {/* Staffing Filter */}
          <select
            value={staffingFilter}
            onChange={(e) => setStaffingFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Staffing Models</option>
            <option value="SINGLE_RESOURCE">Single-Resource (80%)</option>
            <option value="MULTI_RESOURCE">Multi-Resource</option>
          </select>

          {/* Quick SLA Status Filter */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCoverageFilter('ALL')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                coverageFilter === 'ALL'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setCoverageFilter('GAPS_ONLY')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                coverageFilter === 'GAPS_ONLY'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              Gaps Only ({brandsWithGapsCount})
            </button>
            <button
              type="button"
              onClick={() => setCoverageFilter('PERFECT_ONLY')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                coverageFilter === 'PERFECT_ONLY'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              100% Covered
            </button>
          </div>
        </div>

        {/* View Mode Switcher (Grid vs Table) */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('GRID')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'GRID'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Grid Card View"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('TABLE')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'TABLE'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Table View"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Company Directory Contents */}
      {filteredBrands.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Companies Found"
          description="No client brand accounts match the selected filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedPodId('ALL');
            setStaffingFilter('ALL');
            setCoverageFilter('ALL');
          }}
        />
      ) : viewMode === 'GRID' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBrands.map((brand) => (
            <Card
              key={brand.id}
              className="overflow-hidden hover:border-slate-300 transition-all flex flex-col justify-between"
              bodyClassName="p-4 space-y-3.5"
            >
              {/* Brand Top Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Initials Logo Avatar */}
                  <div
                    className="h-11 w-11 rounded-xl text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: brand.color }}
                  >
                    {brand.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {brand.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {brand.category || 'D2C Consumer Brand'}
                    </p>
                  </div>
                </div>

                {brand.hasGaps ? (
                  <button
                    type="button"
                    onClick={() => setIsConflictDrawerOpen(true)}
                    className="shrink-0"
                    title={`${brand.conflicts.length} coverage gaps detected`}
                  >
                    <Badge variant="rose" size="xs" withDot>
                      {brand.conflicts.length} Gaps
                    </Badge>
                  </button>
                ) : (
                  <Badge variant="emerald" size="xs" withDot className="shrink-0">
                    100% SLA
                  </Badge>
                )}
              </div>

              {/* Badges: Staffing Model & Operating Calendar */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {brand.staffingType === 'SINGLE_RESOURCE' ? (
                  <Badge variant="amber" size="xs">
                    Single-Resource (80%)
                  </Badge>
                ) : (
                  <Badge variant="blue" size="xs">
                    Multi-Resource
                  </Badge>
                )}

                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {brand.defaultOperatingCalendar.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Processes & Qualifications */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Supported Processes:
                </span>
                <div className="flex flex-wrap gap-1">
                  {brand.processes?.map((proc) => (
                    <span
                      key={proc.processName}
                      className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      {proc.processName} ({proc.minStaffing || 1})
                    </span>
                  ))}
                </div>
              </div>

              {/* Assigned Dedicated Personnel */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Assigned Staff:</span>
                  <span className="text-slate-500 font-medium">
                    {brand.pod ? brand.pod.name.split(' ')[1] : 'Operations'}
                  </span>
                </span>

                <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                  {brand.assignedStaff.length > 0 ? (
                    brand.assignedStaff.map((staff) => (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() => {
                          setSelectedEmployeeId(staff.id);
                          setActiveView('employees');
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-left shrink-0 cursor-pointer"
                        title={`View ${staff.name}`}
                      >
                        <div className="h-5 w-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[9px] flex items-center justify-center">
                          {staff.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-800 truncate max-w-[100px]">
                          {staff.name}
                        </span>
                      </button>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      Covered by Pod Floater Pool
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrandForEdit(brand);
                    setIsEditModalOpen(true);
                  }}
                  className="text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Edit Brand</span>
                </button>

                <Button
                  variant="ghost"
                  size="xs"
                  iconRight={ExternalLink}
                  onClick={() => setActiveView('brand-coverage')}
                >
                  View Matrix
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="p-0 overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="px-4 py-3 min-w-[200px]">Company / Brand</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Operating Pod</th>
                  <th className="px-3 py-3">Staffing Model</th>
                  <th className="px-3 py-3">Operating Calendar</th>
                  <th className="px-3 py-3">Assigned Staff</th>
                  <th className="px-3 py-3 text-center">SLA Health</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Brand Name & Avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-8 w-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs"
                          style={{ backgroundColor: brand.color }}
                        >
                          {brand.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 truncate block">
                            {brand.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {brand.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-3 text-slate-600 font-medium">
                      {brand.category || 'D2C Consumer'}
                    </td>

                    {/* Operating Pod */}
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {brand.pod ? brand.pod.name.split(' ')[1] : 'Operations'}
                      </span>
                    </td>

                    {/* Staffing Model */}
                    <td className="px-3 py-3">
                      {brand.staffingType === 'SINGLE_RESOURCE' ? (
                        <span className="text-amber-800 font-mono font-bold text-[11px]">
                          Single-Resource (80%)
                        </span>
                      ) : (
                        <span className="text-sky-800 font-mono font-bold text-[11px]">
                          Multi-Resource
                        </span>
                      )}
                    </td>

                    {/* Calendar */}
                    <td className="px-3 py-3 text-slate-600 text-[11px]">
                      {brand.defaultOperatingCalendar.replace(/_/g, ' ')}
                    </td>

                    {/* Assigned Personnel */}
                    <td className="px-3 py-3">
                      {brand.assignedStaff.length > 0 ? (
                        <span className="font-semibold text-slate-800">
                          {brand.assignedStaff.map((s) => s.name).join(', ')}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Pod Floaters</span>
                      )}
                    </td>

                    {/* SLA Health */}
                    <td className="px-3 py-3 text-center">
                      {brand.hasGaps ? (
                        <Badge variant="rose" size="xs" withDot>
                          {brand.conflicts.length} Gaps
                        </Badge>
                      ) : (
                        <Badge variant="emerald" size="xs" withDot>
                          100% Covered
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          setSelectedBrandForEdit(brand);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. Edit Company Details Modal */}
      {isEditModalOpen && selectedBrandForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-modal overflow-hidden animate-scale-up">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl text-white font-bold text-sm flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: selectedBrandForEdit.color }}
                >
                  {selectedBrandForEdit.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Edit Brand Profile
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedBrandForEdit.name} ({selectedBrandForEdit.id})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Brand / Company Name
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedBrandForEdit.name}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-slate-600 font-semibold cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Industry / Category
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedBrandForEdit.category}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Operating Calendar
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={selectedBrandForEdit.defaultOperatingCalendar}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-slate-600 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Brand Color Identifier
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    defaultValue={selectedBrandForEdit.color}
                    className="h-8 w-14 rounded border border-slate-200 cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-500">
                    Hex: {selectedBrandForEdit.color}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Upload Company / Brand Logo
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                  <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-slate-600 font-medium">Click to upload SVG or PNG</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Maximum size: 2MB (SVG, PNG, WebP)</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
              >
                Save Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

