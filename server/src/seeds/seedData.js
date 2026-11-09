/**
 * Realistic seed data strictly matching the DataStraw assessment specification:
 * - 32 Employees
 * - 3 Operational Pods with Pod Leads
 * - 14 D2C Brands (11 single-resource (~80%), 3 multi-resource (~20%))
 * - Real processes: CS, ACC, NDR, Retention
 * - Varied Operating Calendars (365 Days, Daily except holidays, Mon-Sat, Mon-Fri)
 * - Realistic Leaves & Indian / Global Public Holidays
 */

const pods = [
  {
    id: 'pod_alpha',
    name: 'Pod Alpha (Personal Care & Beauty)',
    leadName: 'Vikramaditya Rao',
    leadEmail: 'vikram.rao@datastraw-cx.internal',
    description: 'High-touch beauty, cosmetics, and wellness D2C operations.'
  },
  {
    id: 'pod_beta',
    name: 'Pod Beta (Apparel & Lifestyle)',
    leadName: 'Pooja Bhattacharya',
    leadEmail: 'pooja.b@datastraw-cx.internal',
    description: 'High-volume fashion, footwear, and apparel accounts.'
  },
  {
    id: 'pod_gamma',
    name: 'Pod Gamma (Electronics, Home & Fitness)',
    leadName: 'Sameer Deshmukh',
    leadEmail: 'sameer.d@datastraw-cx.internal',
    description: 'Technical support, high-ticket home & fitness hardware D2C brands.'
  }
];

const holidays = [
  { date: '2026-11-01', name: 'Karnataka Rajyotsava', isMandatoryOff: false },
  { date: '2026-11-08', name: 'Diwali (Deepavali)', isMandatoryOff: true },
  { date: '2026-11-09', name: 'Govardhan Puja', isMandatoryOff: true },
  { date: '2026-11-24', name: 'Guru Nanak Jayanti', isMandatoryOff: true }
];

const brands = [
  // --- POD ALPHA: 4 Single-Resource Brands + 1 Multi-Resource Brand ---
  {
    id: 'brand_glowskin',
    name: 'GlowSkin Organics',
    podId: 'pod_alpha',
    category: 'Beauty & Skincare',
    staffingType: 'SINGLE_RESOURCE',
    defaultOperatingCalendar: '365_DAYS',
    processes: [
      { processName: 'CS', operatingCalendar: '365_DAYS', minStaffing: 1 },
      { processName: 'ACC', operatingCalendar: 'DAILY_EXCEPT_HOLIDAYS', minStaffing: 1 },
      { processName: 'NDR', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minStaffing: 1 }
    ],
    assignedEmployeeIds: ['emp_01']
  },
  {
    id: 'brand_zenaura',
    name: 'ZenAura Botanicals',
    podId: 'pod_alpha',
    category: 'Wellness & Ayurveda',
    staffingType: 'SINGLE_RESOURCE',
    defaultOperatingCalendar: 'DAILY_EXCEPT_HOLIDAYS',
    processes: [
      { processName: 'CS', operatingCalendar: 'DAILY_EXCEPT_HOLIDAYS', minStaffing: 1 },
      { processName: 'Retention', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minStaffing: 1 }
    ],
    assignedEmployeeIds: ['emp_02']
  },
  {
    id: 'brand_beancraft',
    name: 'BeanCraft Coffee',
    podId: 'pod_alpha',
    category: 'Artisanal Beverage',
    staffingType: 'SINGLE_RESOURCE',
    defaultOperatingCalendar: 'DAILY_EXCEPT_HOLIDAYS',
    processes: [
      { processName: 'CS', operatingCalendar: 'DAILY_EXCEPT_HOLIDAYS', minStaffing: 1 },
      { processName: 'ACC', operatingCalendar: 'DAILY_EXCEPT_HOLIDAYS', minStaffing: 1 }
    ],
    assignedEmployeeIds: ['emp_03']
  },
  {
    id: 'brand_purepet',
    name: 'PurePet Care Naturals',
    podId: 'pod_alpha',
    category: 'Pet Care & Food',
    staffingType: 'SINGLE_RESOURCE',
    defaultOperatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS',
    processes: [
      { processName: 'CS', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minStaffing: 1 },
      { processName: 'NDR', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minStaffing: 1 }
    ],
    assignedEmployeeIds: ['emp_04']
  },
  {
    id: 'brand_eliteglow',
    name: 'EliteGlow Cosmetics (High Volume)',
    podId: 'pod_alpha',
    category: 'Luxury Cosmetics',
    staffingType: 'MULTI_RESOURCE',
    defaultOperatingCalendar: '365_DAYS',
    processes: [
      { processName: 'CS', operatingCalendar: '365_DAYS', minStaffing: 1 },
      { processName: 'ACC', operatingCalendar: 'DAILY_EXCEPT_HOLIDAYS', minStaffing: 1 },
      { processName: 'NDR', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minStaffing: 1 }
    ],
    // 3 employees assigned with process specializations
    assignedEmployeeIds: ['emp_05', 'emp_06', 'emp_07']
  },

  // --- POD BETA: 4 Single-Resource Brands + 1 Multi-Resource Brand ---
  {
    id: 'brand_urbanthread',
    name: 'UrbanThread Apparels',
    podId: 'pod_beta',
    category: 'Fast Fashion & Streetwear',
    staffingType: 'SINGLE_RESOURCE',
    defaultOperatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS',
    processes: [
      { processName: 'CS', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minStaffing: 1 },
      { processName: 'NDR', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minStaffing: 1 }
    ],
    assignedEmployeeIds: ['emp_11']
  },
  {
    id: 'brand_boldkicks',
    name: 'BoldKicks Footwear',
    podId: 'pod_beta',
    category: 'Sneakers & Shoes',
    staffingType: 'SINGLE_RESOURCE',
    defaultOperatingCalendar: '365_DAYS',
    processes: [
      { processName: 'CS', operatingCalendar: '365_DAYS', minStaffing: 1 },
      { processName: 'ACC', operatingCalendar: 'DAILY_EXCEPT_HOLIDAYS', minStaffing: 1 }
    ],
    assignedEmployeeIds: ['emp_12']
  },
  {
    id: 'brand_ecoclean',
    name: 'EcoClean Living',
    podId: 'pod_beta',
    category: 'Sustainable Home',
    staffingType: 'SINGLE_RESOURCE',
    defaultOperatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS',
    processes: [
      { processName: 'CS', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minStaffing: 1 },
      { processName: 'Retention', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minStaffing: 1 }
    ],
    assignedEmployeeIds: ['emp_13']
  },
  {
    id: 'brand_denimco',
    name: 'RawDenim Co.',
    podId: 'pod_beta',
    category: 'Premium Denim',
    staffingType: 'SINGLE_RESOURCE',
    defaultOperatingCalendar: 'DAILY_EXCEPT_HOLIDAYS',
    processes: [
      { processName: 'CS', operatingCalendar: 'DAILY_EXCEPT_HOLIDAYS', minStaffing: 1 },
      { processName: 'NDR', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minStaffing: 1 }
    ],
    assignedEmployeeIds: ['emp_14']
  },
  {
    id: 'brand_apexathlete',
    name: 'ApexAthlete Gear (High Volume)',
    podId: 'pod_beta',
    category: 'Athletic Wear & Accessories',
    staffingType: 'MULTI_RESOURCE',
    defaultOperatingCalendar: '365_DAYS',
    processes: [
      { processName: 'CS', operatingCalendar: '365_DAYS', minStaffing: 2 }, // requires 2 agents
      { processName: 'ACC', operatingCalendar: 'DAILY_EXCEPT_HOLIDAYS', minStaffing: 1 },
      { processName: 'NDR', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minStaffing: 1 }
    ],
    assignedEmployeeIds: ['emp_15', 'emp_16', 'emp_17', 'emp_18']
  },

  // --- POD GAMMA: 3 Single-Resource Brands + 1 Multi-Resource Brand ---
  {
    id: 'brand_novatech',
    name: 'NovaTech Audio & Wearables',
    podId: 'pod_gamma',
    category: 'Consumer Electronics',
    staffingType: 'SINGLE_RESOURCE',
    defaultOperatingCalendar: '365_DAYS',
    processes: [
      { processName: 'CS', operatingCalendar: '365_DAYS', minStaffing: 1 },
      { processName: 'NDR', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minStaffing: 1 }
    ],
    assignedEmployeeIds: ['emp_21']
  },
  {
    id: 'brand_fitpulse',
    name: 'FitPulse Active Smartbands',
    podId: 'pod_gamma',
    category: 'Fitness Tech',
    staffingType: 'SINGLE_RESOURCE',
    defaultOperatingCalendar: 'DAILY_EXCEPT_HOLIDAYS',
    processes: [
      { processName: 'CS', operatingCalendar: 'DAILY_EXCEPT_HOLIDAYS', minStaffing: 1 },
      { processName: 'ACC', operatingCalendar: 'DAILY_EXCEPT_HOLIDAYS', minStaffing: 1 }
    ],
    assignedEmployeeIds: ['emp_22']
  },
  {
    id: 'brand_luminahome',
    name: 'Lumina Smart Lighting',
    podId: 'pod_gamma',
    category: 'Smart Home Automation',
    staffingType: 'SINGLE_RESOURCE',
    defaultOperatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS',
    processes: [
      { processName: 'CS', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minStaffing: 1 },
      { processName: 'Retention', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minStaffing: 1 }
    ],
    assignedEmployeeIds: ['emp_23']
  },
  {
    id: 'brand_havenfurnish',
    name: 'HavenFurnish Living (High Volume)',
    podId: 'pod_gamma',
    category: 'Custom Furniture & Home',
    staffingType: 'MULTI_RESOURCE',
    defaultOperatingCalendar: 'DAILY_EXCEPT_HOLIDAYS',
    processes: [
      { processName: 'CS', operatingCalendar: 'DAILY_EXCEPT_HOLIDAYS', minStaffing: 1 },
      { processName: 'ACC', operatingCalendar: 'DAILY_EXCEPT_HOLIDAYS', minStaffing: 1 },
      { processName: 'NDR', operatingCalendar: 'MON_SAT_EXCEPT_HOLIDAYS', minStaffing: 1 }
    ],
    assignedEmployeeIds: ['emp_24', 'emp_25', 'emp_26']
  }
];

// 32 Employees distributed across the 3 pods with dedicated brand assignments & floater/backup capacity
const employees = [
  // --- POD ALPHA (10 Employees) ---
  {
    id: 'emp_01',
    name: 'Aarav Patel',
    email: 'aarav.patel@datastraw.io',
    podId: 'pod_alpha',
    skills: ['CS', 'ACC', 'NDR'],
    assignedBrands: [{ brandId: 'brand_glowskin', processes: ['CS', 'ACC', 'NDR'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [0], // Sunday
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_02',
    name: 'Diya Sharma',
    email: 'diya.sharma@datastraw.io',
    podId: 'pod_alpha',
    skills: ['CS', 'Retention'],
    assignedBrands: [{ brandId: 'brand_zenaura', processes: ['CS', 'Retention'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [0],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_03',
    name: 'Kabir Mehta',
    email: 'kabir.mehta@datastraw.io',
    podId: 'pod_alpha',
    skills: ['CS', 'ACC'],
    assignedBrands: [{ brandId: 'brand_beancraft', processes: ['CS', 'ACC'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [0],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_04',
    name: 'Ananya Verma',
    email: 'ananya.verma@datastraw.io',
    podId: 'pod_alpha',
    skills: ['CS', 'NDR'],
    assignedBrands: [{ brandId: 'brand_purepet', processes: ['CS', 'NDR'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [0],
    maxConsecutiveDays: 6
  },
  // EliteGlow multi-resource team
  {
    id: 'emp_05',
    name: 'Rohan Nambiar',
    email: 'rohan.n@datastraw.io',
    podId: 'pod_alpha',
    skills: ['CS'],
    assignedBrands: [{ brandId: 'brand_eliteglow', processes: ['CS'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [0],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_06',
    name: 'Ishita Roy',
    email: 'ishita.roy@datastraw.io',
    podId: 'pod_alpha',
    skills: ['ACC', 'CS'],
    assignedBrands: [{ brandId: 'brand_eliteglow', processes: ['ACC'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [1], // Monday
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_07',
    name: 'Devendra Kulkarni',
    email: 'dev.kulkarni@datastraw.io',
    podId: 'pod_alpha',
    skills: ['NDR', 'CS'],
    assignedBrands: [{ brandId: 'brand_eliteglow', processes: ['NDR'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [0],
    maxConsecutiveDays: 6
  },
  // Pod Alpha Cross-Trained Floaters / Backup pool
  {
    id: 'emp_08',
    name: 'Meera Chawla',
    email: 'meera.chawla@datastraw.io',
    podId: 'pod_alpha',
    skills: ['CS', 'ACC', 'NDR'],
    assignedBrands: [], // Floater backup
    weeklyOffQuota: 1,
    preferredOffDays: [2], // Tuesday
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_09',
    name: 'Siddharth Nair',
    email: 'siddharth.n@datastraw.io',
    podId: 'pod_alpha',
    skills: ['CS', 'Retention', 'ACC'],
    assignedBrands: [],
    weeklyOffQuota: 1,
    preferredOffDays: [3], // Wednesday
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_10',
    name: 'Priyanka Sen',
    email: 'priyanka.sen@datastraw.io',
    podId: 'pod_alpha',
    skills: ['CS', 'NDR'],
    assignedBrands: [],
    weeklyOffQuota: 1,
    preferredOffDays: [4], // Thursday
    maxConsecutiveDays: 6
  },

  // --- POD BETA (11 Employees) ---
  {
    id: 'emp_11',
    name: 'Rahul Singhania',
    email: 'rahul.s@datastraw.io',
    podId: 'pod_beta',
    skills: ['CS', 'NDR'],
    assignedBrands: [{ brandId: 'brand_urbanthread', processes: ['CS', 'NDR'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [0],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_12',
    name: 'Kavya Joshi',
    email: 'kavya.joshi@datastraw.io',
    podId: 'pod_beta',
    skills: ['CS', 'ACC'],
    assignedBrands: [{ brandId: 'brand_boldkicks', processes: ['CS', 'ACC'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [0],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_13',
    name: 'Arjun Das',
    email: 'arjun.das@datastraw.io',
    podId: 'pod_beta',
    skills: ['CS', 'Retention'],
    assignedBrands: [{ brandId: 'brand_ecoclean', processes: ['CS', 'Retention'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [0],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_14',
    name: 'Tanvi Saxena',
    email: 'tanvi.saxena@datastraw.io',
    podId: 'pod_beta',
    skills: ['CS', 'NDR'],
    assignedBrands: [{ brandId: 'brand_denimco', processes: ['CS', 'NDR'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [0],
    maxConsecutiveDays: 6
  },
  // ApexAthlete multi-resource team (4 agents)
  {
    id: 'emp_15',
    name: 'Aditya Chopra',
    email: 'aditya.c@datastraw.io',
    podId: 'pod_beta',
    skills: ['CS'],
    assignedBrands: [{ brandId: 'brand_apexathlete', processes: ['CS'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [0],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_16',
    name: 'Neha Kapoor',
    email: 'neha.kapoor@datastraw.io',
    podId: 'pod_beta',
    skills: ['CS'],
    assignedBrands: [{ brandId: 'brand_apexathlete', processes: ['CS'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [1],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_17',
    name: 'Kunal Ghosh',
    email: 'kunal.ghosh@datastraw.io',
    podId: 'pod_beta',
    skills: ['ACC', 'CS'],
    assignedBrands: [{ brandId: 'brand_apexathlete', processes: ['ACC'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [2],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_18',
    name: 'Shreya Bhatia',
    email: 'shreya.b@datastraw.io',
    podId: 'pod_beta',
    skills: ['NDR', 'CS'],
    assignedBrands: [{ brandId: 'brand_apexathlete', processes: ['NDR'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [0],
    maxConsecutiveDays: 6
  },
  // Pod Beta Floater Backups
  {
    id: 'emp_19',
    name: 'Manish Tiwari',
    email: 'manish.t@datastraw.io',
    podId: 'pod_beta',
    skills: ['CS', 'NDR', 'ACC'],
    assignedBrands: [],
    weeklyOffQuota: 1,
    preferredOffDays: [3],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_20',
    name: 'Ritika Malhotra',
    email: 'ritika.m@datastraw.io',
    podId: 'pod_beta',
    skills: ['CS', 'Retention'],
    assignedBrands: [],
    weeklyOffQuota: 1,
    preferredOffDays: [4],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_20b',
    name: 'Gaurav Pillai',
    email: 'gaurav.p@datastraw.io',
    podId: 'pod_beta',
    skills: ['CS', 'ACC', 'NDR'],
    assignedBrands: [],
    weeklyOffQuota: 1,
    preferredOffDays: [5],
    maxConsecutiveDays: 6
  },

  // --- POD GAMMA (11 Employees) ---
  {
    id: 'emp_21',
    name: 'Pranav Menon',
    email: 'pranav.m@datastraw.io',
    podId: 'pod_gamma',
    skills: ['CS', 'NDR'],
    assignedBrands: [{ brandId: 'brand_novatech', processes: ['CS', 'NDR'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [0],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_22',
    name: 'Zoya Khan',
    email: 'zoya.khan@datastraw.io',
    podId: 'pod_gamma',
    skills: ['CS', 'ACC'],
    assignedBrands: [{ brandId: 'brand_fitpulse', processes: ['CS', 'ACC'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [0],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_23',
    name: 'Varun Reddy',
    email: 'varun.reddy@datastraw.io',
    podId: 'pod_gamma',
    skills: ['CS', 'Retention'],
    assignedBrands: [{ brandId: 'brand_luminahome', processes: ['CS', 'Retention'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [0],
    maxConsecutiveDays: 6
  },
  // HavenFurnish multi-resource team (3 agents)
  {
    id: 'emp_24',
    name: 'Riddhi Deshmukh',
    email: 'riddhi.d@datastraw.io',
    podId: 'pod_gamma',
    skills: ['CS'],
    assignedBrands: [{ brandId: 'brand_havenfurnish', processes: ['CS'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [0],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_25',
    name: 'Harsh Vardhan',
    email: 'harsh.v@datastraw.io',
    podId: 'pod_gamma',
    skills: ['ACC', 'CS'],
    assignedBrands: [{ brandId: 'brand_havenfurnish', processes: ['ACC'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [1],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_26',
    name: 'Swati Agrawal',
    email: 'swati.a@datastraw.io',
    podId: 'pod_gamma',
    skills: ['NDR', 'Retention'],
    assignedBrands: [{ brandId: 'brand_havenfurnish', processes: ['NDR'], isPrimary: true }],
    weeklyOffQuota: 1,
    preferredOffDays: [2],
    maxConsecutiveDays: 6
  },
  // Pod Gamma Backups / Multi-Brand Shared Employees
  {
    id: 'emp_27',
    name: 'Nikhil Agarwal',
    email: 'nikhil.a@datastraw.io',
    podId: 'pod_gamma',
    skills: ['CS', 'ACC', 'NDR'],
    assignedBrands: [],
    weeklyOffQuota: 1,
    preferredOffDays: [3],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_28',
    name: 'Deepika Iyer',
    email: 'deepika.i@datastraw.io',
    podId: 'pod_gamma',
    skills: ['CS', 'Retention'],
    assignedBrands: [],
    weeklyOffQuota: 1,
    preferredOffDays: [4],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_29',
    name: 'Karthik Raman',
    email: 'karthik.r@datastraw.io',
    podId: 'pod_gamma',
    skills: ['CS', 'ACC'],
    assignedBrands: [],
    weeklyOffQuota: 1,
    preferredOffDays: [5],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_30',
    name: 'Aishwarya Joshi',
    email: 'aishwarya.j@datastraw.io',
    podId: 'pod_gamma',
    skills: ['CS', 'NDR'],
    assignedBrands: [],
    weeklyOffQuota: 1,
    preferredOffDays: [0],
    maxConsecutiveDays: 6
  },
  {
    id: 'emp_31',
    name: 'Tushar Bansal',
    email: 'tushar.b@datastraw.io',
    podId: 'pod_gamma',
    skills: ['CS', 'ACC', 'NDR', 'Retention'],
    assignedBrands: [],
    weeklyOffQuota: 1,
    preferredOffDays: [6], // Saturday
    maxConsecutiveDays: 6
  }
];

// Seed sample planned leaves to demonstrate realistic conflict detection
const leaves = [
  // emp_01 (sole resource for 365-day brand GlowSkin) is on leave on Nov 15th
  // This immediately triggers a critical coverage gap for the evaluator to observe!
  {
    id: 'leave_01',
    employeeId: 'emp_01',
    startDate: '2026-11-15',
    endDate: '2026-11-16',
    type: 'PLANNED',
    status: 'APPROVED',
    reason: 'Family Event'
  },
  // emp_11 (UrbanThread) on comp-off
  {
    id: 'leave_02',
    employeeId: 'emp_11',
    startDate: '2026-11-20',
    endDate: '2026-11-20',
    type: 'COMP_OFF',
    status: 'APPROVED',
    reason: 'Compensatory off for festive rush'
  },
  // emp_05 (EliteGlow CS) on planned medical leave Nov 22-23
  {
    id: 'leave_03',
    employeeId: 'emp_05',
    startDate: '2026-11-22',
    endDate: '2026-11-23',
    type: 'SICK',
    status: 'APPROVED',
    reason: 'Medical recovery'
  }
];

module.exports = {
  pods,
  brands,
  employees,
  leaves,
  holidays
};

