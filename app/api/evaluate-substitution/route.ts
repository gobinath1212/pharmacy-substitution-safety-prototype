import { NextResponse } from 'next/server';
import { PRESCRIPTIONS, MEDICATIONS, CONTEXT } from '../../../src/data/store';
import { evaluateSubstitution } from '../../../src/rules/engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prescriptionId, alternativeId } = body;

    const rx = PRESCRIPTIONS.find(p => p.id === prescriptionId);
    const alt = MEDICATIONS[alternativeId];

    if (!rx || !alt) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    const result = evaluateSubstitution(rx, alt, CONTEXT);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
