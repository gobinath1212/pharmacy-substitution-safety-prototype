import { NextResponse } from 'next/server';
import { getStorage } from '../../../src/storage';
import { StakeholderFeedback } from '../../../src/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');

    const storage = getStorage();
    let feedback = await storage.getValidationFeedback();

    if (caseId) {
      feedback = feedback.filter(f => f.caseId === caseId);
    }

    return NextResponse.json(feedback);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load validation feedback" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const storage = getStorage();

    if (!body.caseId || !body.reviewerName || !body.agreement) {
      return NextResponse.json({ error: "Missing required fields (caseId, reviewerName, agreement)" }, { status: 400 });
    }

    const feedbackEntry: StakeholderFeedback = {
      id: `FB-${Date.now().toString(36).toUpperCase()}`,
      caseId: body.caseId,
      reviewerName: body.reviewerName,
      reviewerRole: body.reviewerRole || "Staff Pharmacist",
      agreement: body.agreement,
      decisionEvaluated: body.decisionEvaluated || "Case Substitution Review",
      comments: body.comments || "",
      recommendedAction: body.recommendedAction || "None specified",
      timestamp: new Date().toISOString()
    };

    await storage.saveValidationFeedback(feedbackEntry);
    return NextResponse.json({ success: true, feedback: feedbackEntry }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save validation feedback" }, { status: 500 });
  }
}
