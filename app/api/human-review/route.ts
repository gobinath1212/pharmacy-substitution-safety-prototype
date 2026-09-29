import { NextResponse } from 'next/server';
import { getStorage } from '../../../src/storage';
import { HumanReviewDecision, UserRole } from '../../../src/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    const storage = getStorage();
    let decisions = await storage.getHumanReviewDecisions();
    if (caseId) {
      decisions = decisions.filter(d => d.caseId === caseId);
    }
    return NextResponse.json(decisions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch decisions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caseId, alternativeId, reviewer, role, action, reason } = body;

    if (!caseId || !alternativeId) {
      return NextResponse.json({ error: "Missing caseId or alternativeId." }, { status: 400 });
    }

    if (!reviewer || reviewer.trim() === '') {
      return NextResponse.json({ error: "Reviewer identifier is required." }, { status: 400 });
    }

    if (!action || !["CONFIRM", "REJECT", "REQUEST_CLARIFICATION"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be CONFIRM, REJECT, or REQUEST_CLARIFICATION." }, { status: 400 });
    }

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ error: "A clinical reason is required for review confirmation." }, { status: 400 });
    }

    const decisionRecord: HumanReviewDecision = {
      id: `HR-${Date.now().toString(36).toUpperCase()}`,
      caseId,
      alternativeId,
      reviewer: reviewer.trim(),
      role: (role as UserRole) || "PHARMACIST",
      action: action as any,
      reason: reason.trim(),
      timestamp: new Date().toISOString()
    };

    const storage = getStorage();
    await storage.saveHumanReviewDecision(decisionRecord);

    return NextResponse.json({ success: true, decision: decisionRecord });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
