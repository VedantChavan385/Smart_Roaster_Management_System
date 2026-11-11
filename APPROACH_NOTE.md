# Approach Note: Smart Roster Management System
> **DataStraw Tech Internship Assessment**  
> **Author:** Vedant Chavan  
> **Topic:** Solution Overview, Architecture, and Key Decisions  

---

## 1. Solution Overview

Managing operations across multi-brand D2C agencies presents a core scheduling challenge: **how to balance strict client demand (365-day coverage, varying process requirements) against human constraints (leaves, off-day limits, skill specializations) without burning out staff or breaching client SLAs.**

Instead of a passive spreadsheet or black-box scheduler, this system is designed as an **Operational Control Center**:
1. **Supply & Demand Modeling:** It dynamically aligns workforce capacities (32 agents across 3 Pods) against client operating calendars (14 brands running 365-day, Mon–Sat, or daily schedules).
2. **Deterministic Constraint Solving:** Schedules shifts in milliseconds while strictly enforcing labor rules (max 6 consecutive days, approved leave shielding).
3. **Transparent Gap Diagnostics:** When supply cannot meet demand, it highlights the exact root cause in plain English and recommends scored backups.
4. **Human-in-the-Loop Discretion:** Pod Leads maintain full control with 1-click backup assignments, quick shift edits, and interactive "What-If" leave simulations.

---

## 2. System Architecture

The solution uses a modern **MERN** architecture designed for fast response times, zero-setup portability, and clean separation of concerns:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FRONTEND (React 19 + Vite + Tailwind CSS)            │
│  - 5 Perspectives: Company, Pod, Brand Heatmap, Process, Employee     │
│  - Operations Drawer: Real-time Gap Diagnostics & 1-Click Backups      │
│  - Command Palette (Ctrl+K), Quick Shift Popover & Undo Stack          │
│  - "What-If" Absence Simulator                                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API (JSON)
┌───────────────────────────────────▼────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                         │
│  - Clean REST endpoints: /api/roster, /api/entities, /api/leaves       │
│  - Input validation, state management, and export controllers          │
├────────────────────────────────────────────────────────────────────────┤
│                    CORE SOLVER ENGINE (solver.js)                      │
│  - Stage 1: Demand Evaluation (Brand calendars & process minStaffing)  │
│  - Stage 2: Hard Constraint Shielding (Approved leaves & contracts)    │
│  - Stage 3: Dedicated Mapping (Single-resource 80% coverage expansion) │
│  - Stage 4: Multi-Resource Off Balancing (Streak limits & rotation)    │
│  - Stage 5: Coverage Gap Scanning & 4-Tier Floater Recommendation      │
├────────────────────────────────────────────────────────────────────────┤
│                    STORAGE LAYER (Dual-Mode Persistence)               │
│  - Primary: MongoDB / Mongoose for scalable production collections     │
│  - Fallback: Local JSON file cache for friction-free local execution   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Technical & Design Decisions

### Decision 1: Deterministic 5-Stage Solver vs. Stochastic / Black-Box AI
* **Context:** Shift scheduling can be solved using heuristic genetic algorithms, integer linear programming, or deterministic rule pipelines.
* **Choice:** We implemented a **multi-stage deterministic pipeline**.
* **Reasoning:** In CX operations, managers need **reproducible, explainable schedules**. If an employee asks why they were scheduled on a Saturday, a deterministic solver can clearly point to rule priorities. It executes in `<50ms` and eliminates hallucinations or random non-reproducible shifts.

### Decision 2: Distinct 80/20 Brand Resource Modeling
* **Context:** In real-world D2C agencies, ~80% of brands are small/medium accounts handled by a single dedicated agent, while ~20% are high-volume enterprise accounts staffed by multiple agents.
* **Choice:** 
  * **Single-Resource Brands (11 brands):** The sole assigned agent manages all active brand processes (`CS + ACC + NDR + Retention`) concurrently. When they are off or on leave, coverage drops to 0, immediately triggering a high-priority gap alert.
  * **Multi-Resource Brands (3 brands):** Multiple agents divide processes, and the solver staggers weekly offs between peers to keep the brand continuously operational.
* **Reasoning:** Accurately reflects agency operational economics without treating every brand identically.

### Decision 3: Tiered Suitability Scoring for Floaters (100 / 80 / 70 / 50)
* **Context:** When a sole resource goes on leave, who should cover for them?
* **Choice:** We implemented a 4-tier suitability algorithm:
  * **100 pts:** Same-pod floater on duty with required skills (zero disruption).
  * **80 pts:** Same-pod skilled agent currently on weekly off (eligible for comp-off swap).
  * **70 pts:** Cross-pod floater on duty.
  * **50 pts:** Cross-pod agent on weekly off.
* **Reasoning:** Prioritizes Pod affinity first (same team familiarity with brand tone and guidelines) before escalating cross-pod, while penalizing calling in off-duty workers.

### Decision 4: Hard Constraints vs. Soft Constraints
* **Hard Constraints (Non-Negotiable):**
  1. Approved leaves (`PLANNED`, `SICK`, `COMP_OFF`) are strictly shielded.
  2. Maximum 6 consecutive working days to prevent agent burnout.
  3. Brand operating calendars (no scheduling on official brand holidays).
* **Soft Constraints (Best Effort):**
  1. Preferred weekly off-days (e.g., Sunday preference).
  2. Pod member co-location.
* **Reasoning:** Rather than silently violating labor laws or forcing an absent employee onto a shift to make the calendar look green, the solver generates a visible `COVERAGE_GAP` conflict record with candidate suggestions.

### Decision 5: Optimistic UI with Undo Stack
* **Context:** Pod Leads frequently tweak individual shifts during peak morning planning.
* **Choice:** Roster shift modifications (via Quick Shift Popover or full edit drawer) apply optimistically to the UI with an instant **Undo** toast and background server synchronization.
* **Reasoning:** Prevents jarring screen reloads and empowers operations managers with a fluid, desktop-grade UX.

### Decision 6: Dedicated "What-If" Absence Simulation Sandbox
* **Context:** Unplanned sick leaves and sudden volume spikes are daily occurrences in CX teams.
* **Choice:** An interactive sandbox where leads can inject temporary leaves or demand surges and preview coverage impact before publishing or committing changes.
* **Reasoning:** Shifts operations from reactive panic to proactive risk assessment.

---

## 4. Trade-offs & Future Extensions

| Current Choice | Trade-off Made | Next Scaling Step (If Extended) |
| :--- | :--- | :--- |
| **Daily Shift Granularity** | Full-day shifts (Working / Off / Leave / Backup). | Add intraday time-slots (e.g. 9 AM–6 PM, 2 PM–11 PM) for 24/7 coverage. |
| **In-Process Solver** | Fast, runs synchronously within Express process. | Partition solver to run independently per Pod via background worker queues (BullMQ/Redis) at 100+ brands. |
| **Manager-Driven Backup Approval** | Requires 1-click confirmation per gap. | Introduce an optional "One-Click Auto-Heal" pass using linear programming to resolve all gaps in bulk. |
| **Dual-Mode Local Persistence** | Enables instant zero-dependency review out of the box. | Enforce strict cloud MongoDB replica sets with audit logging in enterprise deployment. |

---

## Summary
The solution treats roster management not as a static calendar problem, but as a dynamic **supply-demand optimization problem with human accountability**. By combining deterministic constraint logic with a modern, responsive UI, it gives DataStraw the operational clarity required to scale smoothly.
