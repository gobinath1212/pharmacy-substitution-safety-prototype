import { NextResponse } from 'next/server';
import { checkDataQuality } from '../../../src/services/dataQualityService';

export async function GET() {
  try {
    const report = await checkDataQuality();
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to check data quality" }, { status: 500 });
  }
}
