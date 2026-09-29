import { NextResponse } from 'next/server';
import { getStorage } from '../../../src/storage';

export async function GET() {
  try {
    const storage = getStorage();
    const logs = await storage.getAuditLogs();
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load audit logs" }, { status: 500 });
  }
}
