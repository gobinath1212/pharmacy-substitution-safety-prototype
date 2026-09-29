import { NextResponse } from 'next/server';
import { getErrorAnalysisReport } from '../../../src/services/errorAnalysisService';

export async function GET() {
  try {
    const report = await getErrorAnalysisReport();
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate error analysis" }, { status: 500 });
  }
}
