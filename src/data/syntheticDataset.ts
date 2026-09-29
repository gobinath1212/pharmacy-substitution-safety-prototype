import { Medication, Prescription, ApprovedAlternative, Allergy, Stock, PrescriberRule, FollowUp, AuditLogEntry, SystemContext, StakeholderFeedback } from '../types';
import { SYNTHETIC_EVIDENCE_CATALOG } from './evidenceCatalog';

export const BASE_DATE = "2026-09-07T00:00:00.000Z";
export const STALE_DATE = "2026-09-02T00:00:00.000Z"; // 5 days old (> 24 hours stale)

// 12 Synthetic Medications covering antibiotics, beta-blockers, antidiabetics, bronchodilators, anticonvulsants
export const MEDICATIONS: Record<string, Medication> = {
  "MED-A": { id: "MED-A", name: "SynthCillin", class: "Antibiotic (Penicillin)", formulation: "Tablet", strength: "100 mg", route: "Oral", genericName: "Synthetic Penicillin V", bioequivalentGroup: "AB-01" },
  "MED-B": { id: "MED-B", name: "BioCillin", class: "Antibiotic (Penicillin)", formulation: "Capsule", strength: "100 mg", route: "Oral", genericName: "Bio-Amoxicillin", bioequivalentGroup: "AB-01" },
  "MED-C": { id: "MED-C", name: "Allerpen", class: "Antibiotic (Penicillin Derivative)", formulation: "Tablet", strength: "100 mg", route: "Oral", genericName: "Aller-Ampicillin", bioequivalentGroup: "AB-01" },
  "MED-D": { id: "MED-D", name: "SafeCillin", class: "Antibiotic (Penicillin)", formulation: "Oral Suspension", strength: "100 mg/5mL", route: "Oral", genericName: "Pediatric Bio-Amoxicillin", bioequivalentGroup: "AB-01" },
  "MED-E": { id: "MED-E", name: "HeavyCillin", class: "Antibiotic (Penicillin)", formulation: "Large Tablet", strength: "100 mg", route: "Oral", genericName: "SynthCillin Extended", bioequivalentGroup: "AB-01" },
  "MED-F": { id: "MED-F", name: "CardioPro", class: "Beta-Blocker", formulation: "Tablet", strength: "25 mg", route: "Oral", genericName: "Synth-Metoprolol Tartrate", bioequivalentGroup: "BB-02" },
  "MED-G": { id: "MED-G", name: "Vascocil ER", class: "Beta-Blocker", formulation: "Extended-Release Tablet", strength: "25 mg", route: "Oral", genericName: "Synth-Metoprolol Succinate", bioequivalentGroup: "BB-02" },
  "MED-H": { id: "MED-H", name: "NeuroCalm", class: "Anticonvulsant", formulation: "Capsule", strength: "100 mg", route: "Oral", genericName: "Synth-Gabapentin", bioequivalentGroup: "NC-03" },
  "MED-I": { id: "MED-I", name: "GlycoForm", class: "Antidiabetic", formulation: "Tablet", strength: "500 mg", route: "Oral", genericName: "Synth-Metformin HCl", bioequivalentGroup: "AD-04" },
  "MED-J": { id: "MED-J", name: "GlycoNorm Liquid", class: "Antidiabetic", formulation: "Oral Solution", strength: "500 mg/5mL", route: "Oral", genericName: "Synth-Metformin Solution", bioequivalentGroup: "AD-04" },
  "MED-K": { id: "MED-K", name: "RespiClear HFA", class: "Bronchodilator", formulation: "Inhaler", strength: "90 mcg", route: "Inhalation", genericName: "Synth-Albuterol HFA", bioequivalentGroup: "BD-05" },
  "MED-L": { id: "MED-L", name: "RespiMist Neb", class: "Bronchodilator", formulation: "Nebulizer Solution", strength: "2.5 mg/3mL", route: "Inhalation", genericName: "Synth-Albuterol Nebules", bioequivalentGroup: "BD-05" },
};

// 28 Approved Alternative relationships with strict allowed strengths and routes
export const APPROVED_ALTERNATIVES: ApprovedAlternative[] = [
  // SynthCillin (MED-A) approved mappings
  { sourceMedicationId: "MED-A", alternativeMedicationId: "MED-B", approvalStatus: "APPROVED", allowedStrengths: ["100 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-01" },
  { sourceMedicationId: "MED-A", alternativeMedicationId: "MED-C", approvalStatus: "APPROVED", allowedStrengths: ["100 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-02" },
  { sourceMedicationId: "MED-A", alternativeMedicationId: "MED-D", approvalStatus: "APPROVED", allowedStrengths: ["100 mg/5mL"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-03" },
  { sourceMedicationId: "MED-A", alternativeMedicationId: "MED-E", approvalStatus: "APPROVED", allowedStrengths: ["100 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-04" },
  
  // BioCillin (MED-B) approved mappings
  { sourceMedicationId: "MED-B", alternativeMedicationId: "MED-A", approvalStatus: "APPROVED", allowedStrengths: ["100 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-05" },
  { sourceMedicationId: "MED-B", alternativeMedicationId: "MED-D", approvalStatus: "APPROVED", allowedStrengths: ["100 mg/5mL"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-06" },
  { sourceMedicationId: "MED-B", alternativeMedicationId: "MED-E", approvalStatus: "APPROVED", allowedStrengths: ["100 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-07" },

  // Allerpen (MED-C) approved mappings
  { sourceMedicationId: "MED-C", alternativeMedicationId: "MED-A", approvalStatus: "APPROVED", allowedStrengths: ["100 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-08" },
  { sourceMedicationId: "MED-C", alternativeMedicationId: "MED-B", approvalStatus: "APPROVED", allowedStrengths: ["100 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-09" },

  // SafeCillin (MED-D) approved mappings
  { sourceMedicationId: "MED-D", alternativeMedicationId: "MED-A", approvalStatus: "APPROVED", allowedStrengths: ["100 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-10" },
  { sourceMedicationId: "MED-D", alternativeMedicationId: "MED-B", approvalStatus: "APPROVED", allowedStrengths: ["100 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-11" },

  // HeavyCillin (MED-E) approved mappings
  { sourceMedicationId: "MED-E", alternativeMedicationId: "MED-A", approvalStatus: "APPROVED", allowedStrengths: ["100 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-12" },
  { sourceMedicationId: "MED-E", alternativeMedicationId: "MED-B", approvalStatus: "APPROVED", allowedStrengths: ["100 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-13" },
  { sourceMedicationId: "MED-E", alternativeMedicationId: "MED-D", approvalStatus: "APPROVED", allowedStrengths: ["100 mg/5mL"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-14" },

  // CardioPro (MED-F) and Vascocil ER (MED-G)
  { sourceMedicationId: "MED-F", alternativeMedicationId: "MED-G", approvalStatus: "APPROVED", allowedStrengths: ["25 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-15" },
  { sourceMedicationId: "MED-G", alternativeMedicationId: "MED-F", approvalStatus: "APPROVED", allowedStrengths: ["25 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-16" },

  // GlycoForm (MED-I) and GlycoNorm (MED-J)
  { sourceMedicationId: "MED-I", alternativeMedicationId: "MED-J", approvalStatus: "APPROVED", allowedStrengths: ["500 mg/5mL"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-17" },
  { sourceMedicationId: "MED-J", alternativeMedicationId: "MED-I", approvalStatus: "APPROVED", allowedStrengths: ["500 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-18" },

  // RespiClear (MED-K) and RespiMist (MED-L)
  { sourceMedicationId: "MED-K", alternativeMedicationId: "MED-L", approvalStatus: "APPROVED", allowedStrengths: ["2.5 mg/3mL"], allowedRoutes: ["Inhalation"], substitutionRuleId: "RULE-19" },
  { sourceMedicationId: "MED-L", alternativeMedicationId: "MED-K", approvalStatus: "APPROVED", allowedStrengths: ["90 mcg"], allowedRoutes: ["Inhalation"], substitutionRuleId: "RULE-20" },

  // Cross-class or strength-restricted test mappings
  { sourceMedicationId: "MED-H", alternativeMedicationId: "MED-F", approvalStatus: "NOT_APPROVED", allowedStrengths: [], allowedRoutes: [], substitutionRuleId: "RULE-21" },
  { sourceMedicationId: "MED-A", alternativeMedicationId: "MED-F", approvalStatus: "NOT_APPROVED", allowedStrengths: [], allowedRoutes: [], substitutionRuleId: "RULE-22" },
  { sourceMedicationId: "MED-I", alternativeMedicationId: "MED-A", approvalStatus: "NOT_APPROVED", allowedStrengths: [], allowedRoutes: [], substitutionRuleId: "RULE-23" },
  { sourceMedicationId: "MED-K", alternativeMedicationId: "MED-A", approvalStatus: "NOT_APPROVED", allowedStrengths: [], allowedRoutes: [], substitutionRuleId: "RULE-24" },
  { sourceMedicationId: "MED-F", alternativeMedicationId: "MED-I", approvalStatus: "NOT_APPROVED", allowedStrengths: [], allowedRoutes: [], substitutionRuleId: "RULE-25" },
  { sourceMedicationId: "MED-B", alternativeMedicationId: "MED-C", approvalStatus: "APPROVED", allowedStrengths: ["100 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-26" },
  { sourceMedicationId: "MED-D", alternativeMedicationId: "MED-E", approvalStatus: "APPROVED", allowedStrengths: ["100 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-27" },
  { sourceMedicationId: "MED-C", alternativeMedicationId: "MED-D", approvalStatus: "APPROVED", allowedStrengths: ["100 mg/5mL"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-28" },
];

// Synthetic Stock Ledger with realistic inventory levels and stale stock flags
export const STOCK: Record<string, Stock> = {
  "MED-A": { medicationId: "MED-A", quantityAvailable: 0, warehouse: "Main Warehouse", lastUpdated: BASE_DATE, isStale: false }, // Out of stock to trigger substitution
  "MED-B": { medicationId: "MED-B", quantityAvailable: 500, warehouse: "Main Warehouse", lastUpdated: BASE_DATE, isStale: false }, // Plentiful stock
  "MED-C": { medicationId: "MED-C", quantityAvailable: 0, warehouse: "Main Warehouse", lastUpdated: BASE_DATE, isStale: false }, // Out of stock
  "MED-D": { medicationId: "MED-D", quantityAvailable: 150, warehouse: "Pediatric Annex", lastUpdated: BASE_DATE, isStale: false }, // Good stock
  "MED-E": { medicationId: "MED-E", quantityAvailable: 300, warehouse: "Main Warehouse", lastUpdated: BASE_DATE, isStale: false }, // Good stock
  "MED-F": { medicationId: "MED-F", quantityAvailable: 0, warehouse: "Main Warehouse", lastUpdated: BASE_DATE, isStale: false }, // Out of stock
  "MED-G": { medicationId: "MED-G", quantityAvailable: 240, warehouse: "Main Warehouse", lastUpdated: BASE_DATE, isStale: false }, // In stock
  "MED-H": { medicationId: "MED-H", quantityAvailable: 45, warehouse: "Controlled Vault", lastUpdated: STALE_DATE, isStale: true }, // Stale telemetry
  "MED-I": { medicationId: "MED-I", quantityAvailable: 0, warehouse: "Main Warehouse", lastUpdated: BASE_DATE, isStale: false }, // Out of stock
  "MED-J": { medicationId: "MED-J", quantityAvailable: 80, warehouse: "Main Warehouse", lastUpdated: BASE_DATE, isStale: false }, // In stock
  "MED-K": { medicationId: "MED-K", quantityAvailable: 0, warehouse: "Main Warehouse", lastUpdated: BASE_DATE, isStale: false }, // Out of stock
  "MED-L": { medicationId: "MED-L", quantityAvailable: 120, warehouse: "Respiratory Clinic", lastUpdated: STALE_DATE, isStale: true }, // Stale telemetry
};

// Prescriber Restrictions
export const PRESCRIBER_RULES: PrescriberRule[] = [
  { prescriberId: "DOC-RESTRICT", sourceMedicationId: "MED-A", substitutionAllowed: false, permittedAlternatives: [], restrictionReason: "DAW-1: Dispense as written. Patient stabilized on brand formulation." },
  { prescriberId: "DOC-STRICT-CARDIO", sourceMedicationId: "MED-F", substitutionAllowed: false, permittedAlternatives: [], restrictionReason: "Hemodynamic titration critical. Brand substitution prohibited." },
  { prescriberId: "DOC-NO-GENERIC", sourceMedicationId: "MED-I", substitutionAllowed: false, permittedAlternatives: [], restrictionReason: "Patient reports prior GI intolerance to generic binder." },
  { prescriberId: "DOC-RESTRICT-NEURO", sourceMedicationId: "MED-H", substitutionAllowed: false, permittedAlternatives: [], restrictionReason: "Narrow therapeutic index; bioequivalence variation unsafe." },
  { prescriberId: "DOC-PERMIT-SPECIFIC", sourceMedicationId: "MED-A", substitutionAllowed: true, permittedAlternatives: ["MED-B", "MED-D"], restrictionReason: "Only BioCillin and SafeCillin authorized by clinic." },
];

// Initial Allergies (65+ distinct allergy records)
export const ALLERGIES: Allergy[] = [
  { id: "ALG-001", patientId: "PAT-01", substanceId: "MED-C", severity: "High", allergenName: "Allerpen (Ampicillin-core)" },
  { id: "ALG-002", patientId: "PAT-DEMO", substanceId: "MED-B", severity: "High", allergenName: "BioCillin (Amoxicillin-core)" },
  { id: "ALG-003", patientId: "PAT-05", substanceId: "MED-C", severity: "Life-Threatening", allergenName: "Synthetic Penicillin Derivative" },
  { id: "ALG-004", patientId: "PAT-08", substanceId: "MED-B", severity: "Medium", allergenName: "BioCillin" },
  { id: "ALG-005", patientId: "PAT-12", substanceId: "MED-E", severity: "High", allergenName: "HeavyCillin binder compound" },
  { id: "ALG-006", patientId: "PAT-15", substanceId: "MED-C", severity: "High", allergenName: "Allerpen" },
  { id: "ALG-007", patientId: "PAT-19", substanceId: "MED-B", severity: "Life-Threatening", allergenName: "BioCillin" },
  { id: "ALG-008", patientId: "PAT-23", substanceId: "MED-D", severity: "Medium", allergenName: "SafeCillin strawberry vehicle flavoring" },
  { id: "ALG-009", patientId: "PAT-27", substanceId: "MED-C", severity: "High", allergenName: "Allerpen" },
  { id: "ALG-010", patientId: "PAT-31", substanceId: "MED-G", severity: "High", allergenName: "Metoprolol succinate coating" },
  { id: "ALG-011", patientId: "PAT-35", substanceId: "MED-J", severity: "Medium", allergenName: "Metformin liquid vehicle" },
  { id: "ALG-012", patientId: "PAT-39", substanceId: "MED-L", severity: "High", allergenName: "Benzalkonium chloride preservative" },
  { id: "ALG-013", patientId: "PAT-43", substanceId: "MED-B", severity: "High", allergenName: "BioCillin" },
  { id: "ALG-014", patientId: "PAT-47", substanceId: "MED-C", severity: "High", allergenName: "Allerpen" },
  { id: "ALG-015", patientId: "PAT-51", substanceId: "MED-E", severity: "Low", allergenName: "HeavyCillin" },
  { id: "ALG-016", patientId: "PAT-55", substanceId: "MED-B", severity: "High", allergenName: "BioCillin" },
  { id: "ALG-017", patientId: "PAT-59", substanceId: "MED-C", severity: "Life-Threatening", allergenName: "Allerpen" },
  { id: "ALG-018", patientId: "PAT-63", substanceId: "MED-D", severity: "Medium", allergenName: "SafeCillin" },
  { id: "ALG-019", patientId: "PAT-67", substanceId: "MED-B", severity: "High", allergenName: "BioCillin" },
  { id: "ALG-020", patientId: "PAT-71", substanceId: "MED-G", severity: "High", allergenName: "Vascocil ER" },
];

// Populate additional synthetic allergies up to 65+
for (let i = 21; i <= 65; i++) {
  const targetMed = i % 3 === 0 ? "MED-C" : i % 2 === 0 ? "MED-B" : "MED-E";
  ALLERGIES.push({
    id: `ALG-${i.toString().padStart(3, '0')}`,
    patientId: `PAT-${i + 50}`,
    substanceId: targetMed,
    severity: i % 5 === 0 ? "Life-Threatening" : i % 2 === 0 ? "High" : "Medium",
    allergenName: `${targetMed} synthetic hypersensitivity`
  });
}

// Generate exactly 220 controlled synthetic prescriptions covering 12 realistic scenarios
export function generateSyntheticPrescriptions(): Prescription[] {
  const prescriptions: Prescription[] = [];

  // Core Benchmark Cases (Explicitly controlled)
  prescriptions.push(
    // 1. Classic Allergy conflict: Patient allergic to MED-C
    {
      id: "RX-1001",
      medicationId: "MED-A",
      strength: "100 mg",
      route: "Oral",
      frequency: "Once Daily",
      quantity: 30,
      patientId: "PAT-01",
      prescriberId: "DOC-01",
      date: BASE_DATE,
      patientConstraints: [],
      allergyIds: ["MED-C"],
      expectedOutcome: "MED-C BLOCKED by allergy; MED-B & MED-D valid",
      scenarioDescription: "Allergy conflict on candidate MED-C",
      clinicalNotes: "Patient has documented rash/urticaria with Allerpen. Safe alternatives remain available."
    },
    // 2. Out of stock case: MED-C is 0 units
    {
      id: "RX-1002",
      medicationId: "MED-A",
      strength: "100 mg",
      route: "Oral",
      frequency: "Once Daily",
      quantity: 30,
      patientId: "PAT-02",
      prescriberId: "DOC-01",
      date: BASE_DATE,
      patientConstraints: [],
      allergyIds: [],
      expectedOutcome: "MED-C UNSUITABLE (stock 0); MED-B & MED-D valid",
      scenarioDescription: "Candidate out of stock",
      clinicalNotes: "MED-C depleted in primary distribution warehouse."
    },
    // 3. Explicit Prescriber Prohibition: DOC-RESTRICT
    {
      id: "RX-1003",
      medicationId: "MED-A",
      strength: "100 mg",
      route: "Oral",
      frequency: "Once Daily",
      quantity: 30,
      patientId: "PAT-03",
      prescriberId: "DOC-RESTRICT",
      date: BASE_DATE,
      patientConstraints: [],
      allergyIds: [],
      expectedOutcome: "All alternatives BLOCKED by prescriber DAW-1 directive",
      scenarioDescription: "Prescriber prohibition",
      clinicalNotes: "Prescriber annotated DAW-1: dispense as written."
    },
    // 4. Patient Physical Formulation Constraint: Cannot swallow large tablets
    {
      id: "RX-1004",
      medicationId: "MED-A",
      strength: "100 mg",
      route: "Oral",
      frequency: "Once Daily",
      quantity: 30,
      patientId: "PAT-04",
      prescriberId: "DOC-01",
      date: BASE_DATE,
      patientConstraints: ["Cannot swallow large tablets"],
      allergyIds: [],
      expectedOutcome: "MED-E NEEDS_HUMAN_REVIEW; MED-B capsule & MED-D suspension valid",
      scenarioDescription: "Patient dysphagia constraint",
      clinicalNotes: "Patient has swallowing impairment following neurological event."
    },
    // 5. Requirements Demo Case: Allergic to BioCillin (MED-B)
    {
      id: "RX-DEMO",
      medicationId: "MED-A",
      strength: "100 mg",
      route: "Oral",
      frequency: "Once Daily",
      quantity: 30,
      patientId: "PAT-DEMO",
      prescriberId: "DOC-01",
      date: BASE_DATE,
      patientConstraints: [],
      allergyIds: ["MED-B"],
      expectedOutcome: "MED-B BLOCKED by allergy; MED-D valid; MED-C out of stock",
      scenarioDescription: "Live demonstration case with multiple interacting constraints",
      clinicalNotes: "Demonstrates allergy block, stock rejection, and safe alternative retention in one case."
    },
    // 6. Cardiovascular Beta-Blocker substitution: CardioPro (MED-F) to Vascocil ER (MED-G)
    {
      id: "RX-1006",
      medicationId: "MED-F",
      strength: "25 mg",
      route: "Oral",
      frequency: "Twice Daily",
      quantity: 60,
      patientId: "PAT-06",
      prescriberId: "DOC-02",
      date: BASE_DATE,
      patientConstraints: [],
      allergyIds: [],
      expectedOutcome: "MED-G VALID OPTION; others unapproved",
      scenarioDescription: "Cardiovascular therapeutic substitution",
      clinicalNotes: "Hospital inpatient transitioning to home maintenance."
    },
    // 7. Strict Prescriber Prohibition on CardioPro: DOC-STRICT-CARDIO
    {
      id: "RX-1007",
      medicationId: "MED-F",
      strength: "25 mg",
      route: "Oral",
      frequency: "Twice Daily",
      quantity: 60,
      patientId: "PAT-07",
      prescriberId: "DOC-STRICT-CARDIO",
      date: BASE_DATE,
      patientConstraints: [],
      allergyIds: [],
      expectedOutcome: "BLOCKED by prescriber restriction",
      scenarioDescription: "Cardiovascular prescriber restriction",
      clinicalNotes: "Cardiologist strictly orders brand titration only."
    },
    // 8. Incomplete / Stale stock information case: RespiMist (MED-L)
    {
      id: "RX-1008",
      medicationId: "MED-K",
      strength: "90 mcg",
      route: "Inhalation",
      frequency: "As Needed",
      quantity: 1,
      patientId: "PAT-08",
      prescriberId: "DOC-03",
      date: BASE_DATE,
      patientConstraints: [],
      allergyIds: [],
      expectedOutcome: "NEEDS_HUMAN_REVIEW due to stale telemetry on MED-L stock",
      scenarioDescription: "Stale inventory telemetry (uncertainty trigger)",
      clinicalNotes: "Warehouse inventory count has not synced in over 4 days."
    },
    // 9. Antidiabetic liquid formulation required for pediatric/feeding tube
    {
      id: "RX-1009",
      medicationId: "MED-I",
      strength: "500 mg",
      route: "Oral",
      frequency: "Twice Daily",
      quantity: 60,
      patientId: "PAT-09",
      prescriberId: "DOC-04",
      date: BASE_DATE,
      patientConstraints: ["Liquid formulation required (enteral feeding tube)"],
      allergyIds: [],
      expectedOutcome: "MED-J Liquid is VALID; tablet forms require review/block",
      scenarioDescription: "Enteral tube formulation requirement",
      clinicalNotes: "Patient has PEG tube; cannot receive solid dosage forms."
    },
    // 10. Multi-failure case: All potential alternatives blocked or out of stock
    {
      id: "RX-1010",
      medicationId: "MED-A",
      strength: "100 mg",
      route: "Oral",
      frequency: "Once Daily",
      quantity: 30,
      patientId: "PAT-10",
      prescriberId: "DOC-01",
      date: BASE_DATE,
      patientConstraints: ["Cannot swallow large tablets", "Liquid formulation required (pediatric/gastric tube)"],
      allergyIds: ["MED-B", "MED-D"],
      expectedOutcome: "NO_VALID_OPTION (MED-B & D allergic, MED-C out of stock, MED-E formulation violation)",
      scenarioDescription: "No valid options remain across all candidates",
      clinicalNotes: "Complex multi-morbidity case requiring direct prescriber consultation."
    }
  );

  // Systematically generate remaining 210 controlled prescriptions (total 220 records)
  for (let i = 11; i <= 220; i++) {
    const rxId = `RX-${1000 + i}`;
    const patientId = `PAT-${i}`;
    const scenarioMod = i % 10;

    let medicationId = "MED-A";
    let strength = "100 mg";
    let route = "Oral";
    let frequency = "Once Daily";
    let quantity = 30;
    let prescriberId = "DOC-01";
    let patientConstraints: string[] = [];
    let allergyIds: string[] = [];
    let expectedOutcome = "Standard evaluation";
    let scenarioDescription = "Routine evaluation";
    let clinicalNotes = "Synthetic outpatient dispensing encounter.";

    switch (scenarioMod) {
      case 0:
        // Safe substitution available with multiple candidates
        medicationId = "MED-A";
        prescriberId = "DOC-01";
        allergyIds = [];
        patientConstraints = [];
        expectedOutcome = "VALID_OPTIONS_AVAILABLE (MED-B and MED-D valid)";
        scenarioDescription = "Multiple valid safe alternatives";
        clinicalNotes = "Routine antibiotic dispense with robust generic bioequivalent availability.";
        break;

      case 1:
        // Allergy conflict on primary generic candidate
        medicationId = "MED-A";
        allergyIds = ["MED-B"];
        prescriberId = "DOC-01";
        expectedOutcome = "MED-B BLOCKED by allergy; MED-D valid alternative";
        scenarioDescription = "BioCillin allergy conflict safely filtered";
        clinicalNotes = "Penicillin derivative allergy noted in synthetic electronic health record.";
        break;

      case 2:
        // Prescriber prohibition
        medicationId = i % 2 === 0 ? "MED-A" : "MED-F";
        prescriberId = i % 2 === 0 ? "DOC-RESTRICT" : "DOC-STRICT-CARDIO";
        strength = medicationId === "MED-F" ? "25 mg" : "100 mg";
        expectedOutcome = "URGENT_SAFETY_REVIEW or NO_VALID_OPTION (Prescriber prohibition)";
        scenarioDescription = "Prescriber DAW restriction enforces clinical intent";
        clinicalNotes = "Prescriber documented specific clinical justification for brand preservation.";
        break;

      case 3:
        // Patient dysphagia constraint
        medicationId = "MED-A";
        patientConstraints = ["Cannot swallow large tablets"];
        expectedOutcome = "MED-E flagged for review; MED-B capsule and MED-D suspension valid";
        scenarioDescription = "Dysphagia patient constraint check";
        clinicalNotes = "Patient unable to tolerate large solid dosage forms.";
        break;

      case 4:
        // Antidiabetic substitution
        medicationId = "MED-I";
        strength = "500 mg";
        prescriberId = "DOC-04";
        frequency = "Twice Daily";
        quantity = 60;
        if (i % 3 === 0) {
          patientConstraints = ["Liquid formulation required (pediatric/gastric tube)"];
          expectedOutcome = "MED-J Liquid is preferred valid option";
        } else {
          expectedOutcome = "MED-J Liquid valid bioequivalent";
        }
        scenarioDescription = "Metformin bioequivalent interchange";
        clinicalNotes = "Glycemic control maintenance regimen.";
        break;

      case 5:
        // Bronchodilator inhaler/mist
        medicationId = "MED-K";
        strength = "90 mcg";
        route = "Inhalation";
        prescriberId = "DOC-03";
        quantity = 1;
        expectedOutcome = "MED-L available with respiratory clinical review";
        scenarioDescription = "Aerosol delivery interchange";
        clinicalNotes = "Rescue bronchodilator for obstructive airway disease.";
        break;

      case 6:
        // Allergy on candidate Allerpen (MED-C)
        medicationId = "MED-A";
        allergyIds = ["MED-C"];
        expectedOutcome = "MED-C BLOCKED; MED-B and MED-D remain valid";
        scenarioDescription = "Selective allergy block preserves safe alternatives";
        clinicalNotes = "Documented hypersensitivity to ampicillin class derivatives.";
        break;

      case 7:
        // High uncertainty due to missing profile data
        medicationId = "MED-H";
        strength = "100 mg";
        prescriberId = "DOC-05";
        expectedOutcome = "HUMAN_REVIEW_REQUIRED (Uncertainty on narrow therapeutic index drug)";
        scenarioDescription = "Narrow therapeutic index requires pharmacist confirmation";
        clinicalNotes = "Anticonvulsant requiring close serum concentration monitoring.";
        break;

      case 8:
        // Multi-constraint: Dysphagia + Allergy
        medicationId = "MED-A";
        patientConstraints = ["Cannot swallow large tablets"];
        allergyIds = ["MED-B"];
        expectedOutcome = "MED-B blocked by allergy, MED-E review; MED-D Oral Suspension valid";
        scenarioDescription = "Single safe alternative remaining after multi-rule filtering";
        clinicalNotes = "SafeCillin liquid formulation is the sole safe therapeutic path.";
        break;

      case 9:
        // Beta-blocker standard substitution
        medicationId = "MED-F";
        strength = "25 mg";
        prescriberId = "DOC-02";
        frequency = "Twice Daily";
        quantity = 60;
        expectedOutcome = "MED-G valid alternative";
        scenarioDescription = "Cardiovascular beta-blocker interchange";
        clinicalNotes = "Hypertension management in ambulatory care setting.";
        break;
    }

    prescriptions.push({
      id: rxId,
      medicationId,
      strength,
      route,
      frequency,
      quantity,
      patientId,
      prescriberId,
      date: BASE_DATE,
      patientConstraints,
      allergyIds,
      expectedOutcome,
      scenarioDescription,
      clinicalNotes
    });
  }

  return prescriptions;
}

export const INITIAL_PRESCRIPTIONS = generateSyntheticPrescriptions();

export const INITIAL_FOLLOW_UPS: FollowUp[] = [
  {
    id: "FU-001",
    caseId: "RX-1004",
    priority: "HIGH",
    owner: "PHARM-CLIN-01",
    dueDate: "2026-09-08T00:00:00.000Z",
    status: "OPEN",
    escalationLevel: 1,
    overrideReason: undefined,
    resolutionNotes: "Pending patient consultation regarding oral suspension vs capsule.",
    createdAt: BASE_DATE,
    escalationHistory: [
      { level: 0, note: "Formulation constraint detected by engine.", timestamp: BASE_DATE, actor: "SYSTEM" },
      { level: 1, note: "Assigned to clinical specialist for dysphagia assessment.", timestamp: BASE_DATE, actor: "PHARM-LEAD" }
    ]
  },
  {
    id: "FU-002",
    caseId: "RX-1010",
    priority: "CRITICAL",
    owner: "PHARM-DIRECTOR",
    dueDate: "2026-09-07T12:00:00.000Z",
    status: "ESCALATED",
    escalationLevel: 3,
    overrideReason: undefined,
    resolutionNotes: "Prescriber outreach urgent: zero safe alternatives exist in current formulary.",
    createdAt: BASE_DATE,
    escalationHistory: [
      { level: 0, note: "All candidate alternatives blocked.", timestamp: BASE_DATE, actor: "SYSTEM" },
      { level: 2, note: "Outreach initiated to prescribing physician.", timestamp: BASE_DATE, actor: "PHARM-CLIN-01" },
      { level: 3, note: "Escalated to Urgent Safety Board for emergency procurement.", timestamp: BASE_DATE, actor: "PHARM-DIRECTOR" }
    ]
  },
  {
    id: "FU-003",
    caseId: "RX-1008",
    priority: "MEDIUM",
    owner: "PHARM-TECH-04",
    dueDate: "2026-09-09T00:00:00.000Z",
    status: "IN PROGRESS",
    escalationLevel: 0,
    resolutionNotes: "Physical count requested for Respiratory Clinic annex.",
    createdAt: BASE_DATE,
    escalationHistory: [
      { level: 0, note: "Stale stock telemetry flagged by engine.", timestamp: BASE_DATE, actor: "SYSTEM" }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "LOG-INIT-001",
    caseId: "RX-1003",
    user: "PHARM-DR-SMITH",
    action: "OVERRIDE",
    previousDecision: "BLOCKED",
    newDecision: "APPROVED FOR REVIEW",
    reason: "Direct verbal authorization received from Prescriber DOC-RESTRICT confirming generic BioCillin acceptable for emergency 3-day supply.",
    timestamp: "2026-09-06T23:00:00.000Z",
    alternativeId: "MED-B"
  },
  {
    id: "LOG-INIT-002",
    caseId: "RX-1001",
    user: "SYSTEM",
    action: "AUTOMATED_EVALUATION",
    previousDecision: "PENDING",
    newDecision: "VALID_OPTIONS_AVAILABLE",
    reason: "Automated priority safety evaluation completed: MED-C blocked by allergy; MED-B cleared.",
    timestamp: "2026-09-07T00:00:00.000Z"
  }
];

export const INITIAL_VALIDATION_FEEDBACK: StakeholderFeedback[] = [
  {
    id: "FB-001",
    caseId: "RX-1001",
    reviewerName: "Dr. Evelyn Reed, PharmD",
    reviewerRole: "Clinical Pharmacy Specialist",
    agreement: "AGREE",
    decisionEvaluated: "BLOCKED (MED-C)",
    comments: "The engine correctly identified cross-sensitivity between penicillin core and Allerpen. Blocking MED-C while preserving MED-B is clinically accurate.",
    recommendedAction: "Maintain strict rule priority for allergen substance mapping.",
    timestamp: "2026-09-07T02:15:00.000Z"
  },
  {
    id: "FB-002",
    caseId: "RX-1004",
    reviewerName: "Marcus Vance, RPh",
    reviewerRole: "Staff Pharmacist",
    agreement: "AGREE",
    decisionEvaluated: "NEEDS_HUMAN_REVIEW (MED-E)",
    comments: "Marking large tablets as human review rather than outright block allows the pharmacist to verify if patient can use a pill crusher or requires liquid BioCillin.",
    recommendedAction: "Provide prompt with approved liquid formulations.",
    timestamp: "2026-09-07T03:30:00.000Z"
  }
];

export const INITIAL_SYSTEM_CONTEXT: SystemContext = {
  medications: MEDICATIONS,
  approvedAlternatives: APPROVED_ALTERNATIVES,
  allergies: ALLERGIES,
  stock: STOCK,
  prescriberRules: PRESCRIBER_RULES,
  evidenceCatalog: SYNTHETIC_EVIDENCE_CATALOG
};
