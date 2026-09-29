import { NextResponse } from 'next/server';
import { getStorage } from '../../../src/storage';
import { AuditLogEntry, UserRole } from '../../../src/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caseId, alternativeId, reviewerId, role, reason, previousDecision } = body;

    // 1. Candidate validation
    if (!alternativeId) {
      return NextResponse.json({ error: "Selected candidate is required for override." }, { status: 400 });
    }

    // 2. Reviewer validation
    if (!reviewerId || reviewerId.trim() === '') {
      return NextResponse.json({ error: "Reviewer identifier is required." }, { status: 400 });
    }

    // 3. Mandatory reason check
    if (!reason || reason.trim() === '') {
      return NextResponse.json({ error: "Override reason is required for auditability." }, { status: 400 });
    }

    // 4. Role-based access control (RBAC) validation
    const userRole: UserRole = (role as UserRole) || "PHARMACIST";
    if (userRole === "COORDINATOR") {
      return NextResponse.json({
        error: "Access Denied: Pharmacy Coordinators are not authorized to override clinical safety blocks."
      }, { status: 403 });
    }

    const storage = getStorage();

    const logEntry: AuditLogEntry = {
      id: `LOG-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      caseId: caseId || 'UNKNOWN',
      user: reviewerId.trim(),
      role: userRole,
      action: "OVERRIDE",
      previousDecision: previousDecision || "BLOCKED",
      newDecision: "APPROVED_FOR_REVIEW",
      reason: reason.trim(),
      timestamp: new Date().toISOString(),
      alternativeId
    };

    await storage.saveAuditLog(logEntry);

    // Create a follow-up item for post-dispense pharmacist verification
    await storage.saveFollowUp({
      id: `FU-OVR-${Date.now().toString(36).toUpperCase()}`,
      caseId: caseId || 'UNKNOWN',
      priority: "HIGH",
      owner: reviewerId.trim(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      status: "OPEN",
      escalationLevel: 1,
      overrideReason: reason.trim(),
      resolutionNotes: `Override executed for candidate ${alternativeId} by ${userRole} ${reviewerId}. Awaiting post-dispense review.`,
      createdAt: new Date().toISOString(),
      escalationHistory: [
        {
          level: 1,
          note: `Clinical override logged: "${reason.trim()}" (Role: ${userRole})`,
          timestamp: new Date().toISOString(),
          actor: reviewerId.trim()
        }
      ]
    });

    return NextResponse.json({ success: true, log: logEntry });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
