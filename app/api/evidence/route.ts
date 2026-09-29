import { NextResponse } from 'next/server';
import { getStorage } from '../../../src/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('ruleId');
    const evidenceId = searchParams.get('evidenceId');

    const storage = getStorage();
    const catalog = await storage.getEvidenceCatalog();

    if (evidenceId) {
      const item = catalog[evidenceId];
      if (!item) return NextResponse.json({ error: "Evidence item not found" }, { status: 404 });
      return NextResponse.json(item);
    }

    if (ruleId) {
      const item = Object.values(catalog).find(e => e.ruleId === ruleId);
      if (!item) return NextResponse.json({ error: "Evidence item for rule not found" }, { status: 404 });
      return NextResponse.json(item);
    }

    return NextResponse.json({
      disclaimer: "Synthetic experimental rule reference — not a clinical practice guideline.",
      count: Object.keys(catalog).length,
      catalog: Object.values(catalog)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load evidence catalog" }, { status: 500 });
  }
}
