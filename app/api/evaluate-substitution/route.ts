import { NextResponse } from 'next/server';
import { getStorage } from '../../../src/storage';
import { evaluateCandidateAlternative, evaluatePrescriptionAlternatives } from '../../../src/rules/engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prescriptionId, alternativeId, evaluateAll } = body;

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
