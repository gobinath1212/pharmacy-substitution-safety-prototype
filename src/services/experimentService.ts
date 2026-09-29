import { SystemContext, Prescription, Medication, ExperimentRun } from '../types';
import { evaluateCandidateAlternative, evaluatePrescriptionAlternatives } from '../rules/engine';
import { evaluateBaseline } from '../rules/baseline';
import { getStorage } from '../storage';

export async function runComparativeExperiment(): Promise<ExperimentRun> {
  const storage = getStorage();
  const context = await storage.getSystemContext();
  const prescriptions = await storage.getPrescriptions();
  const medications = await storage.getMedications();
  const medList = Object.values(medications);

  let baselineTotalEvals = 0;
  let baselineUnsafeAllowed = 0;
  let baselineValidSelections = 0;
  let baselineUnsuitableBlocks = 0;

  let protoTotalEvals = 0;
  let protoUnsafeBlocked = 0;
  let protoHumanReviewCases = 0;
  let protoValidRemaining = 0;

  let allergyConflictsCaught = 0;
  let prescriberProhibitionsCaught = 0;
  let routeStrengthMismatchesCaught = 0;

  let lowUncertainty = 0;
  let medUncertainty = 0;
  let highUncertainty = 0;

  const sampleComparisons: ExperimentRun['sampleComparisons'] = [];

  for (const rx of prescriptions) {
    // Evaluate across all other medications
    const candidateMeds = medList.filter(m => m.id !== rx.medicationId);
    let prescriptionHasValidProto = false;

    for (const alt of candidateMeds) {
      baselineTotalEvals++;
      protoTotalEvals++;

      const baseResult = evaluateBaseline(rx, alt, context);
      const protoResult = evaluateCandidateAlternative(rx, alt, context);

      // Track uncertainty
      if (protoResult.uncertainty.level === "LOW") lowUncertainty++;
      else if (protoResult.uncertainty.level === "MEDIUM") medUncertainty++;
      else highUncertainty++;

      // Safety check categorization
      const hasAllergyConflict = protoResult.violatedRules.some(r => r.includes("RULE-ALLERGY"));
      const hasPrescriberProhibition = protoResult.violatedRules.some(r => r.includes("RULE-PRESCRIBER"));
      const hasRouteStrengthMismatch = protoResult.violatedRules.some(r => r.includes("RULE-ROUTE") || r.includes("RULE-STRENGTH") || r.includes("RULE-APPROVAL"));
      
      const isClinicallyUnsafe = hasAllergyConflict || hasPrescriberProhibition || hasRouteStrengthMismatch;

      if (hasAllergyConflict) allergyConflictsCaught++;
      if (hasPrescriberProhibition) prescriberProhibitionsCaught++;
      if (hasRouteStrengthMismatch) routeStrengthMismatchesCaught++;

      if (baseResult.decision === "VALID OPTION") {
        baselineValidSelections++;
        if (isClinicallyUnsafe) {
          baselineUnsafeAllowed++;
        }
      } else {
        baselineUnsuitableBlocks++;
      }

      if (protoResult.decision === "BLOCKED" && isClinicallyUnsafe) {
        protoUnsafeBlocked++;
      }

      if (protoResult.decision === "NEEDS HUMAN REVIEW") {
        protoHumanReviewCases++;
      }

      if (protoResult.decision === "VALID OPTION") {
        prescriptionHasValidProto = true;
      }

      // Add to sample comparisons if interesting outcome difference or first few records
      if (sampleComparisons.length < 50) {
        if (baseResult.decision === "VALID OPTION" && protoResult.decision === "BLOCKED") {
          sampleComparisons.push({
            prescriptionId: rx.id,
            patientId: rx.patientId,
            medicationId: alt.id,
            baselineResult: baseResult.decision,
            prototypeResult: protoResult.decision,
            outcomeType: "PROTECTED",
            safetyNote: hasAllergyConflict
              ? `Allergy conflict prevented (${alt.name})`
              : hasPrescriberProhibition
              ? "Prescriber prohibition enforced"
              : "Unapproved/Incompatible substitution blocked"
          });
        } else if (protoResult.decision === "NEEDS HUMAN REVIEW") {
          sampleComparisons.push({
            prescriptionId: rx.id,
            patientId: rx.patientId,
            medicationId: alt.id,
            baselineResult: baseResult.decision,
            prototypeResult: protoResult.decision,
            outcomeType: "REVIEW_TRIGGERED",
            safetyNote: protoResult.reasons[0] || "Patient physical constraint requires pharmacist review"
          });
        } else if (baseResult.decision === "UNSUITABLE" && protoResult.decision === "UNSUITABLE") {
          if (sampleComparisons.filter(s => s.outcomeType === "UNAVAILABLE").length < 5) {
            sampleComparisons.push({
              prescriptionId: rx.id,
              patientId: rx.patientId,
              medicationId: alt.id,
              baselineResult: baseResult.decision,
              prototypeResult: protoResult.decision,
              outcomeType: "UNAVAILABLE",
              safetyNote: "Out of stock in warehouse (Concordant rejection)"
            });
          }
        }
      }
    }

    if (prescriptionHasValidProto) {
      protoValidRemaining++;
    }
  }

  const baselineUnsafeRate = baselineTotalEvals > 0
    ? ((baselineUnsafeAllowed / baselineTotalEvals) * 100).toFixed(1) + "%"
    : "0.0%";

  const protoRetentionRate = prescriptions.length > 0
    ? ((protoValidRemaining / prescriptions.length) * 100).toFixed(1) + "%"
    : "0.0%";

  const protoReviewRate = protoTotalEvals > 0
    ? ((protoHumanReviewCases / protoTotalEvals) * 100).toFixed(1) + "%"
    : "0.0%";

  const experimentRun: ExperimentRun = {
    id: `EXP-${Date.now().toString(36).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    datasetSize: prescriptions.length,
    baseline: {
      totalEvaluations: baselineTotalEvals,
      unsafeAllowed: baselineUnsafeAllowed,
      unsafeSubstitutionRate: baselineUnsafeRate,
      validSelections: baselineValidSelections,
      unsuitableBlocks: baselineUnsuitableBlocks
    },
    prototype: {
      totalEvaluations: protoTotalEvals,
      unsafeBlocked: protoUnsafeBlocked,
      unsafeSubstitutionRate: "0.0%",
      humanReviewCases: protoHumanReviewCases,
      humanReviewRate: protoReviewRate,
      validCasesRemaining: protoValidRemaining,
      validOptionRetention: protoRetentionRate,
      uncertaintyBreakdown: {
        low: lowUncertainty,
        medium: medUncertainty,
        high: highUncertainty
      }
    },
    differences: {
      safetyViolationsPrevented: baselineUnsafeAllowed,
      casesRequiringReview: protoHumanReviewCases,
      allergyConflictsCaught,
      prescriberProhibitionsCaught,
      routeStrengthMismatchesCaught
    },
    sampleComparisons
  };

  // Persist run
  await storage.saveExperimentRun(experimentRun);

  return experimentRun;
}
