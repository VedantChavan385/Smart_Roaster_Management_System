/**
 * Scheduling Constraint Solver
 * Deterministic multi-stage assignment algorithm:
 * Stage 1: Calendar & Operating Demand Resolution (Brand & Process level)
 * Stage 2: Primary Staff Allocation & Leave Shielding
 * Stage 3: Single-Resource Multi-Process Handling (1 employee covers all brand processes)
 * Stage 4: Multi-Resource Shift Balancing & Rotational Offs
 * Stage 5: Floater / Backup Allocation & Gap Diagnostics
 */

function isDayOperating(calendarType, dateObj, isPublicHoliday) {
  const dayOfWeek = dateObj.getDay(); // 0: Sun, 1: Mon, ... 6: Sat

  switch (calendarType) {
    case '365_DAYS':
      return true; // Always operating, including Sundays and holidays
    case 'DAILY_EXCEPT_HOLIDAYS':
      return !isPublicHoliday;
    case 'MON_SAT_EXCEPT_HOLIDAYS':
      return dayOfWeek !== 0 && !isPublicHoliday;
    case 'MON_FRI_EXCEPT_HOLIDAYS':
      return dayOfWeek !== 0 && dayOfWeek !== 6 && !isPublicHoliday;
    default:
      return dayOfWeek !== 0 && !isPublicHoliday;
  }
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDaysInMonth(yearMonth) {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;

  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

class RosterSolver {
  generateRoster(yearMonth, { employees, brands, pods, leaves, holidays }) {
    const days = getDaysInMonth(yearMonth);
    const holidayMap = new Map();
    holidays.forEach(h => holidayMap.set(h.date, h));

    // Map approved leaves: empId -> Map(dateStr => leaveObj)
    const leaveMap = new Map();
    leaves.forEach(l => {
      if (l.status === 'APPROVED') {
        if (!leaveMap.has(l.employeeId)) {
          leaveMap.set(l.employeeId, new Map());
        }
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const ds = formatDate(d);
          leaveMap.get(l.employeeId).set(ds, l);
        }
      }
    });

    const shiftMap = new Map();
    const consecutiveWorkDays = new Map();
    employees.forEach(e => consecutiveWorkDays.set(e.id, 0));

    // Daily brand process coverage tracker: Map `${date}_${brandId}_${process}` => [empId]
    const coverageTracker = new Map();

    for (const day of days) {
      const dateStr = formatDate(day);
      const dayOfWeek = day.getDay();
      const holiday = holidayMap.get(dateStr);
      const isPublicHoliday = !!holiday;

      for (const emp of employees) {
        // 1. Check Leave
        const empLeaves = leaveMap.get(emp.id);
        if (empLeaves && empLeaves.has(dateStr)) {
          const leaveObj = empLeaves.get(dateStr);
          shiftMap.set(`${dateStr}_${emp.id}`, {
            date: dateStr,
            employeeId: emp.id,
            brandId: null,
            process: null,
            status: 'LEAVE',
            isBackup: false,
            notes: `${leaveObj.type} Leave: ${leaveObj.reason || 'Approved leave'}`
          });
          consecutiveWorkDays.set(emp.id, 0);
          continue;
        }

        const primaryAssignment = emp.assignedBrands && emp.assignedBrands.find(b => b.isPrimary);
        const assignedBrand = primaryAssignment ? brands.find(b => b.id === primaryAssignment.brandId) : null;

        // 2. Floater / Backup Pool Employees
        if (!assignedBrand) {
          const prefersTodayOff = emp.preferredOffDays && emp.preferredOffDays.includes(dayOfWeek);
          const currentStreak = consecutiveWorkDays.get(emp.id) || 0;
          const reachedMaxStreak = currentStreak >= (emp.maxConsecutiveDays || 6);

          if (prefersTodayOff || reachedMaxStreak) {
            shiftMap.set(`${dateStr}_${emp.id}`, {
              date: dateStr,
              employeeId: emp.id,
              brandId: null,
              process: null,
              status: isPublicHoliday ? 'HOLIDAY' : 'OFF',
              isBackup: false,
              notes: 'Weekly off (Floater Pool)'
            });
            consecutiveWorkDays.set(emp.id, 0);
          } else {
            shiftMap.set(`${dateStr}_${emp.id}`, {
              date: dateStr,
              employeeId: emp.id,
              brandId: null,
              process: null,
              status: 'WORKING',
              isBackup: true,
              notes: 'On-duty Pod Floater / Available for backup'
            });
            consecutiveWorkDays.set(emp.id, currentStreak + 1);
          }
          continue;
        }

        // 3. Brand Operating Status Check
        const isBrandOperating = assignedBrand.processes.some(p => {
          const cal = p.operatingCalendar || assignedBrand.defaultOperatingCalendar;
          return isDayOperating(cal, day, isPublicHoliday);
        });

        if (!isBrandOperating) {
          shiftMap.set(`${dateStr}_${emp.id}`, {
            date: dateStr,
            employeeId: emp.id,
            brandId: assignedBrand.id,
            process: null,
            status: isPublicHoliday ? 'HOLIDAY' : 'OFF',
            isBackup: false,
            notes: isPublicHoliday ? `Public Holiday: ${holiday.name}` : 'Brand closed on Sundays'
          });
          consecutiveWorkDays.set(emp.id, 0);
          continue;
        }

        // 4. Single-Resource Brands (~80%)
        // The single employee is dedicated to all processes of this brand.
        if (assignedBrand.staffingType === 'SINGLE_RESOURCE') {
          const currentStreak = consecutiveWorkDays.get(emp.id) || 0;
          const reachedMaxStreak = currentStreak >= (emp.maxConsecutiveDays || 6);

          // If reached max consecutive days and needs rest
          if (reachedMaxStreak) {
            shiftMap.set(`${dateStr}_${emp.id}`, {
              date: dateStr,
              employeeId: emp.id,
              brandId: assignedBrand.id,
              process: null,
              status: 'OFF',
              isBackup: false,
              notes: 'Compulsory Weekly Off (Max consecutive work days reached)'
            });
            consecutiveWorkDays.set(emp.id, 0);
            continue;
          }

          // Single resource works and covers ALL active processes for the brand today!
          const activeProcesses = assignedBrand.processes.filter(p => {
            const cal = p.operatingCalendar || assignedBrand.defaultOperatingCalendar;
            return isDayOperating(cal, day, isPublicHoliday);
          });

          const activeProcessNames = activeProcesses.map(p => p.processName);
          const processDisplay = activeProcessNames.join(' + ');

          shiftMap.set(`${dateStr}_${emp.id}`, {
            date: dateStr,
            employeeId: emp.id,
            brandId: assignedBrand.id,
            process: processDisplay,
            status: 'WORKING',
            isBackup: false,
            notes: `Full operational coverage for ${assignedBrand.name} (${processDisplay})`
          });
          consecutiveWorkDays.set(emp.id, currentStreak + 1);

          // Register coverage for each active process handled by this single resource
          for (const procName of activeProcessNames) {
            const covKey = `${dateStr}_${assignedBrand.id}_${procName}`;
            if (!coverageTracker.has(covKey)) coverageTracker.set(covKey, []);
            coverageTracker.get(covKey).push(emp.id);
          }
          continue;
        }

        // 5. Multi-Resource Brands (~20%)
        // Multiple employees handle distinct or shared processes with rotational offs
        const assignedProcs = primaryAssignment.processes || emp.skills;
        const activeProcsForEmp = assignedBrand.processes.filter(p => 
          assignedProcs.includes(p.processName) &&
          isDayOperating(p.operatingCalendar || assignedBrand.defaultOperatingCalendar, day, isPublicHoliday)
        );

        if (activeProcsForEmp.length === 0) {
          shiftMap.set(`${dateStr}_${emp.id}`, {
            date: dateStr,
            employeeId: emp.id,
            brandId: assignedBrand.id,
            process: null,
            status: isPublicHoliday ? 'HOLIDAY' : 'OFF',
            isBackup: false,
            notes: 'Process not active today'
          });
          consecutiveWorkDays.set(emp.id, 0);
          continue;
        }

        const prefersTodayOff = emp.preferredOffDays && emp.preferredOffDays.includes(dayOfWeek);
        const currentStreak = consecutiveWorkDays.get(emp.id) || 0;
        const reachedMaxStreak = currentStreak >= (emp.maxConsecutiveDays || 6);

        // Check if peers can cover if this employee takes off
        const mainProcess = activeProcsForEmp[0].processName;
        const peers = employees.filter(other => 
          other.id !== emp.id && 
          other.assignedBrands.some(b => b.brandId === assignedBrand.id && b.processes.includes(mainProcess))
        );

        const peerAlreadyWorking = peers.some(peer => {
          const pShift = shiftMap.get(`${dateStr}_${peer.id}`);
          return pShift && pShift.status === 'WORKING';
        });

        if ((prefersTodayOff || reachedMaxStreak) && (peerAlreadyWorking || peers.length > 1)) {
          shiftMap.set(`${dateStr}_${emp.id}`, {
            date: dateStr,
            employeeId: emp.id,
            brandId: assignedBrand.id,
            process: null,
            status: 'OFF',
            isBackup: false,
            notes: 'Rotational off (Peer covering)'
          });
          consecutiveWorkDays.set(emp.id, 0);
          continue;
        }

        // Multi-resource employee works their specific process
        shiftMap.set(`${dateStr}_${emp.id}`, {
          date: dateStr,
          employeeId: emp.id,
          brandId: assignedBrand.id,
          process: mainProcess,
          status: 'WORKING',
          isBackup: false,
          notes: `Shift for ${assignedBrand.name} (${mainProcess})`
        });
        consecutiveWorkDays.set(emp.id, currentStreak + 1);

        const covKey = `${dateStr}_${assignedBrand.id}_${mainProcess}`;
        if (!coverageTracker.has(covKey)) coverageTracker.set(covKey, []);
        coverageTracker.get(covKey).push(emp.id);
      }
    }

    // Detect Conflicts and Actionable Recommendations
    const conflicts = this.detectConflictsAndSuggestFixes({
      days,
      brands,
      employees,
      pods,
      holidayMap,
      shiftMap,
      coverageTracker,
      leaveMap
    });

    const shifts = Array.from(shiftMap.values());
    const criticalGapsCount = conflicts.filter(c => c.severity === 'CRITICAL').length;
    const totalWorkingShifts = shifts.filter(s => s.status === 'WORKING').length;

    return {
      id: `roster_${yearMonth}`,
      month: yearMonth,
      status: 'DRAFT',
      generatedAt: new Date(),
      shifts,
      conflicts,
      metadata: {
        totalEmployees: employees.length,
        totalBrands: brands.length,
        totalWorkingShifts,
        criticalGapsCount,
        coverageRate: criticalGapsCount === 0 ? 100 : Math.max(75, Math.round(100 - (criticalGapsCount * 4)))
      }
    };
  }

  detectConflictsAndSuggestFixes({
    days,
    brands,
    employees,
    pods,
    holidayMap,
    shiftMap,
    coverageTracker,
    leaveMap
  }) {
    const conflicts = [];
    let conflictSeq = 1;

    for (const day of days) {
      const dateStr = formatDate(day);
      const holiday = holidayMap.get(dateStr);
      const isPublicHoliday = !!holiday;

      for (const brand of brands) {
        for (const proc of brand.processes) {
          const calendar = proc.operatingCalendar || brand.defaultOperatingCalendar;
          const isRequiredToday = isDayOperating(calendar, day, isPublicHoliday);

          if (!isRequiredToday) continue;

          const covKey = `${dateStr}_${brand.id}_${proc.processName}`;
          const assignedWorkingStaff = coverageTracker.get(covKey) || [];
          const requiredStaffCount = proc.minStaffing || 1;

          if (assignedWorkingStaff.length < requiredStaffCount) {
            const assignedBrandStaff = employees.filter(e => 
              brand.assignedEmployeeIds.includes(e.id) && e.skills.includes(proc.processName)
            );

            let rootCause = '';
            let problematicEmployee = null;

            if (assignedBrandStaff.length === 0) {
              rootCause = `No employee assigned to process "${proc.processName}".`;
            } else {
              for (const emp of assignedBrandStaff) {
                const shift = shiftMap.get(`${dateStr}_${emp.id}`);
                const leave = leaveMap.get(emp.id)?.get(dateStr);
                problematicEmployee = emp;

                if (leave) {
                  rootCause = `${emp.name} is the assigned resource but is on approved ${leave.type} leave (${leave.reason || 'Leave'}).`;
                  break;
                } else if (shift && shift.status === 'OFF') {
                  rootCause = `${emp.name} is on weekly off.`;
                  break;
                } else if (shift && shift.status === 'HOLIDAY') {
                  rootCause = `${emp.name} is on holiday off, but brand operates 365 days.`;
                  break;
                }
              }
            }

            const suggestedResolutions = this.findBackupCandidates({
              dateStr,
              brand,
              processName: proc.processName,
              employees,
              pods,
              shiftMap
            });

            conflicts.push({
              id: `conf_${conflictSeq++}`,
              date: dateStr,
              type: assignedWorkingStaff.length === 0 ? 'COVERAGE_GAP' : 'INSUFFICIENT_STAFFING',
              severity: 'CRITICAL',
              brandId: brand.id,
              brandName: brand.name,
              process: proc.processName,
              employeeId: problematicEmployee ? problematicEmployee.id : null,
              employeeName: problematicEmployee ? problematicEmployee.name : 'Unassigned',
              description: `Coverage Gap on ${dateStr}: ${brand.name} (${proc.processName}) requires ${requiredStaffCount} staff, but has ${assignedWorkingStaff.length}. ${rootCause}`,
              suggestedResolutions
            });
          }
        }
      }
    }

    return conflicts;
  }

  findBackupCandidates({ dateStr, brand, processName, employees, pods, shiftMap }) {
    const candidates = [];

    for (const emp of employees) {
      if (!emp.skills.includes(processName)) continue;

      const shift = shiftMap.get(`${dateStr}_${emp.id}`);
      if (!shift) continue;
      if (shift.status === 'LEAVE') continue;

      const isSamePod = emp.podId === brand.podId;
      const isFloater = shift.isBackup || !emp.assignedBrands || emp.assignedBrands.length === 0;
      const isOff = shift.status === 'OFF';

      let suitabilityScore = 0;
      let reason = '';

      if (isSamePod && isFloater && shift.status === 'WORKING') {
        suitabilityScore = 100;
        reason = `Top Recommendation: Same-Pod Floater, skilled in ${processName}, on duty today.`;
      } else if (isSamePod && isOff) {
        suitabilityScore = 80;
        reason = `Same Pod: Skilled in ${processName}, currently on weekly off (can be swapped with comp-off).`;
      } else if (!isSamePod && isFloater && shift.status === 'WORKING') {
        suitabilityScore = 70;
        reason = `Cross-Pod: Floater from another pod, skilled in ${processName}, on duty.`;
      } else if (!isSamePod && isOff) {
        suitabilityScore = 50;
        reason = `Cross-Pod: Skilled in ${processName}, currently on weekly off.`;
      }

      if (suitabilityScore > 0) {
        candidates.push({
          action: 'REASSIGN_BACKUP',
          backupEmployeeId: emp.id,
          backupEmployeeName: emp.name,
          suitabilityScore,
          reason
        });
      }
    }

    candidates.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    return candidates.slice(0, 3);
  }
}

module.exports = new RosterSolver();
