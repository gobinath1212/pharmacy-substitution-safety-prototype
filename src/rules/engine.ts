import {
  Prescription,
  Medication,
  SystemContext,
  CandidateAlternativeEvaluation,
  PrescriptionAlternativesEvaluation,
  RuleEvaluationItem,
  PotentialHarm,
  UncertaintyDetail,
  CandidateDecisionCode,
  DecisionStatus,
  PrescriptionOverallStatus,
  RiskLevel
} from '../types';

/**
 * Evaluates a single candidate alternative against an active prescription
 * using the strict 8-level rule priority hierarchy.
 */
export function evaluateCandidateAlternative(
  prescription: Prescription,
  alternative: Medication,
  context: SystemContext
): CandidateAlternativeEvaluation {
  const ruleTrace: RuleEvaluationItem[] = [];
  const reasons: string[] = [];
  const violatedRules: string[] = [];
  const evidence: string[] = [];
  const potentialHarmAnalysis: PotentialHarm[] = [];
  const uncertaintyReasons: string[] = [];
  
  let baseUncertainty = 0.05; // Baseline experimental uncertainty
  let requiresHumanConfirmation = false;

  // Track rule evaluations per priority
  let allergyBlocked = false;
  let prescriberBlocked = false;
  let approvalBlocked = false;
  let routeBlocked = false;
  let strengthBlocked = false;
  let patientConstraintReview = false;
  let outOfStock = false;
  let dataIntegrityReview = false;

  // -------------------------------------------------------------
  // Priority 1: Allergy Conflict (RULE-ALLERGY-001)
  // -------------------------------------------------------------
  const matchingAllergy = context.allergies.find(
    a => a.patientId === prescription.patientId && (a.substanceId === alternative.id || a.substanceId === alternative.class)
  );
  const rxAllergyRecorded = prescription.allergyIds && prescription.allergyIds.length > 0;
  const directRxAllergy = prescription.allergyIds?.includes(alternative.id);

  if (matchingAllergy || directRxAllergy) {
    allergyBlocked = true;
    const severity = matchingAllergy?.severity === "Life-Threatening" ? "CRITICAL" : "HIGH";
    
    ruleTrace.push({
      ruleId: "RULE-ALLERGY-001",
      ruleDescription: "Patient Hypersensitivity & Cross-Reactivity Screen",
      priority: 1,
      inputField: "prescription.allergyIds / patientAllergies",
      observedValue: matchingAllergy ? `Allergy to ${matchingAllergy.substanceId} (${matchingAllergy.severity})` : `Allergy to ${alternative.id}`,
      expectedCondition: `Candidate ${alternative.id} must not match documented allergies`,
      result: "FAIL",
      decisionEffect: "BLOCKED",
      evidenceId: "EVID-001",
      rationale: "Patient has documented hypersensitivity to this medication or drug core."
    });

    violatedRules.push("RULE-ALLERGY-001: Documented hypersensitivity conflict.");
    reasons.push(`Allergy conflict: Patient has documented sensitivity to ${alternative.name} (${alternative.id}).`);
    
    potentialHarmAnalysis.push({
      hazard: "Allergy-conflicting substitution",
      potentialHarm: "Acute allergic reaction or anaphylaxis if substitute product were dispensed.",
      severity: severity as RiskLevel,
      affectedConstraint: "Patient Immunological Profile",
      preventiveRule: "RULE-ALLERGY-001"
    });
  } else {
    ruleTrace.push({
      ruleId: "RULE-ALLERGY-001",
      ruleDescription: "Patient Hypersensitivity & Cross-Reactivity Screen",
      priority: 1,
      inputField: "prescription.allergyIds",
      observedValue: rxAllergyRecorded ? `Recorded: [${prescription.allergyIds.join(', ')}]` : "No known drug allergies reported",
      expectedCondition: `Candidate ${alternative.id} must not match documented allergies`,
      result: "PASS",
      decisionEffect: "NONE",
      evidenceId: "EVID-001",
      rationale: `No matching allergy conflict found for ${alternative.name}.`
    });
    evidence.push(`No recorded hypersensitivity conflict with ${alternative.name}.`);
  }

  // -------------------------------------------------------------
  // Priority 2: Explicit Prescriber Prohibition (RULE-PRESCRIBER-002)
  // -------------------------------------------------------------
  const prescriberRule = context.prescriberRules.find(
    r => r.prescriberId === prescription.prescriberId && r.sourceMedicationId === prescription.medicationId
  );

  if (prescriberRule && !prescriberRule.substitutionAllowed) {
    prescriberBlocked = true;
    ruleTrace.push({
      ruleId: "RULE-PRESCRIBER-002",
      ruleDescription: "Prescriber Autonomy & DAW Restriction",
      priority: 2,
      inputField: "prescription.prescriberId & medicationId",
      observedValue: `Prescriber ${prescriberRule.prescriberId}: substitutionAllowed = false`,
      expectedCondition: "Prescriber must permit generic or therapeutic substitution",
      result: "FAIL",
      decisionEffect: "BLOCKED",
      evidenceId: "EVID-002",
      rationale: prescriberRule.restrictionReason
    });

    violatedRules.push(`RULE-PRESCRIBER-002: ${prescriberRule.restrictionReason}`);
    reasons.push(`Prescriber prohibition: ${prescriberRule.restrictionReason}`);

    potentialHarmAnalysis.push({
      hazard: "Prescriber-prohibited interchange",
      potentialHarm: "Violation of clinician treatment plan or patient instability on non-brand formulation.",
      severity: "HIGH",
      affectedConstraint: "Prescriber Directive (DAW-1)",
      preventiveRule: "RULE-PRESCRIBER-002"
    });
  } else if (prescriberRule && prescriberRule.substitutionAllowed) {
    if (prescriberRule.permittedAlternatives.length > 0 && !prescriberRule.permittedAlternatives.includes(alternative.id)) {
      prescriberBlocked = true;
      ruleTrace.push({
        ruleId: "RULE-PRESCRIBER-002",
        ruleDescription: "Prescriber Permitted Alternatives List",
        priority: 2,
        inputField: "prescriberRule.permittedAlternatives",
        observedValue: `Permitted list: [${prescriberRule.permittedAlternatives.join(', ')}]`,
        expectedCondition: `Candidate ${alternative.id} must be in prescriber permitted list`,
        result: "FAIL",
        decisionEffect: "BLOCKED",
        evidenceId: "EVID-002",
        rationale: "Alternative not included in prescriber authorized interchange list."
      });
      violatedRules.push("RULE-PRESCRIBER-002: Candidate not in prescriber authorized alternative list.");
      reasons.push("Prescriber restriction: Candidate excluded from authorized alternative list.");
    } else {
      ruleTrace.push({
        ruleId: "RULE-PRESCRIBER-002",
        ruleDescription: "Prescriber Autonomy & DAW Restriction",
        priority: 2,
        inputField: "prescription.prescriberId",
        observedValue: "Substitution permitted by prescriber",
        expectedCondition: "Prescriber must permit generic or therapeutic substitution",
        result: "PASS",
        decisionEffect: "NONE",
        evidenceId: "EVID-002",
        rationale: "Prescriber has authorized generic or therapeutic interchange."
      });
      evidence.push("Prescriber authorizes substitution for this case.");
    }
  } else {
    // Prescriber rule missing in context - triggers uncertainty
    baseUncertainty += 0.15;
    uncertaintyReasons.push("Prescriber specific substitution rule not found in context (defaulting to standard formulary rules).");
    ruleTrace.push({
      ruleId: "RULE-PRESCRIBER-002",
      ruleDescription: "Prescriber Autonomy & DAW Restriction",
      priority: 2,
      inputField: "prescription.prescriberId",
      observedValue: "No specific prescriber directive filed",
      expectedCondition: "Check for active prescriber prohibition",
      result: "PASS",
      decisionEffect: "NONE",
      evidenceId: "EVID-002",
      rationale: "No explicit prescriber block recorded."
    });
    evidence.push("No explicit prescriber prohibition found.");
  }

  // -------------------------------------------------------------
  // Priority 3: Approved Therapeutic Substitution (RULE-APPROVAL-003)
  // -------------------------------------------------------------
  const approval = context.approvedAlternatives.find(
    a => a.sourceMedicationId === prescription.medicationId && a.alternativeMedicationId === alternative.id
  );

  if (!approval || approval.approvalStatus !== "APPROVED") {
    approvalBlocked = true;
    ruleTrace.push({
      ruleId: "RULE-APPROVAL-003",
      ruleDescription: "Approved Therapeutic Equivalence Group",
      priority: 3,
      inputField: "context.approvedAlternatives",
      observedValue: approval ? `Status: ${approval.approvalStatus}` : "Pairing not in approved catalog",
      expectedCondition: "Pairing must exist in approved substitution matrix with APPROVED status",
      result: "FAIL",
      decisionEffect: "BLOCKED",
      evidenceId: "EVID-003",
      rationale: "Alternative is not clinically cataloged or bioequivalent-approved for this source drug."
    });

    violatedRules.push("RULE-APPROVAL-003: Alternative is not clinically approved for substitution.");
    reasons.push("Unapproved substitution: Candidate is not clinically cataloged for this medication.");

    potentialHarmAnalysis.push({
      hazard: "Unapproved chemical or therapeutic interchange",
      potentialHarm: "Therapeutic failure, unstudied toxicity, or drug class mismatch.",
      severity: "HIGH",
      affectedConstraint: "Clinical Bioequivalence Standard",
      preventiveRule: "RULE-APPROVAL-003"
    });
  } else {
    ruleTrace.push({
      ruleId: "RULE-APPROVAL-003",
      ruleDescription: "Approved Therapeutic Equivalence Group",
      priority: 3,
      inputField: "context.approvedAlternatives",
      observedValue: `Rule: ${approval.substitutionRuleId} (Status: ${approval.approvalStatus})`,
      expectedCondition: "Candidate must be recognized in approved substitution matrix",
      result: "PASS",
      decisionEffect: "NONE",
      evidenceId: "EVID-003",
      rationale: "Candidate is clinically validated and approved for therapeutic interchange."
    });
    evidence.push("Candidate belongs to the validated approved substitution group.");
  }

  // -------------------------------------------------------------
  // Priority 4: Route Incompatibility (RULE-ROUTE-004)
  // -------------------------------------------------------------
  const routeMatchesPrescription = prescription.route.toLowerCase() === alternative.route.toLowerCase();
  const routeAllowedInApproval = approval ? approval.allowedRoutes.map(r => r.toLowerCase()).includes(alternative.route.toLowerCase()) : false;

  if (!routeMatchesPrescription || (approval && !routeAllowedInApproval)) {
    routeBlocked = true;
    ruleTrace.push({
      ruleId: "RULE-ROUTE-004",
      ruleDescription: "Administration Route Compatibility",
      priority: 4,
      inputField: "alternative.route vs prescription.route",
      observedValue: `Candidate route: ${alternative.route} | Prescribed route: ${prescription.route}`,
      expectedCondition: `Route must match prescribed route (${prescription.route}) and approval terms`,
      result: "FAIL",
      decisionEffect: "BLOCKED",
      evidenceId: "EVID-004",
      rationale: "Route mismatch detected. Delivering medication via incorrect anatomical route is prohibited."
    });

    violatedRules.push(`RULE-ROUTE-004: Incompatible administration route (${alternative.route} vs ${prescription.route}).`);
    reasons.push(`Route incompatibility: ${alternative.route} does not match prescribed ${prescription.route}.`);

    potentialHarmAnalysis.push({
      hazard: "Route delivery incompatibility",
      potentialHarm: "Incorrect route of administration (e.g., aerosol vs oral) risking localized injury or bioavailability failure.",
      severity: "CRITICAL",
      affectedConstraint: "Administration Route Safety",
      preventiveRule: "RULE-ROUTE-004"
    });
  } else {
    ruleTrace.push({
      ruleId: "RULE-ROUTE-004",
      ruleDescription: "Administration Route Compatibility",
      priority: 4,
      inputField: "alternative.route",
      observedValue: `${alternative.route} (matches ${prescription.route})`,
      expectedCondition: "Route must match prescribed route",
      result: "PASS",
      decisionEffect: "NONE",
      evidenceId: "EVID-004",
      rationale: "Route of administration is verified compatible."
    });
    evidence.push(`Route of administration (${alternative.route}) is compatible.`);
  }

  // -------------------------------------------------------------
  // Priority 5: Strength / Dosage Mismatch (RULE-STRENGTH-005)
  // -------------------------------------------------------------
  const strengthAllowed = approval ? approval.allowedStrengths.includes(alternative.strength) : false;

  if (approval && !strengthAllowed) {
    strengthBlocked = true;
    ruleTrace.push({
      ruleId: "RULE-STRENGTH-005",
      ruleDescription: "Dosage Strength Equivalence Check",
      priority: 5,
      inputField: "alternative.strength vs approval.allowedStrengths",
      observedValue: `Candidate strength: ${alternative.strength} | Allowed: [${approval.allowedStrengths.join(', ')}]`,
      expectedCondition: "Candidate strength must be included in allowed equivalent strengths list",
      result: "FAIL",
      decisionEffect: "BLOCKED",
      evidenceId: "EVID-005",
      rationale: "Dose exposure discrepancy. Unapproved strength variation without dose conversion protocol."
    });

    violatedRules.push(`RULE-STRENGTH-005: Unapproved strength (${alternative.strength}).`);
    reasons.push(`Strength mismatch: ${alternative.strength} is not approved for direct equivalence.`);

    potentialHarmAnalysis.push({
      hazard: "Uncalibrated dosage strength exposure",
      potentialHarm: "Overdose toxicity or therapeutic underdosing.",
      severity: "HIGH",
      affectedConstraint: "Dosage Exposure Standard",
      preventiveRule: "RULE-STRENGTH-005"
    });
  } else if (approval) {
    ruleTrace.push({
      ruleId: "RULE-STRENGTH-005",
      ruleDescription: "Dosage Strength Equivalence Check",
      priority: 5,
      inputField: "alternative.strength",
      observedValue: `${alternative.strength} (Approved in: [${approval.allowedStrengths.join(', ')}])`,
      expectedCondition: "Candidate strength must match approved strength list",
      result: "PASS",
      decisionEffect: "NONE",
      evidenceId: "EVID-005",
      rationale: "Dosage strength is approved and bioequivalent."
    });
    evidence.push(`Strength (${alternative.strength}) is approved for therapeutic equivalence.`);
  }

  // -------------------------------------------------------------
  // Priority 6: Patient Formulation Constraint (RULE-PATIENT-006)
  // -------------------------------------------------------------
  let patientConstraintNote = "";
  if (prescription.patientConstraints && prescription.patientConstraints.length > 0) {
    const dysphagia = prescription.patientConstraints.some(c => 
      c.toLowerCase().includes("swallow") || c.toLowerCase().includes("dysphagia")
    );
    const liquidNeeded = prescription.patientConstraints.some(c => 
      c.toLowerCase().includes("liquid") || c.toLowerCase().includes("tube") || c.toLowerCase().includes("peg")
    );

    if (dysphagia && alternative.formulation.toLowerCase().includes("large")) {
      patientConstraintReview = true;
      requiresHumanConfirmation = true;
      patientConstraintNote = "Patient dysphagia constraint: cannot swallow large tablets.";
    } else if (liquidNeeded && !alternative.formulation.toLowerCase().includes("suspension") && !alternative.formulation.toLowerCase().includes("solution") && !alternative.formulation.toLowerCase().includes("liquid")) {
      patientConstraintReview = true;
      requiresHumanConfirmation = true;
      patientConstraintNote = "Patient requires liquid/suspension formulation for enteral tube or pediatric administration.";
    }
  }

  if (patientConstraintReview) {
    ruleTrace.push({
      ruleId: "RULE-PATIENT-006",
      ruleDescription: "Patient Physical & Formulation Constraint Verification",
      priority: 6,
      inputField: "prescription.patientConstraints",
      observedValue: `Constraint: ${prescription.patientConstraints.join('; ')} | Formulation: ${alternative.formulation}`,
      expectedCondition: "Formulation must be physically ingestible by patient without modification",
      result: "REVIEW",
      decisionEffect: "NEEDS_HUMAN_REVIEW",
      evidenceId: "EVID-006",
      rationale: patientConstraintNote
    });

    violatedRules.push(`RULE-PATIENT-006: ${patientConstraintNote}`);
    reasons.push(`Patient formulation constraint: ${patientConstraintNote} Requires pharmacist clinical confirmation.`);

    potentialHarmAnalysis.push({
      hazard: "Inappropriate physical drug formulation",
      potentialHarm: "Patient inability to swallow medication, choking risk, feeding tube obstruction, or complete treatment non-adherence.",
      severity: "MEDIUM",
      affectedConstraint: "Patient Ingestion & Physical Capability",
      preventiveRule: "RULE-PATIENT-006"
    });
  } else {
    ruleTrace.push({
      ruleId: "RULE-PATIENT-006",
      ruleDescription: "Patient Physical & Formulation Constraint Verification",
      priority: 6,
      inputField: "prescription.patientConstraints",
      observedValue: prescription.patientConstraints?.length ? prescription.patientConstraints.join('; ') : "No physical constraints recorded",
      expectedCondition: "Formulation must satisfy patient physical needs",
      result: "PASS",
      decisionEffect: "NONE",
      evidenceId: "EVID-006",
      rationale: "No physical formulation conflicts detected."
    });
    evidence.push("Formulation satisfies all recorded patient physical constraints.");
  }

  // -------------------------------------------------------------
  // Priority 7: Stock Availability (RULE-STOCK-007)
  // -------------------------------------------------------------
  const stockInfo = context.stock[alternative.id];
  const stockQty = stockInfo ? stockInfo.quantityAvailable : 0;
  const isStaleStock = stockInfo?.isStale === true || (stockInfo && (new Date().getTime() - new Date(stockInfo.lastUpdated).getTime()) > (48 * 3600 * 1000));

  if (!stockInfo || stockQty <= 0) {
    outOfStock = true;
    ruleTrace.push({
      ruleId: "RULE-STOCK-007",
      ruleDescription: "Warehouse Inventory Availability",
      priority: 7,
      inputField: "context.stock[alternative.id].quantityAvailable",
      observedValue: stockInfo ? `0 units available in ${stockInfo.warehouse}` : "No stock record in inventory database",
      expectedCondition: `Minimum quantity of ${prescription.quantity} units must be physically available`,
      result: "FAIL",
      decisionEffect: "UNSUITABLE",
      evidenceId: "EVID-007",
      rationale: "Medication is clinically valid but physically unavailable in warehouse stock."
    });

    violatedRules.push("RULE-STOCK-007: Out of stock in dispensing warehouse.");
    reasons.push(`Inventory depletion: ${alternative.name} has zero units in warehouse.`);
  } else {
    ruleTrace.push({
      ruleId: "RULE-STOCK-007",
      ruleDescription: "Warehouse Inventory Availability",
      priority: 7,
      inputField: "context.stock[alternative.id].quantityAvailable",
      observedValue: `${stockQty} units available (${stockInfo.warehouse})`,
      expectedCondition: `At least ${prescription.quantity} units available`,
      result: "PASS",
      decisionEffect: "NONE",
      evidenceId: "EVID-007",
      rationale: "Sufficient inventory available for dispensing."
    });
    evidence.push(`Stock is available (${stockQty} units in ${stockInfo.warehouse}).`);
  }

  // -------------------------------------------------------------
  // Priority 8: Data Freshness & Clinical Completeness (RULE-DATA-008)
  // -------------------------------------------------------------
  if (isStaleStock) {
    dataIntegrityReview = true;
    baseUncertainty += 0.20;
    uncertaintyReasons.push(`Stock telemetry is older than 48 hours for ${alternative.name} (last updated ${stockInfo?.lastUpdated?.substring(0, 10)}).`);
    ruleTrace.push({
      ruleId: "RULE-DATA-008",
      ruleDescription: "Data Freshness & Telemetry Verification",
      priority: 8,
      inputField: "stock.lastUpdated",
      observedValue: `Stock record age > 48h (Warehouse: ${stockInfo?.warehouse})`,
      expectedCondition: "Inventory counts must be refreshed within 24-48 hours",
      result: "WARNING",
      decisionEffect: "NEEDS_HUMAN_REVIEW",
      evidenceId: "EVID-008",
      rationale: "Inventory telemetry is stale. Physical shelf count check recommended."
    });
  }

  if (!prescription.allergyIds || prescription.allergyIds.length === 0) {
    baseUncertainty += 0.15;
    uncertaintyReasons.push("Patient allergy record is unconfirmed or blank in synthetic record.");
  }

  if (allergyBlocked || prescriberBlocked || approvalBlocked || routeBlocked || strengthBlocked) {
    if (!outOfStock && !patientConstraintReview) {
      // Clean single rule or multiple blocks
    } else {
      // Conflicting conditions present (e.g. stock available but allergy blocked)
      baseUncertainty += 0.10;
      uncertaintyReasons.push("Multiple interacting clinical constraints evaluated for candidate.");
    }
  }

  // -------------------------------------------------------------
  // Final Decision Synthesis & Priority Conflict Resolution
  // -------------------------------------------------------------
  let decision: DecisionStatus = "VALID OPTION";
  let status: CandidateDecisionCode = "VALID_OPTION";
  let riskLevel: RiskLevel = "LOW";

  // Check top blocking priorities (Priorities 1 - 5)
  if (allergyBlocked || prescriberBlocked || approvalBlocked || routeBlocked || strengthBlocked) {
    decision = "BLOCKED";
    status = "BLOCKED";
    riskLevel = (allergyBlocked || routeBlocked) ? "CRITICAL" : "HIGH";
    baseUncertainty += 0.10;
  } else if (patientConstraintReview) {
    // Priority 6
    decision = "NEEDS HUMAN REVIEW";
    status = "NEEDS_HUMAN_REVIEW";
    riskLevel = "MEDIUM";
    baseUncertainty += 0.15;
  } else if (outOfStock) {
    // Priority 7
    decision = "UNSUITABLE";
    status = "UNSUITABLE";
    riskLevel = "LOW";
  } else if (dataIntegrityReview) {
    // Priority 8
    decision = "NEEDS HUMAN REVIEW";
    status = "NEEDS_HUMAN_REVIEW";
    riskLevel = "MEDIUM";
  } else {
    // All checks passed
    decision = "VALID OPTION";
    status = "VALID_OPTION";
    riskLevel = "LOW";
    reasons.push("Alternative is verified clinically approved, compatible in route/strength, allergy-safe, and physically in stock.");
  }

  // Compute final uncertainty details
  const finalScore = Math.min(0.95, Math.max(0.05, parseFloat(baseUncertainty.toFixed(2))));
  const uncertaintyLevel: "LOW" | "MEDIUM" | "HIGH" =
    finalScore >= 0.50 ? "HIGH" : finalScore >= 0.25 ? "MEDIUM" : "LOW";

  const uncertainty: UncertaintyDetail = {
    score: finalScore,
    level: uncertaintyLevel,
    reasons: uncertaintyReasons.length > 0 ? uncertaintyReasons : ["Routine synthetic variance parameters within standard tolerances."]
  };

  // Build the Decision Trace waterfall text
  const approvedCheck = approvalBlocked ? "FAIL" : "PASS";
  const allergyCheck = allergyBlocked ? "FAIL" : "PASS";
  const prescriberCheck = prescriberBlocked ? "FAIL" : "PASS";
  const routeCheck = routeBlocked ? "FAIL" : "PASS";
  const strengthCheck = strengthBlocked ? "FAIL" : "PASS";
  const patientCheck = patientConstraintReview ? "REVIEW" : "PASS";
  const stockCheck = outOfStock ? "UNAVAILABLE" : "PASS";

  const decisionTraceText = `Prescription ${prescription.id} → Alternative ${alternative.id} (${alternative.name}) → Approved substitution check = ${approvedCheck} → Allergy check = ${allergyCheck} → Prescriber rule = ${prescriberCheck} → Route compatibility = ${routeCheck} → Strength check = ${strengthCheck} → Patient constraint = ${patientCheck} → Stock = ${stockCheck} → Final candidate outcome = ${status}`;

  // Simple string potential harm list for backward-compatibility
  const potentialHarmStrings = potentialHarmAnalysis.map(h => `${h.hazard}: ${h.potentialHarm} [Severity: ${h.severity}]`);

  return {
    alternativeId: alternative.id,
    alternativeName: alternative.name,
    decision,
    status,
    riskLevel,
    uncertaintyScore: finalScore,
    uncertainty,
    reasons,
    violatedRules,
    evidence,
    ruleTrace,
    decisionTraceText,
    potentialHarmAnalysis,
    requiresHumanConfirmation,
    potentialHarm: potentialHarmStrings
  };
}

/**
 * Evaluates all candidate alternatives for a prescription and determines
 * the overall prescription workflow action.
 */
export function evaluatePrescriptionAlternatives(
  prescription: Prescription,
  candidates: Medication[],
  context: SystemContext
): PrescriptionAlternativesEvaluation {
  // Filter out the prescribed medication itself
  const viableCandidates = candidates.filter(c => c.id !== prescription.medicationId);

  const evaluatedCandidates: CandidateAlternativeEvaluation[] = viableCandidates.map(cand =>
    evaluateCandidateAlternative(prescription, cand, context)
  );

  const validAlternatives = evaluatedCandidates.filter(c => c.status === "VALID_OPTION");
  const blockedAlternatives = evaluatedCandidates.filter(c => c.status === "BLOCKED");
  const unsuitableAlternatives = evaluatedCandidates.filter(c => c.status === "UNSUITABLE");
  const reviewRequiredAlternatives = evaluatedCandidates.filter(c => c.status === "NEEDS_HUMAN_REVIEW");

  // Determine overall status
  let overallStatus: PrescriptionOverallStatus = "VALID_OPTIONS_AVAILABLE";
  let recommendedNextAction = "";
  let highestRiskLevel: RiskLevel = "LOW";

  // Check highest risk level present
  if (evaluatedCandidates.some(c => c.riskLevel === "CRITICAL")) {
    highestRiskLevel = "CRITICAL";
  } else if (evaluatedCandidates.some(c => c.riskLevel === "HIGH")) {
    highestRiskLevel = "HIGH";
  } else if (evaluatedCandidates.some(c => c.riskLevel === "MEDIUM")) {
    highestRiskLevel = "MEDIUM";
  }

  // Overall status resolution logic
  if (validAlternatives.length > 0) {
    overallStatus = "VALID_OPTIONS_AVAILABLE";
    recommendedNextAction = `Select from ${validAlternatives.length} approved, safe, in-stock alternative(s) and proceed with pharmacist verification.`;
  } else if (reviewRequiredAlternatives.length > 0) {
    overallStatus = "HUMAN_REVIEW_REQUIRED";
    recommendedNextAction = "Formulation constraint or telemetry uncertainty detected. Pharmacist review required before substitution decision.";
  } else if (blockedAlternatives.length > 0 && unsuitableAlternatives.length === 0) {
    // If all alternatives were blocked by allergy or prescriber prohibition
    const hasPrescriberBlock = blockedAlternatives.some(b => b.violatedRules.some(r => r.includes("RULE-PRESCRIBER")));
    const hasAllergyBlock = blockedAlternatives.some(b => b.violatedRules.some(r => r.includes("RULE-ALLERGY")));

    if (hasPrescriberBlock || hasAllergyBlock) {
      overallStatus = "URGENT_SAFETY_REVIEW";
      recommendedNextAction = "Immediate clinician consultation required. All candidate substitutions are safety-blocked by allergy or prescriber prohibition.";
    } else {
      overallStatus = "NO_VALID_OPTION";
      recommendedNextAction = "No valid alternatives available. Contact prescriber or initiate emergency inventory acquisition.";
    }
  } else {
    overallStatus = "NO_VALID_OPTION";
    recommendedNextAction = "All evaluated alternatives are out of stock or unapproved. Contact prescriber or distributor.";
  }

  // Aggregate uncertainty
  const avgUncertainty = evaluatedCandidates.length > 0
    ? evaluatedCandidates.reduce((sum, c) => sum + c.uncertaintyScore, 0) / evaluatedCandidates.length
    : 0.1;
  const roundedAvg = parseFloat(avgUncertainty.toFixed(2));
  const overallUncertainty: UncertaintyDetail = {
    score: roundedAvg,
    level: roundedAvg >= 0.50 ? "HIGH" : roundedAvg >= 0.25 ? "MEDIUM" : "LOW",
    reasons: Array.from(new Set(evaluatedCandidates.flatMap(c => c.uncertainty.reasons)))
  };

  return {
    prescriptionId: prescription.id,
    overallStatus,
    candidateAlternatives: evaluatedCandidates,
    validAlternatives,
    blockedAlternatives,
    unsuitableAlternatives,
    reviewRequiredAlternatives,
    recommendedNextAction,
    highestRiskLevel,
    overallUncertainty
  };
}

/**
 * Backward-compatible wrapper for existing calls to evaluateSubstitution
 */
export function evaluateSubstitution(
  prescription: Prescription,
  alternative: Medication,
  context: SystemContext
): CandidateAlternativeEvaluation {
  return evaluateCandidateAlternative(prescription, alternative, context);
}
