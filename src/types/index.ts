export interface Medication {
  id: string;
  name: string;
  class: string;
  formulation: string;
  strength: string;
  route: string;
}

export interface Prescription {
  id: string;
  medicationId: string;
  strength: string;
  route: string;
  frequency: string;
  quantity: number;
  patientId: string;
  prescriberId: string;
  date: string;
  patientConstraints: string[];
  allergyIds: string[];
}

export interface ApprovedAlternative {
  sourceMedicationId: string;
  alternativeMedicationId: string;
  approvalStatus: string;
  allowedStrengths: string[];
  allowedRoutes: string[];
  substitutionRuleId: string;
}

export interface Allergy {
  id: string;
  patientId: string;
  substanceId: string; // e.g., medicationId
  severity: string;
}

export interface Stock {
  medicationId: string;
  quantityAvailable: number;
  warehouse: string;
  lastUpdated: string;
}

export interface PrescriberRule {
  prescriberId: string;
  sourceMedicationId: string;
  substitutionAllowed: boolean;
  permittedAlternatives: string[];
  restrictionReason: string;
}

export interface FollowUp {
  id: string;
  caseId: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  owner: string;
  dueDate: string;
  status: "OPEN" | "IN PROGRESS" | "RESOLVED" | "ESCALATED";
  escalationLevel: number;
  overrideReason?: string;
}

export interface AuditLogEntry {
  id: string;
  caseId: string;
  user: string;
  action: string;
  previousDecision: string;
  newDecision: string;
  reason: string;
  timestamp: string;
}

export type DecisionStatus = "VALID OPTION" | "BLOCKED" | "UNSUITABLE" | "NEEDS HUMAN REVIEW";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface RuleEvaluationResult {
  alternativeId: string;
  decision: DecisionStatus;
  riskLevel: RiskLevel;
  uncertaintyScore: number;
  reasons: string[];
  violatedRules: string[];
  evidence: string[];
  requiresHumanConfirmation: boolean;
  potentialHarm: string[];
}

export interface SystemContext {
  medications: Record<string, Medication>;
  approvedAlternatives: ApprovedAlternative[];
  allergies: Allergy[];
  stock: Record<string, Stock>;
  prescriberRules: PrescriberRule[];
}
