import { apiRequest } from './client';

export const rosterApi = {
  // Core Entities
  getPods: () => apiRequest('/api/pods'),
  getBrands: () => apiRequest('/api/brands'),
  addBrand: (brandData) => apiRequest('/api/brands', { method: 'POST', body: brandData }),
  getEmployees: () => apiRequest('/api/employees'),
  addEmployee: (empData) => apiRequest('/api/employees', { method: 'POST', body: empData }),
  getLeaves: () => apiRequest('/api/leaves'),
  getHolidays: () => apiRequest('/api/holidays'),

  // Roster Management
  getRoster: (month = '2026-11') => apiRequest(`/api/roster/${month}`),
  generateRoster: (month = '2026-11') => apiRequest('/api/roster/generate', { method: 'POST', body: { month } }),
  applyFix: (month, conflictId, backupEmployeeId) => 
    apiRequest('/api/roster/apply-fix', { method: 'POST', body: { month, conflictId, backupEmployeeId } }),
  autoResolveAll: (month = '2026-11') => 
    apiRequest('/api/roster/auto-resolve', { method: 'POST', body: { month } }),
  updateShift: (shiftPayload) => 
    apiRequest('/api/roster/update-shift', { method: 'POST', body: shiftPayload }),
  simulateChange: (simPayload) => 
    apiRequest('/api/roster/simulate-change', { method: 'POST', body: simPayload }),

  // Seed Reset
  resetSeed: () => apiRequest('/api/seed/reset', { method: 'POST' }),
};

