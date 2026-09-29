import { NextResponse } from 'next/server';
import { getStorage } from '../../../src/storage';
import { evaluateCandidateAlternative, evaluatePrescriptionAlternatives } from '../../../src/rules/engine';
import { FollowUp } from '../../../src/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prescriptionId, alternativeId, evaluateAll } = body;

    if (!prescriptionId) {
      return NextResponse.json({ error: "prescriptionId is required." }, { status: 400 });
    }

    const storage = getStorage();
    const context = await storage.getSystemContext();
    const rx = await storage.getPrescriptionById(prescriptionId);
    const medications = await storage.getMedications();

    if (!rx) {
      return NextResponse.json({ error: `Prescription ${prescriptionId} not found` }, { status: 404 });
    }

    if (evaluateAll) {
      // Evaluate all other medications in the catalog
      const medList = Object.values(medications);
      const evaluation = evaluatePrescriptionAlternatives(rx, medList, context);

      // Section 3 Requirement: If NO_VALID_OPTION or URGENT_SAFETY_REVIEW, automatically dispatch high-priority follow-up
      if (evaluation.overallStatus === "NO_VALID_OPTION" || evaluation.overallStatus === "URGENT_SAFETY_REVIEW") {
        const existingFollowUps = await storage.getFollowUps();
        const alreadyHasFollowUp = existingFollowUps.some(f => f.caseId === prescriptionId && f.status !== "RESOLVED");
        
        if (!alreadyHasFollowUp) {
          const autoFollowUp: FollowUp = {
            id: `FU-AUTO-${Date.now().toString(36).toUpperCase()}`,
            caseId: prescriptionId,
            priority: evaluation.overallStatus === "URGENT_SAFETY_REVIEW" ? "CRITICAL" : "HIGH",
            owner: "PHARM-CLINICAL-QUEUE",
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            status: "OPEN",
            escalationLevel: 1,
            resolutionNotes: `Auto-dispatched: ${evaluation.recommendedNextAction}`,
            createdAt: new Date().toISOString(),
            escalationHistory: [
              {
                level: 0,
                note: `System identified ${evaluation.overallStatus}: all alternatives blocked or unsuitable.`,
                timestamp: new Date().toISOString(),
                actor: "RULES-ENGINE"
              },
              {
                level: 1,
                note: "Escalated to Clinical Queue for urgent clinician outreach.",
                timestamp: new Date().toISOString(),
                actor: "AUTO-DISPATCH"
              }
            ]
          };
          await storage.saveFollowUp(autoFollowUp);
        }
      }

      return NextResponse.json(evaluation);
    }

    if (!alternativeId) {
      return NextResponse.json({ error: "alternativeId is required when evaluateAll is false" }, { status: 400 });
    }

    const alt = medications[alternativeId];
    if (!alt) {
      return NextResponse.json({ error: `Medication ${alternativeId} not found` }, { status: 404 });
    }

    const result = evaluateCandidateAlternative(rx, alt, context);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("evaluate-substitution error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
