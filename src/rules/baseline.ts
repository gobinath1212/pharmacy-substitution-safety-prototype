import { RuleEvaluationResult, Prescription, Medication, SystemContext } from '../types';

export function evaluateBaseline(
  prescription: Prescription,
  alternative: Medication,
  context: SystemContext
): RuleEvaluationResult {
  // Baseline algorithm: “Availability-only substitution”
  // It should:
  // Check whether an alternative is available in stock.
  // Ignore allergies.
  // Ignore patient constraints.
  // Ignore prescriber restrictions.

  const result: RuleEvaluationResult = {
    alternativeId: alternative.id,
    decision: "VALID OPTION",
    riskLevel: "LOW",
    uncertaintyScore: 0.1,
    reasons: [],
    violatedRules: [],
    evidence: [],
    requiresHumanConfirmation: false,
    potentialHarm: []
  };

  const stockInfo = context.stock[alternative.id];
  if (!stockInfo || stockInfo.quantityAvailable <= 0) {
    result.decision = "UNSUITABLE";
    result.violatedRules.push("Out of stock.");
    result.reasons.push("Out of stock.");
  } else {
    result.decision = "VALID OPTION";
    result.evidence.push(`Stock available (${stockInfo.quantityAvailable} units).`);
    result.reasons.push("Alternative is available in stock.");
  }

  return result;
}
