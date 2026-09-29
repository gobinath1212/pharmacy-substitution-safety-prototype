import { NextResponse } from 'next/server';
import { getStorage } from '../../../src/storage';

export async function GET() {
  try {
    const storage = getStorage();
    const rxCount = (await storage.getPrescriptions()).length;
    const medCount = Object.keys(await storage.getMedications()).length;

    return NextResponse.json({
      status: "HEALTHY",
      application: "Pharmacy Substitution Safety Prototype",
      applicationVersion: "1.0.0-final-evaluation-ready",
      rulesEngineVersion: "2026.4-SYNTH",
      datasetVersion: "SYNTH-2026.1",
      storageStatus: "OPERATIONAL",
      databaseHealth: {
        prescriptions: rxCount,
        medications: medCount,
        storageEngine: "LocalFilePersistentStorage"
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "DEGRADED",
      error: error.message || "Storage read error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
