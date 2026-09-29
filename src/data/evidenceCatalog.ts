import { EvidenceCatalogItem } from '../types';

export const SYNTHETIC_EVIDENCE_CATALOG: Record<string, EvidenceCatalogItem> = {
  "EVID-001": {
    evidenceId: "EVID-001",
    ruleId: "RULE-ALLERGY-001",
    title: "Synthetic Hypersensitivity & Cross-Reactivity Standard",
    sourceType: "Synthetic Pharmacopeia Guideline",
    description: "Evaluates documented patient substance allergies and known cross-sensitivities before substitution is permitted. Automatic hard block on any candidate sharing substance ID or molecular allergen core.",
    version: "2026.3-SYNTH",
    effectiveDate: "2026-01-15",
    syntheticReference: "SYNTH-CLIN-REF-ALLERGY-01",
    status: "ACTIVE",
    clinicalRationale: "Substitutions involving known patient drug allergies present imminent risk of anaphylaxis or hypersensitivity reaction. Priority 1 prohibition with zero override tolerance without verified re-challenge protocol."
  },
  "EVID-002": {
    evidenceId: "EVID-002",
    ruleId: "RULE-PRESCRIBER-002",
    title: "Synthetic Prescriber Autonomy & DAW Restriction Protocol",
    sourceType: "Synthetic Formulary Compendium",
    description: "Enforces prescriber explicit instructions regarding 'Dispense As Written' (DAW-1) or named alternative restrictions. Enforces legal and clinical directives established by the ordering clinician.",
    version: "2026.1-SYNTH",
    effectiveDate: "2026-02-01",
    syntheticReference: "SYNTH-MED-DIRECTIVE-DAW-02",
    status: "ACTIVE",
    clinicalRationale: "Prescribers who explicitly prohibit substitution often have specific clinical rationale (e.g. narrow therapeutic index, prior adverse reaction, brand-specific stability). Priority 2 directive."
  },
  "EVID-003": {
    evidenceId: "EVID-003",
    ruleId: "RULE-APPROVAL-003",
    title: "Synthetic Bioequivalence & Therapeutic Equivalence Formulary",
    sourceType: "Synthetic Bioequivalence Rule",
    description: "Verifies that the candidate alternative is cataloged within the approved therapeutic substitution matrix with proven chemical and biological equivalence.",
    version: "2026.4-SYNTH",
    effectiveDate: "2026-03-01",
    syntheticReference: "SYNTH-FDA-ORANGE-EQUIV-03",
    status: "ACTIVE",
    clinicalRationale: "Non-approved chemical entities or unvetted generic formulations can result in therapeutic failure or untracked toxicities. Priority 3 barrier."
  },
  "EVID-004": {
    evidenceId: "EVID-004",
    ruleId: "RULE-ROUTE-004",
    title: "Synthetic Administration Route Compatibility Matrix",
    sourceType: "Synthetic Clinical Administration Guide",
    description: "Cross-checks the route of administration specified on the prescription (e.g. Oral, Inhalation, IV) against the approved routes for the replacement product.",
    version: "2026.2-SYNTH",
    effectiveDate: "2026-01-20",
    syntheticReference: "SYNTH-ROUTE-ADMIN-GUIDE-04",
    status: "ACTIVE",
    clinicalRationale: "Route mismatches (e.g. substituting an oral suspension for an inhaler, or topical for parenteral) represent severe medication delivery errors. Priority 4 barrier."
  },
  "EVID-005": {
    evidenceId: "EVID-005",
    ruleId: "RULE-STRENGTH-005",
    title: "Synthetic Dosage Exposure & Potency Equivalence Table",
    sourceType: "Synthetic Bioequivalence Rule",
    description: "Validates that the alternative dosage strength corresponds to an approved single-dose equivalent exposure without requiring unverified multi-unit conversions.",
    version: "2026.2-SYNTH",
    effectiveDate: "2026-02-15",
    syntheticReference: "SYNTH-DOSE-POTENCY-TABLE-05",
    status: "ACTIVE",
    clinicalRationale: "Uncontrolled strength substitutions can cause supra-therapeutic toxicity or sub-therapeutic underdosing. Priority 5 barrier."
  },
  "EVID-006": {
    evidenceId: "EVID-006",
    ruleId: "RULE-PATIENT-006",
    title: "Synthetic Patient Physical & Physiological Constraint Bulletin",
    sourceType: "Synthetic Patient Safety Bulletin",
    description: "Screens for patient-specific physical delivery constraints (e.g. swallowing difficulties/dysphagia, feeding tube compatibility, sugar intolerance) against candidate physical formulation.",
    version: "2026.1-SYNTH",
    effectiveDate: "2026-03-10",
    syntheticReference: "SYNTH-PATIENT-CONSTRAINT-BULLETIN-06",
    status: "ACTIVE",
    clinicalRationale: "Physical formulation incompatibilities do not immediately kill the patient but can cause choking, inability to ingest medication, or non-compliance. Priority 6 requires human pharmacist review."
  },
  "EVID-007": {
    evidenceId: "EVID-007",
    ruleId: "RULE-STOCK-007",
    title: "Synthetic Inventory Availability & Warehouse Stock Ledger",
    sourceType: "Synthetic Pharmacy Logistics Ledger",
    description: "Confirms real-time shelf quantity in the dispensing warehouse. Marks alternative as UNSUITABLE if inventory quantity is zero.",
    version: "2026.5-SYNTH",
    effectiveDate: "2026-04-01",
    syntheticReference: "SYNTH-INVENTORY-LEDGER-07",
    status: "ACTIVE",
    clinicalRationale: "An otherwise safe and approved drug cannot be dispensed if physical stock is absent. Priority 7 marks product as unsuitable but not safety-blocked."
  },
  "EVID-008": {
    evidenceId: "EVID-008",
    ruleId: "RULE-DATA-008",
    title: "Synthetic Data Freshness & Clinical Completeness Threshold",
    sourceType: "Synthetic Quality Assurance Standard",
    description: "Analyzes telemetry staleness (e.g. stock count > 24 hours old) and missing patient profile attributes (e.g. allergy status unconfirmed or missing prescriber restriction record).",
    version: "2026.2-SYNTH",
    effectiveDate: "2026-04-10",
    syntheticReference: "SYNTH-DATA-INTEGRITY-STD-08",
    status: "ACTIVE",
    clinicalRationale: "Incomplete or stale information introduces clinical uncertainty. Rather than silently passing, the engine elevates the uncertainty metric and triggers human pharmacist review."
  }
};
