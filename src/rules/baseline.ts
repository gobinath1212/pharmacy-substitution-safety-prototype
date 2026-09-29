import { Prescription, Medication, SystemContext, CandidateAlternativeEvaluation } from '../types';

/**
 * Baseline Algorithm: "Availability-only substitution"
 * Intentionally ignores:
 * - Patient drug allergies
 * - Prescriber DAW / prohibition directives
 * - Approved bioequivalence relationships
 * - Formulation / route / strength constraints
 * - Uncertainty / data telemetry staleness
 *
 * Only verifies physical stock count > 0 in warehouse.
 */
export function evaluateBaseline(
  prescription: Prescription,
  alternative: Medication,
  context: SystemContext
): CandidateAlternativeEvaluation {
  const stockInfo = context.stock[alternative.id];
  const isAvailable = stockInfo && stockInfo.quantityAvailable > 0;

  if (!isAvailable) {
    return {
      alternativeId: alternative.id,
      alternativeName: alternative.name,
      decision: "UNSUITABLE",
      status: "UNSUITABLE",
      riskLevel: "LOW",
      uncertaintyScore: 0.05,
      uncertainty: {
        score: 0.05,
        level: "LOW",
        reasons: ["Baseline does not track clinical uncertainty."]
      },
      reasons: ["Out of stock in warehouse."],
      violatedRules: ["BASELINE-STOCK: Out of stock."],
      evidence: [],
      ruleTrace: [{
        ruleId: "BASELINE-STOCK",
        ruleDescription: "Minimal Stock Check",
        priority: 7,
        inputField: "stock.quantityAvailable",
        observedValue: stockInfo ? `${stockInfo.quantityAvailable}` : "0",
        expectedCondition: "> 0",
        result: "FAIL",
        decisionEffect: "UNSUITABLE",
        evidenceId: "EVID-007",
        rationale: "Inventory depleted."
      }],
      decisionTraceText: `Baseline: Alternative ${alternative.id} → Stock check = FAIL (0 units) → Outcome = UNSUITABLE`,
      potentialHarmAnalysis: [],
      requiresHumanConfirmation: false,
      potentialHarm: []
    };
  }

  return {
    alternativeId: alternative.id,
    alternativeName: alternative.name,
    decision: "VALID OPTION",
    status: "VALID_OPTION",
    riskLevel: "LOW",
    uncertaintyScore: 0.05,
    uncertainty: {
      score: 0.05,
      level: "LOW",
      reasons: ["Baseline assumes all available stock is substitutable without clinical checks."]
    },
    reasons: [`Stock available (${stockInfo.quantityAvailable} units). Approved by baseline availability logic.`],
    violatedRules: [],
    evidence: [`Stock available (${stockInfo.quantityAvailable} units).`],
    ruleTrace: [{
      ruleId: "BASELINE-STOCK",
      ruleDescription: "Minimal Stock Check",
      priority: 7,
      inputField: "stock.quantityAvailable",
      observedValue: `${stockInfo.quantityAvailable}`,
      expectedCondition: "> 0",
      result: "PASS",
      decisionEffect: "NONE",
      evidenceId: "EVID-007",
      rationale: "Units in stock."
    }],
    decisionTraceText: `Baseline: Alternative ${alternative.id} → Stock check = PASS (${stockInfo.quantityAvailable} units) → Outcome = VALID_OPTION`,
    potentialHarmAnalysis: [],
    requiresHumanConfirmation: false,
    potentialHarm: []
  };
}
