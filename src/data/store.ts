import { Medication, Prescription, ApprovedAlternative, Allergy, Stock, PrescriberRule, FollowUp, AuditLogEntry, SystemContext } from '../types';

export const MEDICATIONS: Record<string, Medication> = {
  "MED-A": { id: "MED-A", name: "SynthCillin", class: "Antibiotic", formulation: "Tablet", strength: "100 mg", route: "Oral" },
  "MED-B": { id: "MED-B", name: "BioCillin", class: "Antibiotic", formulation: "Capsule", strength: "100 mg", route: "Oral" },
  "MED-C": { id: "MED-C", name: "Allerpen", class: "Antibiotic", formulation: "Tablet", strength: "100 mg", route: "Oral" },
  "MED-D": { id: "MED-D", name: "SafeCillin", class: "Antibiotic", formulation: "Suspension", strength: "100 mg/5mL", route: "Oral" },
  "MED-E": { id: "MED-E", name: "HeavyCillin", class: "Antibiotic", formulation: "Large Tablet", strength: "100 mg", route: "Oral" },
};

export const APPROVED_ALTERNATIVES: ApprovedAlternative[] = [
  { sourceMedicationId: "MED-A", alternativeMedicationId: "MED-B", approvalStatus: "APPROVED", allowedStrengths: ["100 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-01" },
  { sourceMedicationId: "MED-A", alternativeMedicationId: "MED-C", approvalStatus: "APPROVED", allowedStrengths: ["100 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-02" },
  { sourceMedicationId: "MED-A", alternativeMedicationId: "MED-D", approvalStatus: "APPROVED", allowedStrengths: ["100 mg/5mL"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-03" },
  { sourceMedicationId: "MED-A", alternativeMedicationId: "MED-E", approvalStatus: "APPROVED", allowedStrengths: ["100 mg"], allowedRoutes: ["Oral"], substitutionRuleId: "RULE-04" },
];

export const STOCK: Record<string, Stock> = {
  "MED-A": { medicationId: "MED-A", quantityAvailable: 0, warehouse: "Main", lastUpdated: "2026-09-07T00:00:00.000Z" },
  "MED-B": { medicationId: "MED-B", quantityAvailable: 500, warehouse: "Main", lastUpdated: "2026-09-07T00:00:00.000Z" },
  "MED-C": { medicationId: "MED-C", quantityAvailable: 0, warehouse: "Main", lastUpdated: "2026-09-07T00:00:00.000Z" }, // Out of stock edge case
  "MED-D": { medicationId: "MED-D", quantityAvailable: 100, warehouse: "Main", lastUpdated: "2026-09-07T00:00:00.000Z" },
  "MED-E": { medicationId: "MED-E", quantityAvailable: 200, warehouse: "Main", lastUpdated: "2026-09-07T00:00:00.000Z" },
};

const BASE_DATE = "2026-09-07T00:00:00.000Z";

const DEMO_PRESCRIPTIONS: Prescription[] = [
  // Edge Case 1: Allergy conflict. Patient allergic to MED-C
  { id: "RX-1001", medicationId: "MED-A", strength: "100 mg", route: "Oral", frequency: "Once Daily", quantity: 30, patientId: "PAT-01", prescriberId: "DOC-01", date: BASE_DATE, patientConstraints: [], allergyIds: ["MED-C"] },
  // Edge Case 2: Out of Stock. (MED-C is out of stock in our synthetic db)
  { id: "RX-1002", medicationId: "MED-A", strength: "100 mg", route: "Oral", frequency: "Once Daily", quantity: 30, patientId: "PAT-02", prescriberId: "DOC-02", date: BASE_DATE, patientConstraints: [], allergyIds: [] },
  // Edge Case 3: Prescriber restriction.
  { id: "RX-1003", medicationId: "MED-A", strength: "100 mg", route: "Oral", frequency: "Once Daily", quantity: 30, patientId: "PAT-03", prescriberId: "DOC-RESTRICT", date: BASE_DATE, patientConstraints: [], allergyIds: [] },
  // Edge Case 5: Patient constraint. Cannot swallow large tablets (MED-E is large tablet)
  { id: "RX-1004", medicationId: "MED-A", strength: "100 mg", route: "Oral", frequency: "Once Daily", quantity: 30, patientId: "PAT-04", prescriberId: "DOC-01", date: BASE_DATE, patientConstraints: ["Cannot swallow large tablets"], allergyIds: [] },
  // Demo Case (from requirements)
  { id: "RX-DEMO", medicationId: "MED-A", strength: "100 mg", route: "Oral", frequency: "Once Daily", quantity: 30, patientId: "PAT-DEMO", prescriberId: "DOC-01", date: BASE_DATE, patientConstraints: [], allergyIds: ["MED-B"] },
];

// Generate 45 more synthetic normal prescriptions to hit the 50 mark
for (let i = 5; i <= 50; i++) {
  DEMO_PRESCRIPTIONS.push({
    id: `RX-20${i.toString().padStart(2, '0')}`,
    medicationId: "MED-A",
    strength: "100 mg",
    route: "Oral",
    frequency: "Once Daily",
    quantity: 30,
    patientId: `PAT-${i}`,
    prescriberId: "DOC-01",
    date: BASE_DATE,
    patientConstraints: i % 5 === 0 ? ["Cannot swallow large tablets"] : [],
    allergyIds: i % 4 === 0 ? ["MED-B"] : [],
  });
}

export const PRESCRIPTIONS: Prescription[] = DEMO_PRESCRIPTIONS;

export const ALLERGIES: Allergy[] = [
  { id: "ALG-01", patientId: "PAT-01", substanceId: "MED-C", severity: "High" },
  { id: "ALG-DEMO", patientId: "PAT-DEMO", substanceId: "MED-B", severity: "High" },
];
// Append dynamic allergies from loop above
let allergyIdCounter = 1;
PRESCRIPTIONS.forEach(rx => {
  rx.allergyIds.forEach(alg => {
    if (!ALLERGIES.find(a => a.patientId === rx.patientId && a.substanceId === alg)) {
      ALLERGIES.push({ id: `ALG-DYN-${allergyIdCounter++}`, patientId: rx.patientId, substanceId: alg, severity: "High" });
    }
  });
});

export const PRESCRIBER_RULES: PrescriberRule[] = [
  { prescriberId: "DOC-RESTRICT", sourceMedicationId: "MED-A", substitutionAllowed: false, permittedAlternatives: [], restrictionReason: "No substitution allowed." }
];

export const CONTEXT: SystemContext = {
  medications: MEDICATIONS,
  approvedAlternatives: APPROVED_ALTERNATIVES,
  allergies: ALLERGIES,
  stock: STOCK,
  prescriberRules: PRESCRIBER_RULES
};

// In-memory state for follow-ups and audit logs
export const STATE = {
  followUps: [
    { id: "FU-001", caseId: "RX-1004", priority: "HIGH", owner: "PHARM-01", dueDate: "2026-09-08T00:00:00.000Z", status: "OPEN", escalationLevel: 0 },
    { id: "FU-002", caseId: "RX-2010", priority: "MEDIUM", owner: "UNASSIGNED", dueDate: "2026-09-09T00:00:00.000Z", status: "OPEN", escalationLevel: 0 },
  ] as FollowUp[],
  auditLogs: [
    { id: "LOG-XYZ123", caseId: "RX-1003", user: "PHARM-USER-2", action: "OVERRIDE", previousDecision: "BLOCKED", newDecision: "APPROVED FOR REVIEW", reason: "Prescriber contacted and approved", timestamp: "2026-09-06T23:00:00.000Z" }
  ] as AuditLogEntry[]
};
