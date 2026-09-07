import { NextResponse } from 'next/server';
import { STATE } from '../../../src/data/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caseId, alternativeId, reviewerId, reason, previousDecision } = body;

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ error: "Override reason is required." }, { status: 400 });
    }

    const logEntry = {
      id: `LOG-${Math.random().toString(36).substring(7)}`,
      caseId,
      user: reviewerId || 'SYSTEM',
      action: "OVERRIDE",
      previousDecision: previousDecision || "BLOCKED",
      newDecision: "APPROVED FOR REVIEW",
      reason,
      timestamp: new Date().toISOString()
    };

    STATE.auditLogs.push(logEntry);

    return NextResponse.json({ success: true, log: logEntry });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
