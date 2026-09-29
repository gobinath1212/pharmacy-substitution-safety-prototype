import { NextResponse } from 'next/server';
import { getStorage } from '../../../src/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const verify = searchParams.get('verify');
    const caseId = searchParams.get('caseId')?.toLowerCase();
    const user = searchParams.get('user')?.toLowerCase();
    const action = searchParams.get('action')?.toUpperCase();
    const decision = searchParams.get('decision')?.toUpperCase();

    const storage = getStorage();

    if (verify === 'true') {
      const integrityReport = await storage.verifyAuditIntegrity();
      return NextResponse.json(integrityReport);
    }

    let logs = await storage.getAuditLogs();

    if (caseId) {
      logs = logs.filter(l => l.caseId.toLowerCase().includes(caseId));
    }
    if (user) {
      logs = logs.filter(l => l.user.toLowerCase().includes(user));
    }
    if (action && action !== 'ALL') {
      logs = logs.filter(l => l.action.toUpperCase() === action);
    }
    if (decision && decision !== 'ALL') {
      logs = logs.filter(l => l.newDecision.toUpperCase().includes(decision));
    }

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load audit logs" }, { status: 500 });
  }
}
