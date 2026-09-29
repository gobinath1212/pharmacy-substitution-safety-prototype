import { NextResponse } from 'next/server';
import { getStorage } from '../../../src/storage';
import { AuditLogEntry } from '../../../src/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caseId, alternativeId, reviewerId, reason, previousDecision } = body;

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ error: "Override reason is required." }, { status: 400 });
    }

    const storage = getStorage();

    const logEntry: AuditLogEntry = {
      id: `LOG-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      caseId: caseId || 'UNKNOWN',
      user: reviewerId || 'PHARM-CLINICAL-1',
      action: "OVERRIDE",
      previousDecision: previousDecision || "BLOCKED",
      newDecision: "APPROVED_FOR_REVIEW",
      reason: reason.trim(),
      timestamp: new Date().toISOString(),
      alternativeId
    };

    await storage.saveAuditLog(logEntry);

    // Also create or update a follow-up item for the override so it enters the clinical audit queue
    await storage.saveFollowUp({
      id: `FU-OVR-${Date.now().toString(36).toUpperCase()}`,
      caseId: caseId || 'UNKNOWN',
      priority: "HIGH",
      owner: reviewerId || "PHARM-CLINICAL-1",
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      status: "OPEN",
      escalationLevel: 1,
      overrideReason: reason.trim(),
      resolutionNotes: `Override executed for candidate ${alternativeId}. Awaiting post-dispense safety check.`,
      createdAt: new Date().toISOString(),
      escalationHistory: [
        {
          level: 1,
          note: `Clinical override logged: "${reason.trim()}"`,
          timestamp: new Date().toISOString(),
          actor: reviewerId || "PHARM-CLINICAL-1"
        }
      ]
    });

    return NextResponse.json({ success: true, log: logEntry });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
