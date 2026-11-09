# Smart Roster Management System 🚀
> **DataStraw Tech Internship Assessment Assignment**  
> A browser-based operational control center and deterministic scheduling solver designed for multi-brand D2C operations.

---

## 🌟 Executive Overview
This application solves the multi-brand operational scheduling problem for growing D2C customer experience (CX) agencies. Unlike passive calendars or spreadsheets, it actively models **supply (employee capacities, leaves, off-day preferences, skill specializations)** against **demand (brand operating calendars, 365-day requirements, minimum staffing per process)**.

It detects critical coverage gaps in real time, diagnoses root causes, and recommends intelligent backup allocations.

---

## 🛠️ Architecture & Tech Stack (MERN)

* **Backend & Solver Engine:** Node.js + Express.js
* **Data Modeling & Storage:** MongoDB / Mongoose with seamless dual-mode local cache fallback (runs friction-free in any environment).
* **Frontend:** React (Vite) + Tailwind CSS + Lucide Icons
* **Constraint Algorithm:** Multi-stage deterministic constraint solver with explainable diagnostics and backup recommendation scoring.

---

## ⚡ Quick Start & Setup Instructions

### 1. Prerequisites
* **Node.js** (v18+ recommended)
* **npm** (v9+)
* Optional: MongoDB connection string (local or MongoDB Atlas). If omitted, the system runs with local file persistence out-of-the-box.

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd "datastraw-asses"

# Install both backend and frontend dependencies
npm run install:all
```

### 3. Running Locally
```bash
# Seed the realistic dataset (32 employees, 14 brands, 3 pods)
npm run seed

# Run the complete application (single command serving frontend & backend)
npm run server
```
* Access the web dashboard at: **`http://localhost:5000`**
* Health check: `http://localhost:5000/health`

---

## 📊 Realistic Pre-Seeded Dataset
The application is pre-seeded strictly in accordance with DataStraw's real-world operational guidelines:
* **32 Employees** (exceeds the 30-employee threshold), grouped under **3 Operational Pods** (Pod Alpha, Pod Beta, Pod Gamma) overseen by dedicated **Pod Leads**.
* **14 D2C Brands**:
  * **~80% Single-Resource Brands (11 brands)**: Managed by a single dedicated agent covering CS, ACC, NDR, and Retention.
  * **~20% Multi-Resource Brands (3 brands)**: High-volume brands (*EliteGlow Cosmetics*, *ApexAthlete Gear*, *HavenFurnish Living*) staffed by 2 to 4 agents with specialized and shared roles.
* **Operating Calendars**:
  * 365-Day Operations (Sundays & Public Holidays required).
  * Daily operations with public holidays off.
  * Mon–Sat operations with Sundays and holidays off.
* **Seed Conflict Cases**: Pre-configured with realistic leaves (e.g. planned leave for sole resource on a 365-day brand) to immediately demonstrate conflict detection and resolution.

---

## 🧭 Key Views & Features

1. **Company-Wide View:** Comprehensive monthly matrix across all 32 staff, color-coded by shift status (Working, Off, Leave, Holiday, Backup).
2. **Pod-Wise View:** Grouped by operational squads with Pod Lead contact details, team utilization, and managed brand accounts.
3. **Brand Coverage Matrix (Core Operational View):** Daily heatmap showing green checkmarks for covered days, red alert badges for coverage gaps, and neutral indicators for scheduled closures.
4. **Process-Wise View:** Staffing volume breakdown across `CS` (Customer Support), `ACC` (Cart Recovery), `NDR` (Non-Delivery Reports), and `Retention`.
5. **Employee-Wise View:** Individual monthly calendar timeline, shift totals, contract off-days, and personal leave history.
6. **Live Conflict & Gap Drawer:** Displays plain-English diagnosis of every operational issue and offers 1-click **"Assign Backup"** suggestions.
7. **"What-If" Change Simulator (Section 3-F):** Interactive module to test sudden sick leaves or client surges and watch the engine re-evaluate coverage.
8. **Entity Rules Manager (Section 3-A):** Full UI to inspect and manage brands, employees, pods, and holiday rules without editing code.
9. **One-Click CSV Export:** Export the complete monthly roster to CSV with one click.

---

## 🧠 Tell Us How You Think (Section 8 Answers)

### 1. How did you model employees, brands, processes, pods, and their relationships?
* **Pods (`Pod`):** Represent administrative clusters overseen by a single Pod Lead. Pods serve as the first-order affinity boundary for backup recommendations.
* **Employees (`Employee`):** Store individual competencies (`skills: ['CS', 'ACC', 'NDR', 'Retention']`), contractual weekly off quotas (1 or 2 days/week), preferred rest days, and primary brand assignments.
* **Brands (`Brand`):** Encapsulate client operating calendars (`365_DAYS`, `DAILY_EXCEPT_HOLIDAYS`, `MON_SAT_EXCEPT_HOLIDAYS`), staffing tier (`SINGLE_RESOURCE` vs `MULTI_RESOURCE`), assigned staff IDs, and an array of process requirements.
* **Process Requirements:** Each process within a brand specifies its own `minStaffing` and operating calendar (allowing CS to run 365 days while NDR runs Mon–Sat).
* **Rosters (`Roster`):** Monthly immutable snapshots storing normalized shift objects (`{ date, employeeId, brandId, process, status, isBackup }`) and evaluated conflict diagnostics.

### 2. How does your system generate a roster and determine whether it satisfies the required constraints?
The solver uses a deterministic **5-Stage Constraint Satisfaction Pipeline**:
1. **Demand Resolution:** Evaluates the operating calendar for every brand process on every date of the month to compute the target staffing requirement.
2. **Leave Shielding (Hard Constraint):** Marks any employee with approved leave (`PLANNED`, `SICK`, `COMP_OFF`) as non-workable.
3. **Primary Assignment & Single-Resource Expansion:** Deploys assigned employees. For single-resource brands (~80%), an on-duty shift fulfills all active brand processes simultaneously.
4. **Rotational Offs & Workload Smoothing:** Evaluates continuous work streaks (capped at max 6 consecutive days) and off-day preferences. On multi-resource brands, it rotates weekly offs among peers to prevent burnout while maintaining client coverage.
5. **Constraint Validation:** Scans the resulting coverage matrix against client demands. Any shortfall generates a structured `Conflict` object.

### 3. How did you handle the difference between single-resource brands and brands with multiple employees?
* **Single-Resource Brands (~80%):** The dedicated employee acts as a multi-skilled generalist. When active, their shift credits coverage across all configured processes (CS + ACC + NDR). However, because redundancy is 0, any scheduled off or approved leave directly creates an operational coverage gap unless a floater/backup is assigned.
* **Multi-Resource Brands (~20%):** Work is partitioned by specialized processes. The engine rotates weekly offs between assigned peers, allowing Employee A to rest on Sunday while Employee B covers weekend CS, and vice-versa on Monday.

### 4. What happens when an employee manages all processes for a brand but is unavailable on a required working day?
* The solver strictly honors the leave (Tier-1 Hard Constraint) and **does not silently schedule an impossible shift**.
* It flags a **`CRITICAL COVERAGE GAP`** on that date.
* The diagnostic engine generates a clear explanation:
  > *"Coverage Gap on 2026-11-15: GlowSkin Organics (CS) requires 1 staff, but has 0. Aarav Patel is the assigned resource but is on approved PLANNED leave (Family Event)."*
* It automatically triggers the **Backup Recommendation Engine**, which scores available employees based on:
  1. *Same-Pod Floater on duty (Score: 100)*
  2. *Same-Pod Peer on weekly off (Score: 80 - eligible for comp-off swap)*
  3. *Cross-Pod Floater (Score: 70)*
* The manager can resolve the gap with a single click.

### 5. How does your system handle conflicting requirements or insufficient staffing?
* The system enforces a **strict hierarchy of constraints**:
  1. **Hard Constraints (Non-negotiable):** Approved leaves, client operating mandates, skill qualification checks.
  2. **Soft Constraints (Optimizable):** Preferred off-days (e.g. preferring Sunday), keeping pod members together.
* When demand exceeds workforce supply, rather than producing an invalid roster or violating employee rest limits, the system creates an explicit `Conflict` record and visualizes it as a **RED badge** on the Brand Matrix and in the Gaps Drawer.

### 6. Which parts of the process did you automate, and which did you leave under human control? Why?
* **Automated:**
  * Calculating operating open/closed days across varied brand calendars.
  * Standard shift distribution and rotating off-days.
  * Continuous streak enforcement (preventing >6 days without rest).
  * Gap detection and candidate backup ranking.
* **Left under Human Control (Operations Manager):**
  * Approving cross-pod reassignments or calling in an off-duty employee for comp-off.
  * Overriding client SLA requirements during emergencies.
* *Why?* Operations managers possess real-world business context (client escalation sensitivity, employee personal emergencies, overtime budgets) that an algorithm cannot fully capture. Automation handles 90% of the mechanical scheduling; human judgment resolves critical trade-offs.

### 7. If the company doubled its team and brand count, what would you change about your solution?
1. **Hierarchical Pod Partitioning:** The solver can run independently per Pod in parallel (O(N) with respect to pods), reducing computation overhead.
2. **Dedicated Shift Swap Marketplace:** Self-service portal where employees can request shift swaps with pod peers with automated validation against brand constraints.
3. **Database Indexing & Caching:** Sharded MongoDB collections indexed on `(brandId, date)` and `(employeeId, date)` with Redis caching for instantaneous month switching.

### 8. If you had one additional week to work on this, what would you improve first?
1. **Automated Roster Re-balancing (One-Click Auto-Fix):** An optimization pass (using Mixed Integer Linear Programming / Simplex solver) that automatically assigns ranked backups across all gaps without requiring individual manual clicks.
2. **Multi-Shift Time Granularity:** Support for morning, afternoon, and night shift splits (e.g., 9 AM–6 PM, 2 PM–11 PM) for 24/7 D2C brands.
3. **Slack / WhatsApp Notifications:** Webhook notifications notifying pod leads and agents whenever a published roster has changes.

---

## 📹 Demo Walkthrough Guide (3–5 Minutes)

For your submission video, follow this 4-step structure:
1. **Introduction (30s):** Show the dashboard, 32 active employees, and 14 brands (80% single-resource, 20% multi-resource).
2. **5 Perspective Views (90s):**
   * Company View (complete monthly grid).
   * Pod View (Pod Alpha, Beta, Gamma with Pod Leads).
   * Brand Coverage Matrix (show green checkmarks vs. red unstaffed badges).
   * Process View (CS, ACC, NDR volume).
   * Employee View (select Aarav Patel, show his personal schedule).
3. **Conflict Detection & Resolution (60s):**
   * Open the **Conflicts Drawer**.
   * Show the explanation for GlowSkin on Nov 15 (Aarav on leave).
   * Click **"Assign Backup"** to apply Meera Chawla (Pod Floater) -> show how the conflict clears to 100% covered!
4. **"What-If" Change Simulation (60s):**
   * Click **"Simulate Change"**.
   * Pick an employee (e.g. Rahul Singhania), mark sudden sick leave on Nov 18.
   * Click "Run Simulation".
   * Show how the system instantly catches the gap and proposes immediate resolutions.

