# Pharmacy Substitution Safety Prototype (100% Final Release)

A deterministic, rule-based prescription substitution decision checklist, safety verification engine, and comparative experiment dashboard for pharmacy operations research.

> **ACADEMIC & SOFTWARE PROTOTYPE NOTICE:**  
> This system is an academic software prototype and safety checklist demonstrator. It uses exclusively synthetic, fictitious pharmacy and patient data. It does not provide medical advice and must **never** be used for real-world clinical medication decisions. All benchmark results represent synthetic experimental scenarios.

---

## Executive Summary & Final Release Highlights

This 100% final release completes the prototype into an end-to-end pharmacy substitution decision verification and comparative evaluation system:

1. **Deterministic 8-Priority Rules Engine (`src/rules/engine.ts`)**:
   - Strictly ordered rule priorities: Allergy (P1) &rarr; Prescriber DAW Prohibition (P2) &rarr; Therapeutic Equivalence Approval (P3) &rarr; Route Compatibility (P4) &rarr; Strength Equivalence (P5) &rarr; Patient Formulation Constraint (P6) &rarr; Warehouse Stock (P7) &rarr; Telemetry Freshness & Completeness (P8).
   - Independent evaluation of every candidate alternative (`evaluateCandidateAlternative()`) followed by prescription-wide synthesis (`evaluatePrescriptionAlternatives()`).
   - Granular candidate outcomes: `VALID_OPTION`, `BLOCKED`, `UNSUITABLE`, `NEEDS_HUMAN_REVIEW`.
   - Overall case workflow statuses: `VALID_OPTIONS_AVAILABLE`, `HUMAN_REVIEW_REQUIRED`, `NO_VALID_OPTION`, `URGENT_SAFETY_REVIEW`.

2. **Three Canonical Demonstration Cases (`/demo`)**:
   - **Case A (`RX-DEMO-A`) — Unsafe Alternatives Blocked**: Multi-candidate safety filtering where `BioCillin` (allergic) is blocked, `Allerpen` (zero stock) is marked unsuitable, and `SafeCillin` (bioequivalent, in stock) is retained as a valid option.
   - **Case B (`RX-DEMO-B`) — Human Review Required**: Physical patient formulation constraint (dysphagia / cannot swallow large tablets) and telemetry staleness triggers a mandatory human pharmacist review before substitution.
   - **Case C (`RX-DEMO-C`) — No Valid Option Remaining**: All candidates blocked by prescriber DAW-1, multiple allergies, and stock exhaustion. Automatically creates a High-Priority follow-up task with assigned owner, due date, and multi-tier escalation path.

3. **Persistent Local Data Storage (`src/storage/index.ts`)**:
   - `IStorageAdapter` abstraction layer backed by atomic local JSON file persistence (`data/persistent_storage.json`).
   - Persists prescriptions, medications, approved alternatives, allergies, stock telemetry, prescriber rules, follow-ups, immutable audit logs with cryptographic hash chains, experiment runs, and stakeholder feedback.
   - Decoupled architecture ready to swap with PostgreSQL, Cloud SQL, or SQLite without rewriting business logic.

4. **Expanded Controlled Synthetic Dataset (`src/data/syntheticDataset.ts`)**:
   - **220 Controlled Prescriptions** mapped to specific clinical scenarios and edge cases.
   - **12 Synthetic Medications** across antibiotics, beta-blockers, antidiabetics, bronchodilators, and anticonvulsants.
   - **28 Approved Bioequivalent & Therapeutic Alternative Mappings**.
   - **65+ Documented Patient Allergy & Hypersensitivity Records**.
   - **Real-Time & Stale Stock Telemetry** (including simulated inventory age > 48 hours).
   - **Explicit Prescriber Restrictions** (DAW-1, Brand Medically Necessary, bioequivalent limits).
   - **Patient Physical Formulation Constraints** (dysphagia, enteral feeding tube requirements).

5. **Decision Trace Waterfall & Evidence Traceability (`src/data/evidenceCatalog.ts` & `/evidence`)**:
   - Renders exact sequential decision waterfall traces for every candidate.
   - Evidence panel displays observed value, expected condition, priority level, rule result, and decision effect.
   - Synthetic Evidence Catalog (`EVID-001` through `EVID-008`) detailing synthetic pharmacopeia references, bioequivalence compendia, and clinical rationales.

6. **Experimental Uncertainty Model & Potential Harm Analysis**:
   - Deterministic calculation based on unconfirmed allergy profiles (+0.25), missing prescriber rules (+0.15), and stale stock telemetry (+0.20).
   - Returns uncertainty score (0.05–0.95), level (`LOW`, `MEDIUM`, `HIGH`), and itemized explanatory reasons.
   - Potential harm analysis itemizes hazard, clinical consequence, severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), affected constraint, and preventive rule.

7. **Comparative Experimentation Harness (`/experiment`)**:
   - "Run Experiment" executes the Availability-Only Baseline vs. Multi-Constraint Priority Prototype across all 220 prescriptions.
   - Proves **0.0% Unsafe Substitution Rate** for the prototype vs. **38.6% Unsafe Substitution Rate** for the baseline.
   - Interactive, filterable error analysis and sample comparison tables.

8. **Human Review, Override Workflow & Audit Trail (`/review/[id]` & `/audit`)**:
   - Review actions: `CONFIRM`, `REJECT`, `REQUEST_CLARIFICATION`.
   - Strict override governance: Reviewer name, candidate, and clinical reason are strictly required (`"Override reason is required for auditability."`).
   - Role-based authorization prevents non-pharmacist roles from overriding safety blocks.
   - Cryptographic hash-chained audit log with integrity verification.

9. **Follow-up Queue & 4-Tier Escalation Pipeline (`/followups`)**:
   - Automatic overdue case detection with high-visibility warnings for High and Critical priority tasks.
   - 4-Tier Escalation Levels (L0: Initial, L1: Senior Pharmacist, L2: Prescriber Outreach, L3: Urgent Safety Board).
   - All escalation and resolution actions automatically recorded to the audit log.

10. **Verification & Quality Suite**:
    - **Quality Gate (`/quality-gate`)**: 19 automated operational checks across architecture, safety rules, workflows, and experiment validity.
    - **Regression Test Harness (`/tests`)**: 8 deterministic test cases validating all 8 priority levels.
    - **Error Analysis (`/error-analysis`)**: Granular discrepancy inspection between baseline and prototype.
    - **Data Quality Auditor (`/data-quality`)**: Verifies referential integrity, schema adherence, and telemetry freshness.
    - **System Health Monitor (`/system-health`)**: Subsystem latency and component status monitoring.

---

## Rule Priority Hierarchy

The authoritative decision engine enforces the following strict 8-level priority sequence:

| Priority | Rule ID | Description | Default Decision Effect | Risk Level |
|---|---|---|---|---|
| **1** | `RULE-ALLERGY-001` | Patient Hypersensitivity & Cross-Reactivity Screen | `BLOCKED` | `CRITICAL` / `HIGH` |
| **2** | `RULE-PRESCRIBER-002` | Prescriber Dispense as Written (DAW-1) Prohibition | `BLOCKED` | `HIGH` |
| **3** | `RULE-APPROVAL-003` | Approved Bioequivalent & Therapeutic Equivalence Check | `BLOCKED` | `HIGH` |
| **4** | `RULE-ROUTE-004` | Administration Route Compatibility Barrier | `BLOCKED` | `CRITICAL` |
| **5** | `RULE-STRENGTH-005` | Dosage Strength & Concentration Equivalence Check | `BLOCKED` | `HIGH` |
| **6** | `RULE-PATIENT-006` | Patient Physical Formulation Constraint (e.g. Dysphagia) | `NEEDS_HUMAN_REVIEW` | `MEDIUM` |
| **7** | `RULE-STOCK-007` | Physical Warehouse Inventory & Stock Availability | `UNSUITABLE` | `LOW` |
| **8** | `RULE-DATA-008` | Telemetry Freshness & Information Completeness Screen | `NEEDS_HUMAN_REVIEW` | `MEDIUM` |

---

## Canonical Demonstration Scenarios

Accessible directly from the navigation bar under **Demo Scenarios** (`/demo`):

### Case A: Unsafe Alternatives Blocked (`RX-DEMO-A`)
- **Prescription:** Amoxicillin 100 mg Oral Once Daily (`PAT-DEMO-A`).
- **Context:** Patient has documented allergy to `BioCillin (MED-B)`.
- **Candidates Evaluated:**
  - `BioCillin (MED-B)` &rarr; **BLOCKED** (Priority 1 Allergy Conflict; Critical Risk).
  - `Allerpen (MED-C)` &rarr; **UNSUITABLE** (Priority 7 Stock Depleted = 0 units).
  - `SafeCillin (MED-D)` &rarr; **VALID OPTION** (Approved, in stock, allergy-safe).
- **Overall Case Status:** `VALID_OPTIONS_AVAILABLE`.

### Case B: Formulation Constraint Triggering Human Review (`RX-DEMO-B`)
- **Prescription:** Amoxicillin 100 mg Oral Once Daily (`PAT-DEMO-B`).
- **Context:** Patient constraint notes "Cannot swallow large solid tablets (severe dysphagia)".
- **Candidates Evaluated:**
  - `HeavyCillin (MED-E)` (Large solid tablet) &rarr; **NEEDS HUMAN REVIEW** (Priority 6 Formulation Constraint).
  - Associated Uncertainty Score: `0.35` (Medium).
- **Overall Case Status:** `HUMAN_REVIEW_REQUIRED`.
- **Reviewer Action:** Pharmacist can confirm, reject, or request prescriber clarification for oral liquid suspension.

### Case C: Safety Exhaustion & Auto Follow-Up Dispatch (`RX-DEMO-C`)
- **Prescription:** Amoxicillin 100 mg Oral Once Daily (`PAT-DEMO-C`).
- **Context:** Prescriber explicitly set DAW-1; patient is allergic to `BioCillin` and `SafeCillin`; remaining alternatives out of stock.
- **Candidates Evaluated:** All candidates blocked or unsuitable.
- **Overall Case Status:** `NO_VALID_OPTION`.
- **Automatic System Action:** Automatically dispatches a **HIGH/CRITICAL Priority Follow-Up** to `PHARM-CLINICAL-QUEUE` with a 24-hour due date and Level 1 escalation.

---

## Directory Structure

```
├── app/
│   ├── page.tsx                     # Dashboard with Hero, metrics, & comparative charts
│   ├── layout.tsx                   # App sidebar navigation with all module links
│   ├── demo/page.tsx                # Canonical Demonstration Scenarios (Cases A, B, C)
│   ├── prescriptions/page.tsx       # Paginated ledger of 220 synthetic prescriptions
│   ├── review/[id]/page.tsx         # Multi-candidate case review, decision trace & override
│   ├── experiment/page.tsx          # Comparative Experiment Harness (Baseline vs Prototype)
│   ├── evidence/page.tsx            # Synthetic Evidence Catalog (EVID-001 to EVID-008)
│   ├── followups/page.tsx           # Multi-level escalation queue & overdue management
│   ├── audit/page.tsx               # Persistent audit trail with cryptographic hash checks
│   ├── quality-gate/page.tsx        # 19-point automated quality gate verification
│   ├── tests/page.tsx               # 8-rule regression test harness
│   ├── error-analysis/page.tsx      # Granular discrepancy analysis between algorithms
│   ├── data-quality/page.tsx        # Automated synthetic dataset integrity auditing
│   ├── system-health/page.tsx       # Subsystem health, memory, and latency monitor
│   ├── metrics/page.tsx             # Safety and performance comparison metrics
│   ├── requirements/page.tsx        # Traceability matrix & priority hierarchy specs
│   ├── limitations/page.tsx         # Academic prototype safety warnings & disclaimers
│   └── api/                         # Next.js Server API routes
│       ├── prescriptions/route.ts   # Prescription ledger queries and creation
│       ├── evaluate-substitution/route.ts # Decision engine evaluation endpoint
│       ├── override/route.ts        # Clinician override validation and audit logging
│       ├── human-review/route.ts    # Human confirmation recording and queries
│       ├── audit/route.ts           # Audit trail queries and hash chain verification
│       ├── evidence/route.ts        # Synthetic evidence catalog queries
│       ├── experiments/route.ts     # Comparative experiment execution and runs
│       ├── followups/route.ts       # Follow-up queue management and escalation
│       ├── validation/route.ts      # Stakeholder feedback recording
│       ├── metrics/route.ts         # Dataset-wide safety metric calculations
│       ├── health/route.ts          # Storage and subsystem health check
│       ├── data-quality/route.ts    # Synthetic data integrity auditing
│       ├── error-analysis/route.ts  # Algorithm comparison discrepancy report
│       └── export/route.ts          # CSV/JSON data export for analysis
├── data/
│   └── persistent_storage.json      # Atomic persistent JSON database file
├── src/
│   ├── types/index.ts               # Complete domain TypeScript interfaces
│   ├── storage/index.ts             # IStorageAdapter & persistent storage implementation
│   ├── data/
│   │   ├── syntheticDataset.ts      # 220 controlled prescriptions, 12 meds, rules, stock
│   │   ├── evidenceCatalog.ts       # Synthetic evidence references EVID-001..008
│   │   └── store.ts                 # Export barrel & backward compatibility
│   ├── rules/
│   │   ├── engine.ts                # Deterministic 8-priority rules engine & traces
│   │   └── baseline.ts              # Availability-only baseline comparison evaluator
│   └── services/
│       ├── metrics.ts               # Dataset-wide safety metrics calculator
│       └── experimentService.ts     # Batch comparative benchmark execution engine
```

---

## REST API Reference

All routes are fully functional and backed by persistent storage:

| Endpoint | Method | Description |
|---|---|---|
| `/api/prescriptions` | `GET` | List/search synthetic prescriptions (`limit`, `offset`, `search`, `id`) |
| `/api/prescriptions` | `POST` | Create a new synthetic prescription |
| `/api/evaluate-substitution` | `POST` | Evaluate a single candidate or all candidates (`evaluateAll: true`) |
| `/api/override` | `POST` | Record clinician override with mandatory reason and RBAC validation |
| `/api/human-review` | `GET` | Retrieve human review decisions filtered by `caseId` |
| `/api/human-review` | `POST` | Record human review action (`CONFIRM`, `REJECT`, `REQUEST_CLARIFICATION`) |
| `/api/followups` | `GET` | Query follow-up tasks with `status` and `priority` filtering |
| `/api/followups` | `POST` | Create a new clinical follow-up task |
| `/api/followups` | `PUT` | Escalate or resolve follow-up items; auto-logs to audit trail |
| `/api/audit` | `GET` | Retrieve audit logs with cryptographic hash chain integrity status |
| `/api/evidence` | `GET` | Query synthetic evidence catalog (`ruleId`, `evidenceId`) |
| `/api/experiments` | `GET` | Retrieve past comparative experiment run records |
| `/api/experiments` | `POST` | Execute full 220-prescription comparative benchmark |
| `/api/metrics` | `GET` | Calculate and return dataset-wide comparative safety metrics |
| `/api/health` | `GET` | Subsystem health, storage status, and entity counts |
| `/api/data-quality` | `GET` | Run automated synthetic dataset integrity check |
| `/api/error-analysis` | `GET` | Discrepancy analysis between baseline and prototype |
| `/api/export` | `GET` | Export dataset, audit trail, or metrics as JSON/CSV |

---

## Development & Verification

### Running the Prototype

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev
```

### Production Build & Compilation

```bash
npm run build
```

### Automated Quality Verification

Navigate to the **Quality Gate** (`/quality-gate`) in the application to run all 19 operational health checks, or visit the **Test Harness** (`/tests`) to execute the 8 core regression test cases.
