const mongoose = require('mongoose');

const PodSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  leadName: { type: String, required: true },
  leadEmail: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

const EmployeeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  podId: { type: String, required: true },
  skills: [{ type: String, enum: ['CS', 'ACC', 'NDR', 'Retention'] }],
  assignedBrands: [{
    brandId: { type: String, required: true },
    processes: [{ type: String }],
    isPrimary: { type: Boolean, default: true }
  }],
  weeklyOffQuota: { type: Number, default: 1 }, // 1 or 2 days/week
  preferredOffDays: [{ type: Number }], // 0: Sun, 1: Mon, ... 6: Sat
  maxConsecutiveDays: { type: Number, default: 6 },
  compOffBalance: { type: Number, default: 0 }
}, { timestamps: true });

const ProcessRequirementSchema = new mongoose.Schema({
  processName: { type: String, enum: ['CS', 'ACC', 'NDR', 'Retention'], required: true },
  operatingCalendar: { 
    type: String, 
    enum: ['365_DAYS', 'DAILY_EXCEPT_HOLIDAYS', 'MON_SAT_EXCEPT_HOLIDAYS', 'MON_FRI_EXCEPT_HOLIDAYS'],
    default: 'DAILY_EXCEPT_HOLIDAYS'
  },
  minStaffing: { type: Number, default: 1 }
}, { _id: false });

const BrandSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  podId: { type: String, required: true },
  category: { type: String },
  staffingType: { type: String, enum: ['SINGLE_RESOURCE', 'MULTI_RESOURCE'], default: 'SINGLE_RESOURCE' },
  defaultOperatingCalendar: {
    type: String,
    enum: ['365_DAYS', 'DAILY_EXCEPT_HOLIDAYS', 'MON_SAT_EXCEPT_HOLIDAYS', 'MON_FRI_EXCEPT_HOLIDAYS'],
    default: 'DAILY_EXCEPT_HOLIDAYS'
  },
  processes: [ProcessRequirementSchema],
  assignedEmployeeIds: [{ type: String }]
}, { timestamps: true });

const LeaveSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  startDate: { type: String, required: true }, // YYYY-MM-DD
  endDate: { type: String, required: true },
  type: { type: String, enum: ['PLANNED', 'SICK', 'COMP_OFF'], default: 'PLANNED' },
  status: { type: String, enum: ['APPROVED', 'PENDING', 'REJECTED'], default: 'APPROVED' },
  reason: { type: String }
}, { timestamps: true });

const HolidaySchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  name: { type: String, required: true },
  isMandatoryOff: { type: Boolean, default: true }
}, { timestamps: true });

const ShiftSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  employeeId: { type: String, required: true },
  brandId: { type: String, default: null },
  process: { type: String, default: null },
  status: { type: String, enum: ['WORKING', 'OFF', 'LEAVE', 'HOLIDAY'], required: true },
  isBackup: { type: Boolean, default: false },
  originalEmployeeId: { type: String, default: null },
  notes: { type: String }
}, { _id: false });

const ConflictSchema = new mongoose.Schema({
  id: { type: String, required: true },
  date: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['COVERAGE_GAP', 'INSUFFICIENT_STAFFING', 'UNASSIGNED_PROCESS', 'OVERLAPPING_SHIFT', 'PREFERENCE_VIOLATION'], 
    required: true 
  },
  severity: { type: String, enum: ['CRITICAL', 'WARNING', 'INFO'], default: 'CRITICAL' },
  brandId: { type: String },
  brandName: { type: String },
  process: { type: String },
  employeeId: { type: String },
  employeeName: { type: String },
  description: { type: String, required: true },
  suggestedResolutions: [{
    action: { type: String },
    backupEmployeeId: { type: String },
    backupEmployeeName: { type: String },
    reason: { type: String }
  }]
}, { _id: false });

const RosterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  month: { type: String, required: true }, // YYYY-MM
  status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' },
  generatedAt: { type: Date, default: Date.now },
  shifts: [ShiftSchema],
  conflicts: [ConflictSchema],
  metadata: {
    totalEmployees: { type: Number },
    totalBrands: { type: Number },
    coverageRate: { type: Number }, // percentage
    criticalGapsCount: { type: Number }
  }
}, { timestamps: true });

module.exports = {
  Pod: mongoose.model('Pod', PodSchema),
  Employee: mongoose.model('Employee', EmployeeSchema),
  Brand: mongoose.model('Brand', BrandSchema),
  Leave: mongoose.model('Leave', LeaveSchema),
  Holiday: mongoose.model('Holiday', HolidaySchema),
  Roster: mongoose.model('Roster', RosterSchema)
};

