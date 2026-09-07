import { RuleEvaluationResult, Prescription, Medication, SystemContext } from '../types';

export function evaluateSubstitution(
  prescription: Prescription,
  alternative: Medication,
  context: SystemContext
): RuleEvaluationResult {
  const result: RuleEvaluationResult = {
    alternativeId: alternative.id,
    decision: "VALID OPTION",
    riskLevel: "LOW",
    uncertaintyScore: 0.1, // Base prototype uncertainty
    reasons: [],
    violatedRules: [],
    evidence: [],
    requiresHumanConfirmation: false,
    potentialHarm: []
  };

  // 1. Check Allergy
  const hasAllergy = context.allergies.some(
    a => a.patientId === prescription.patientId && a.substanceId === alternative.id
  );
  if (hasAllergy) {
    result.violatedRules.push("Allergy conflict detected.");
    result.potentialHarm.push("Potential harm: allergic reaction if substituted incorrectly.");
  } else {
    result.evidence.push("No known conflict with recorded synthetic allergy.");
  }

  // 2. Explicit Prescriber Prohibition
  const prescriberRule = context.prescriberRules.find(
    r => r.prescriberId === prescription.prescriberId && r.sourceMedicationId === prescription.medicationId
  );
  if (prescriberRule && !prescriberRule.substitutionAllowed) {
    result.violatedRules.push(`Prescriber restriction: ${prescriberRule.restrictionReason}`);
    result.potentialHarm.push("Potential harm: substitution may violate prescriber instructions.");
  } else {
    result.evidence.push("No prescriber restriction preventing substitution.");
  }

  // 3. Clinical / Approved Substitution Rule
  const approval = context.approvedAlternatives.find(
    a => a.sourceMedicationId === prescription.medicationId && a.alternativeMedicationId === alternative.id
  );
  if (!approval || approval.approvalStatus !== "APPROVED") {
    result.violatedRules.push("Alternative is not clinically approved for this substitution.");
    result.potentialHarm.push("Potential harm: unapproved substitution could lead to adverse clinical outcomes.");
  } else {
    result.evidence.push("Alternative belongs to the approved substitution group.");
  }

  // 4 & 5. Route and Strength Incompatibility
  if (approval && !approval.allowedRoutes.includes(alternative.route)) {
    result.violatedRules.push(`Route incompatibility: ${alternative.route} not permitted.`);
    result.potentialHarm.push("Potential harm: incorrect route of administration.");
  } else if (approval) {
    result.evidence.push("Route of administration is approved.");
  }

  if (approval && !approval.allowedStrengths.includes(alternative.strength)) {
    result.violatedRules.push(`Strength incompatibility: ${alternative.strength} not permitted.`);
    result.potentialHarm.push("Potential harm: incorrect dose exposure.");
  } else if (approval) {
    result.evidence.push("Strength/dose is approved.");
  }

  // 6. Patient Constraints
  const hasConstraint = prescription.patientConstraints.some(c => 
    c.toLowerCase().includes("swallow") && alternative.formulation.toLowerCase().includes("large")
  );
  if (hasConstraint) {
    result.violatedRules.push("Patient constraint requires confirmation (formulation).");
    result.potentialHarm.push("Potential harm: patient may be unable to use the formulation correctly.");
    result.requiresHumanConfirmation = true;
  } else {
    result.evidence.push("No known patient formulation constraints violated.");
  }

  // 7. Stock Availability
  const stockInfo = context.stock[alternative.id];
  if (!stockInfo || stockInfo.quantityAvailable <= 0) {
    result.violatedRules.push("Alternative approved but unavailable (out of stock).");
  } else {
    result.evidence.push(`Required stock quantity is available (${stockInfo.quantityAvailable} units).`);
  }

  // 8. Determine final outcome based on Priority
  if (hasAllergy || (prescriberRule && !prescriberRule.substitutionAllowed) || !approval || 
      (approval && !approval.allowedRoutes.includes(alternative.route)) || 
      (approval && !approval.allowedStrengths.includes(alternative.strength))) {
    result.decision = "BLOCKED";
    result.riskLevel = "HIGH";
    result.uncertaintyScore += 0.3; 
    result.reasons.push("Safety or clinical constraint violation blocks substitution.");
  } else if (hasConstraint) {
    result.decision = "NEEDS HUMAN REVIEW";
    result.riskLevel = "MEDIUM";
    result.uncertaintyScore += 0.2;
    result.reasons.push("Patient formulation constraint requires confirmation.");
  } else if (!stockInfo || stockInfo.quantityAvailable <= 0) {
    result.decision = "UNSUITABLE";
    result.riskLevel = "MEDIUM";
    result.reasons.push("Out of stock.");
  } else {
    result.decision = "VALID OPTION";
    result.riskLevel = "LOW";
    result.reasons.push("Alternative is safe, approved, and available.");
  }

  // Cap uncertainty
  result.uncertaintyScore = Math.min(1.0, parseFloat(result.uncertaintyScore.toFixed(2)));

  return result;
}
