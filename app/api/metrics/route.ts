import { NextResponse } from 'next/server';
import { calculateMetrics } from '../../../src/services/metrics';

export async function GET() {
  try {
    const metrics = calculateMetrics();
    return NextResponse.json(metrics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to calculate metrics" }, { status: 500 });
  }
}
