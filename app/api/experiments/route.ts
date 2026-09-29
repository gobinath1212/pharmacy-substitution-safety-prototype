import { NextResponse } from 'next/server';
import { getStorage } from '../../../src/storage';
import { runComparativeExperiment } from '../../../src/services/experimentService';

export async function GET() {
  try {
    const storage = getStorage();
    const runs = await storage.getExperimentRuns();
    return NextResponse.json({
      totalRuns: runs.length,
      runs
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load experiment runs" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const runResult = await runComparativeExperiment();
    return NextResponse.json({
      success: true,
      message: "Comparative experiment completed and persisted successfully.",
      run: runResult
    });
  } catch (error: any) {
    console.error("Experiment run error:", error);
    return NextResponse.json({ error: error.message || "Failed to run experiment" }, { status: 500 });
  }
}
