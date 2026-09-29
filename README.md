# Pharmacy Substitution Safety Prototype (~70% Milestone)

A deterministic, rule-based prescription substitution decision checklist, safety verification engine, and comparative experiment dashboard for pharmacy operations.

> **ACADEMIC & SOFTWARE PROTOTYPE NOTICE:**  
> This system is an academic software prototype and decision-checklist demonstrator. It uses purely synthetic, fictitious prescription data and must **never** be used for real-world clinical medication decisions.

---

## What's New in this Milestone (~70% Complete)

1. **Persistent Local Data Storage (`src/storage/index.ts`)**:
   - `IStorageAdapter` abstraction layer backed by atomic local JSON file persistence (`data/persistent_storage.json`).
   - Seamlessly persists prescriptions, medications, approved alternatives, allergies, stock telemetry, prescriber rules, follow-ups, immutable audit logs, experiment runs, and stakeholder feedback.
   - Clean architecture ready to swap with PostgreSQL/Cloud SQL without rewriting business logic.

2. **Expanded Controlled Synthetic Dataset (`src/data/syntheticDataset.ts`)**:
   - **220 Controlled Prescriptions** mapped to specific clinical edge-case scenarios.
   - **12 Synthetic Medications** across antibiotics, beta-blockers, antidiabetics, bronchodilators, and anticonvulsants.
   - **28 Approved Bioequivalent & Therapeutic Alternative Mappings**.
   - **65+ Documented Patient Allergy & Hypersensitivity Records**.
   - **Real-Time & Stale Stock Telemetry** (including simulated inventory age > 48 hours).
   - **Explicit Prescriber Restrictions** (DAW-1, Brand Medically Necessary, bioequivalent limits).
   - **Patient Physical Formulation Constraints** (dysphagia, enteral feeding tube requirements).

3. **8-Level Rule Priority Hierarchy (`src/rules/engine.ts`)**:
   - **Priority 1:** Patient Allergy & Hypersensitivity (`RULE-ALLERGY-001`) &rarr; `BLOCKED` (Critical Risk)
   - **Priority 2:** Prescriber Explicit DAW Prohibition (`RULE-PRESCRIBER-002`) &rarr; `BLOCKED` (High Risk)
   - **Priority 3:** Approved Therapeutic Equivalence Group (`RULE-APPROVAL-003`) &rarr; `BLOCKED` (High Risk)
   - **Priority 4:** Administration Route Compatibility (`RULE-ROUTE-004`) &rarr; `BLOCKED` (Critical Risk)
   - **Priority 5:** Dosage Strength Equivalence Check (`RULE-STRENGTH-005`) &rarr; `BLOCKED` (High Risk)
   - **Priority 6:** Patient Physical Formulation Constraint (`RULE-PATIENT-006`) &rarr; `NEEDS_HUMAN_REVIEW` (Medium Risk)
   - **Priority 7:** Warehouse Inventory Stock (`RULE-STOCK-007`) &rarr; `UNSUITABLE` (Low Risk)
   - **Priority 8:** Telemetry Freshness & Completeness (`RULE-DATA-008`) &rarr; `NEEDS_HUMAN_REVIEW` (Uncertainty Trigger)

4. **Multi-Alternative & Prescription-Wide Evaluation**:
   - `evaluateCandidateAlternative()` evaluates candidate medications independently with full rule-by-rule trace.
   - `evaluatePrescriptionAlternatives()` synthesizes all candidate outcomes into overall workflow actions:
     - `VALID_OPTIONS_AVAILABLE`
     - `HUMAN_REVIEW_REQUIRED`
     - `NO_VALID_OPTION`
     - `URGENT_SAFETY_REVIEW`

5. **Decision Trace Waterfall & Evidence Traceability**:
   - UI renders the exact sequential decision trace waterfall for each evaluated candidate.
   - Evidence panel displays observed value, expected condition, priority level, rule result, and decision effect.

6. **Synthetic Evidence Catalog (`src/data/evidenceCatalog.ts` & `/evidence`)**:
   - Catalog of `EVID-001` through `EVID-008` detailing synthetic pharmacopeia references, bioequivalence compendia, and clinical rationales.
   - Inspectable via interactive modal dialog across review and evidence catalog views.

7. **Experimental Uncertainty Model**:
   - Deterministic calculation based on unconfirmed allergy profiles, missing prescriber rules, and stale telemetry (> 48h).
   - Returns uncertainty score (0.00–0.95), level (`LOW`, `MEDIUM`, `HIGH`), and itemized explanatory reasons.

8. **Potential Harm & Risk Analysis**:
   - Blocked and high-risk candidates explicitly specify hazard, clinical consequence, severity, affected constraint, and preventive rule.

9. **Comparative Experimentation Harness (`/experiment`)**:
   - "Run Experiment" executes the Availability-Only Baseline vs. Multi-Constraint Priority Prototype across all 220 prescriptions.
   - Compares safety violations prevented, human review cases, and safe alternative retention.
   - Granular, filterable sample comparison table (`Safety Blocks`, `Reviews`, `Out of Stock`).

10. **Stakeholder / Pharmacist Validation & Escalation Queue (`/followups` & `/review/[id]`)**:
    - Clinicians can log validation agreements (`AGREE`, `DISAGREE`, `NEEDS_MODIFICATION`).
    - 4-Tier Escalation Levels (Level 0: Initial, Level 1: Senior Pharmacist, Level 2: Prescriber Outreach, Level 3: Urgent Safety Board).
    - Immutable override audits linked with follow-up task dispatch.

---

## Application Structure

```
├── app/
│   ├── page.tsx                     # Dashboard with Hero, metrics, & comparative charts
│   ├── layout.tsx                   # App sidebar navigation with 70% milestone links
│   ├── prescriptions/page.tsx       # Paginated ledger of 220 synthetic prescriptions
│   ├── review/[id]/page.tsx         # Multi-candidate case review, decision trace & override
│   ├── experiment/page.tsx          # Comparative Experiment Harness (Baseline vs Prototype)
│   ├── evidence/page.tsx            # Synthetic Evidence Catalog (EVID-001 to EVID-008)
│   ├── followups/page.tsx           # Multi-level escalation queue & resolution workflow
│   ├── audit/page.tsx               # Persistent audit trail with search & filter
│   ├── tests/page.tsx               # 8-rule regression test harness
│   ├── metrics/page.tsx             # Safety and performance comparison metrics
│   ├── requirements/page.tsx        # Traceability matrix & priority hierarchy specs
│   ├── limitations/page.tsx         # Academic prototype safety warnings & disclaimers
│   └── api/                         # Next.js Server API routes
│       ├── prescriptions/route.ts
│       ├── evaluate-substitution/route.ts
│       ├── override/route.ts
│       ├── audit/route.ts
│       ├── evidence/route.ts
│       ├── experiments/route.ts
│       ├── followups/route.ts
│       ├── validation/route.ts
│       └── metrics/route.ts
├── src/
│   ├── types/index.ts               # Core domain TypeScript interfaces
│   ├── storage/index.ts             # IStorageAdapter & persistent JSON store
│   ├── data/
│   │   ├── syntheticDataset.ts      # 220 prescriptions, 12 meds, 28 rules, 65+ allergies
│   │   ├── evidenceCatalog.ts       # Synthetic evidence references EVID-001..008
│   │   └── store.ts                 # Export barrel & backward compatibility
│   ├── rules/
│   │   ├── engine.ts                # 8-priority deterministic rules engine & traces
│   │   └── baseline.ts              # Availability-only baseline comparison evaluator
│   └── services/
│       ├── metrics.ts               # Dataset-wide safety metrics calculator
│       └── experimentService.ts     # Batch comparative benchmark execution engine
```

---

## REST API Endpoints

- `GET /api/prescriptions` - List/search synthetic prescriptions (with `limit`, `offset`, `search`)
- `GET /api/prescriptions?id=RX-1001` - Fetch single prescription
- `POST /api/evaluate-substitution` - Evaluate candidate or all candidates (`evaluateAll: true`)
- `POST /api/override` - Record clinician override to persistent audit log & follow-up queue
- `GET /api/audit` - Retrieve all persistent audit trail entries
- `GET /api/evidence` - Query synthetic evidence catalog by `ruleId` or `evidenceId`
- `GET /api/experiments` - Retrieve past experiment run history
- `POST /api/experiments` - Execute full 220-prescription comparative benchmark
- `GET /api/followups` - Query follow-up tasks with `status` and `priority` filtering
- `PUT /api/followups` - Escalate or resolve follow-up items
- `GET /api/validation` - Retrieve stakeholder clinical validation feedback
- `POST /api/validation` - Submit pharmacist agreement/feedback
- `GET /api/metrics` - Real-time safety metrics and catch rates

---

## Development

```bash
npm install
npm run dev
```

Build and compile verification:
```bash
npm run build
```
