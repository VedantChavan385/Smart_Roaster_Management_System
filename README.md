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

## 🧠 8. Tell Us How You Think

### 1. How did you model employees, brands, processes, pods, and their relationships?
* **Pod**: Operational squads led by a Pod Lead (e.g., Pod Alpha, Beta, Gamma) that act as the primary team boundary.
* **Brand**: Belongs to a Pod. Specifies its operating calendar (e.g., `365_DAYS`, `MON_SAT`) and the daily processes it needs (`CS`, `ACC`, `NDR`, `Retention`).
* **Employee**: Belongs to a Pod, holds specific skills, has a weekly off quota (1 or 2 days/week), and assigned brands. Employees without assigned brands serve as **Pod Floaters / Backups**.
* **Relationship**: Dedicated employees cover their assigned Brand's processes. When they are off, available Floaters from the same Pod step in first before looking cross-pod.

### 2. How does your system generate a roster and determine whether it satisfies the required constraints?
The system uses a **5-step deterministic solver**:
1. **Demand Mapping**: Calculates exact required staff for every brand process on each calendar date.
2. **Leave Shielding (Hard Rule)**: Locks approved leaves (`PLANNED`, `SICK`, `COMP_OFF`) — employees on leave are never scheduled.
3. **Primary Deployment**: Schedules dedicated employees to their brands (for single-resource brands, one shift covers all brand processes).
4. **Rest Day Balancing**: Enforces a maximum of 6 consecutive working days and respects off-day preferences.
5. **Constraint Validation**: Scans assigned staff against required demand. Any shortfall is flagged as a `COVERAGE_GAP` conflict with root cause diagnostics.

### 3. How did you handle the difference between single-resource brands and brands with multiple employees?
* **Single-Resource Brands (~80% of accounts)**: One dedicated generalist manages all processes (CS + ACC + NDR) simultaneously. Because there is zero built-in redundancy, any weekly off or leave directly creates a coverage gap that requires a backup.
* **Multi-Resource Brands (~20% of accounts)**: High-volume brands staffed by 2 to 4 specialists. The solver staggers and rotates their weekly offs so the brand stays continuously covered without dropping below minimum required headcount.

### 4. What happens when an employee manages all processes for a brand but is unavailable on a required working day?
* The solver strictly honors their leave (never forces an impossible shift).
* Coverage for all brand processes drops to 0 on that date.
* The system flags a **Critical Coverage Gap** explaining the exact reason (e.g., *"Aarav Patel on planned leave for Family Event"*).
* The recommendation engine scores and ranks the best available replacement candidates (e.g., a same-pod floater on duty) so the manager can fill the gap in one click.

### 5. How does your system handle conflicting requirements or insufficient staffing?
* **Strict Rule Hierarchy**: Hard constraints (approved leaves, contract rest days) always take priority over soft constraints (preferred off days).
* **Transparent Alerting**: If total staffing is insufficient, the system never silently breaks rules or fakes coverage. It produces an explicit conflict and highlights the gap with a red badge on the Brand Coverage Matrix and Conflicts Drawer.
* **Ranked Recommendations**: It evaluates all available staff and suggests the best backup using a 4-tier suitability score (same-pod floater > same-pod peer on off-day > cross-pod floater > cross-pod peer).

### 6. Which parts of the process did you automate, and which did you leave under human control? Why?
* **Automated**: Calendar demand calculation, daily shift assignments, leave shielding, streak limit checks (max 6 days), gap detection, and backup candidate ranking.
* **Human Control**: Final approval of backup assignments, manual shift edits/swaps, and handling emergency overrides.
* **Why**: Algorithms excel at calculating hundreds of rules, dates, and constraints in milliseconds, but operations managers possess real-world business context (client relationships, budget for comp-offs, personal emergencies) needed for final decision-making.

### 7. If the company doubled its team and brand count, what would you change about your solution?
1. **Pod-by-Pod Parallel Solving**: Partition and solve each Pod independently in parallel rather than running a single monolithic solver pass.
2. **Database Indexing & Caching**: Add compound indexes on `(brandId, date)` and cache monthly schedule views.
3. **Table Virtualization**: Implement virtual scrolling (`@tanstack/react-virtual`) on the roster grid so rendering 60+ employees and 30+ brands remains lightning-fast.
4. **Peer Shift-Swap System**: Add self-service swap requests where agents can trade shifts, with automated validation before manager sign-off.

### 8. If you had one additional week to work on this, what would you improve first?
1. **1-Click Auto-Resolve**: A single button that automatically assigns the highest-scoring backup to all detected gaps across the entire month.
2. **Multi-Shift Time Granularity**: Support for morning, evening, and night shift slots (e.g., 9 AM–6 PM, 2 PM–11 PM) for 24/7 D2C brands.
3. **Live Sync & Alerts**: Push notifications and `.ics` calendar sync (Google Calendar / Outlook) so agents are instantly updated on shift changes.

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

