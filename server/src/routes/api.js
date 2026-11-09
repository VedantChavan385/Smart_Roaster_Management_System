const express = require('express');
const router = express.Router();
const store = require('../db/store');
const solver = require('../engine/solver');
const seedData = require('../seeds/seedData');

// 1. Core Entity Endpoints
router.get('/pods', async (req, res) => {
  try {
    const pods = await store.getPods();
    res.json({ success: true, data: pods });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/brands', async (req, res) => {
  try {
    const brands = await store.getBrands();
    res.json({ success: true, data: brands });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/employees', async (req, res) => {
  try {
    const employees = await store.getEmployees();
    res.json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/leaves', async (req, res) => {
  try {
    const leaves = await store.getLeaves();
    res.json({ success: true, data: leaves });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/holidays', async (req, res) => {
  try {
    const holidays = await store.getHolidays();
    res.json({ success: true, data: holidays });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Roster Generation & Fetching
router.get('/roster/:month', async (req, res) => {
  try {
    const { month } = req.params;
    let roster = await store.getRosterByMonth(month);
    
    // Auto-generate if not yet existing so the user sees data immediately
    if (!roster) {
      const [employees, brands, pods, leaves, holidays] = await Promise.all([
        store.getEmployees(),
        store.getBrands(),
        store.getPods(),
        store.getLeaves(),
        store.getHolidays()
      ]);
      roster = solver.generateRoster(month, { employees, brands, pods, leaves, holidays });
      await store.saveRoster(roster);
    }
    
    res.json({ success: true, data: roster });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/roster/generate', async (req, res) => {
  try {
    const { month = '2026-11' } = req.body;
    const [employees, brands, pods, leaves, holidays] = await Promise.all([
      store.getEmployees(),
      store.getBrands(),
      store.getPods(),
      store.getLeaves(),
      store.getHolidays()
    ]);

    const roster = solver.generateRoster(month, { employees, brands, pods, leaves, holidays });
    await store.saveRoster(roster);

    res.json({ 
      success: true, 
      message: `Generated roster for ${month} with ${roster.conflicts.length} conflict(s) flagged.`,
      data: roster 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. One-Click Conflict Fix: Apply Suggested Backup
router.post('/roster/apply-fix', async (req, res) => {
  try {
    const { month, conflictId, backupEmployeeId } = req.body;
    const roster = await store.getRosterByMonth(month);
    if (!roster) {
      return res.status(404).json({ success: false, error: 'Roster not found.' });
    }

    const conflict = roster.conflicts.find(c => c.id === conflictId);
    if (!conflict) {
      return res.status(404).json({ success: false, error: 'Conflict not found.' });
    }

    const backupEmployee = await store.getEmployeeById(backupEmployeeId);
    if (!backupEmployee) {
      return res.status(404).json({ success: false, error: 'Backup employee not found.' });
    }

    // Update the shift of the backup employee on this date
    const shiftIdx = roster.shifts.findIndex(
      s => s.date === conflict.date && s.employeeId === backupEmployeeId
    );

    if (shiftIdx !== -1) {
      roster.shifts[shiftIdx].brandId = conflict.brandId;
      roster.shifts[shiftIdx].process = conflict.process;
      roster.shifts[shiftIdx].status = 'WORKING';
      roster.shifts[shiftIdx].isBackup = true;
      roster.shifts[shiftIdx].notes = `Assigned as emergency backup for ${conflict.brandName} (${conflict.process})`;
    } else {
      roster.shifts.push({
        date: conflict.date,
        employeeId: backupEmployeeId,
        brandId: conflict.brandId,
        process: conflict.process,
        status: 'WORKING',
        isBackup: true,
        notes: `Assigned as emergency backup for ${conflict.brandName} (${conflict.process})`
      });
    }

    // Remove the resolved conflict
    roster.conflicts = roster.conflicts.filter(c => c.id !== conflictId);
    roster.metadata.criticalGapsCount = roster.conflicts.filter(c => c.severity === 'CRITICAL').length;
    roster.metadata.coverageRate = roster.metadata.criticalGapsCount === 0 
      ? 100 
      : Math.max(70, Math.round(100 - (roster.metadata.criticalGapsCount * 2.5)));

    await store.saveRoster(roster);

    res.json({
      success: true,
      message: `Successfully assigned ${backupEmployee.name} as backup. Conflict resolved!`,
      data: roster
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Change Management Simulator (Section 3-F)
router.post('/roster/simulate-change', async (req, res) => {
  try {
    const { month = '2026-11', employeeId, date, changeType = 'SICK_LEAVE', reason = 'Emergency medical absence' } = req.body;

    const [employees, brands, pods, leaves, holidays] = await Promise.all([
      store.getEmployees(),
      store.getBrands(),
      store.getPods(),
      store.getLeaves(),
      store.getHolidays()
    ]);

    // Create a temporary leave entry
    const newLeave = {
      id: `sim_leave_${Date.now()}`,
      employeeId,
      startDate: date,
      endDate: date,
      type: 'SICK',
      status: 'APPROVED',
      reason
    };

    // Add to leaves list
    await store.addLeave(newLeave);

    // Regenerate roster with new constraint
    const updatedLeaves = await store.getLeaves();
    const updatedRoster = solver.generateRoster(month, { 
      employees, 
      brands, 
      pods, 
      leaves: updatedLeaves, 
      holidays 
    });

    await store.saveRoster(updatedRoster);

    const targetEmp = employees.find(e => e.id === employeeId);
    res.json({
      success: true,
      message: `Simulated ${changeType} for ${targetEmp ? targetEmp.name : employeeId} on ${date}. Recalculated impact & coverage gaps.`,
      data: updatedRoster
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. One-Click Reset to Default Sample Dataset
router.post('/seed/reset', async (req, res) => {
  try {
    await store.savePods(seedData.pods);
    await store.saveBrands(seedData.brands);
    await store.saveEmployees(seedData.employees);
    await store.saveLeaves(seedData.leaves);
    await store.saveHolidays(seedData.holidays);

    // Regenerate default Nov 2026 roster
    const roster = solver.generateRoster('2026-11', seedData);
    await store.saveRoster(roster);

    res.json({ 
      success: true, 
      message: 'Reset database to realistic sample dataset (32 employees, 14 brands, 3 pods).',
      data: roster
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

