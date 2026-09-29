export interface Medication {
  id: string;
  name: string;
  class: string;
  formulation: string;
  strength: string;
  route: string;
  genericName?: string;
  bioequivalentGroup?: string;
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
  expectedOutcome?: string;
  scenarioDescription?: string;
  clinicalNotes?: string;
}

export interface ApprovedAlternative {
  sourceMedicationId: string;
  alternativeMedicationId: string;
  approvalStatus: "APPROVED" | "CONDITIONAL" | "NOT_APPROVED";
  allowedStrengths: string[];
  allowedRoutes: string[];
  substitutionRuleId: string;
}

export interface Allergy {
  id: string;
  patientId: string;
  substanceId: string; // medicationId or class
  severity: "Low" | "Medium" | "High" | "Life-Threatening";
  allergenName?: string;
}

export interface Stock {
  medicationId: string;
  quantityAvailable: number;
  warehouse: string;
  lastUpdated: string;
  isStale?: boolean;
}

export interface PrescriberRule {
  prescriberId: string;
  sourceMedicationId: string;
  substitutionAllowed: boolean;
  permittedAlternatives: string[];
  restrictionReason: string;
}

export interface EscalationRecord {
  level: number;
  note: string;
  timestamp: string;
  actor: string;
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
  resolutionNotes?: string;
  createdAt?: string;
  escalationHistory?: EscalationRecord[];
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
  alternativeId?: string;
}

export type DecisionStatus = "VALID OPTION" | "BLOCKED" | "UNSUITABLE" | "NEEDS HUMAN REVIEW";
export type CandidateDecisionCode = "VALID_OPTION" | "BLOCKED" | "UNSUITABLE" | "NEEDS_HUMAN_REVIEW";
export type PrescriptionOverallStatus = "VALID_OPTIONS_AVAILABLE" | "HUMAN_REVIEW_REQUIRED" | "NO_VALID_OPTION" | "URGENT_SAFETY_REVIEW";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RuleEvaluationItem {
  ruleId: string;
  ruleDescription: string;
  priority: number;
  inputField: string;
  observedValue: string;
  expectedCondition: string;
  result: "PASS" | "FAIL" | "WARNING" | "REVIEW";
  decisionEffect: "NONE" | "BLOCKED" | "NEEDS_HUMAN_REVIEW" | "UNSUITABLE";
  evidenceId: string;
  rationale: string;
}

export interface PotentialHarm {
  hazard: string;
  potentialHarm: string;
  severity: RiskLevel;
  affectedConstraint: string;
  preventiveRule: string;
}

export interface UncertaintyDetail {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH";
  reasons: string[];
}

export interface CandidateAlternativeEvaluation {
  alternativeId: string;
  alternativeName: string;
  decision: DecisionStatus;
  status: CandidateDecisionCode;
  riskLevel: RiskLevel;
  uncertaintyScore: number;
  uncertainty: UncertaintyDetail;
  reasons: string[];
  violatedRules: string[];
  evidence: string[];
  ruleTrace: RuleEvaluationItem[];
  decisionTraceText: string;
  potentialHarmAnalysis: PotentialHarm[];
  requiresHumanConfirmation: boolean;
  potentialHarm: string[];
}

// Backwards-compatible alias for existing rule evaluations
export type RuleEvaluationResult = CandidateAlternativeEvaluation;

export interface PrescriptionAlternativesEvaluation {
  prescriptionId: string;
  overallStatus: PrescriptionOverallStatus;
  candidateAlternatives: CandidateAlternativeEvaluation[];
  validAlternatives: CandidateAlternativeEvaluation[];
  blockedAlternatives: CandidateAlternativeEvaluation[];
  unsuitableAlternatives: CandidateAlternativeEvaluation[];
  reviewRequiredAlternatives: CandidateAlternativeEvaluation[];
  recommendedNextAction: string;
  highestRiskLevel: RiskLevel;
  overallUncertainty: UncertaintyDetail;
}

export interface EvidenceCatalogItem {
  evidenceId: string;
  ruleId: string;
  title: string;
  sourceType: string;
  description: string;
  version: string;
  effectiveDate: string;
  syntheticReference: string;
  status: "ACTIVE" | "SUPERSEDED" | "UNDER_REVIEW";
  clinicalRationale: string;
}

export interface StakeholderFeedback {
  id: string;
  caseId: string;
  reviewerName: string;
  reviewerRole: "Staff Pharmacist" | "Clinical Pharmacy Specialist" | "Safety Auditor" | "Pharmacy Director";
  agreement: "AGREE" | "DISAGREE" | "NEEDS_MODIFICATION";
  decisionEvaluated: string;
  comments: string;
  recommendedAction: string;
  timestamp: string;
}

export interface ExperimentRun {
  id: string;
  timestamp: string;
  datasetSize: number;
  baseline: {
    totalEvaluations: number;
    unsafeAllowed: number;
    unsafeSubstitutionRate: string;
    validSelections: number;
    unsuitableBlocks: number;
  };
  prototype: {
    totalEvaluations: number;
    unsafeBlocked: number;
    unsafeSubstitutionRate: string;
    humanReviewCases: number;
    humanReviewRate: string;
    validCasesRemaining: number;
    validOptionRetention: string;
    uncertaintyBreakdown: { low: number; medium: number; high: number };
  };
  differences: {
    safetyViolationsPrevented: number;
    casesRequiringReview: number;
    allergyConflictsCaught: number;
    prescriberProhibitionsCaught: number;
    routeStrengthMismatchesCaught: number;
  };
  sampleComparisons: Array<{
    prescriptionId: string;
    patientId: string;
    medicationId: string;
    baselineResult: string;
    prototypeResult: string;
    outcomeType: "PROTECTED" | "CONCORDANT" | "REVIEW_TRIGGERED" | "UNAVAILABLE";
    safetyNote: string;
  }>;
}

export interface SystemContext {
  medications: Record<string, Medication>;
  approvedAlternatives: ApprovedAlternative[];
  allergies: Allergy[];
  stock: Record<string, Stock>;
  prescriberRules: PrescriberRule[];
  evidenceCatalog?: Record<string, EvidenceCatalogItem>;
}
