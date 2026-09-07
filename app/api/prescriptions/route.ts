import { NextResponse } from 'next/server';
import { PRESCRIPTIONS } from '../../../src/data/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const rx = PRESCRIPTIONS.find(p => p.id === id);
    if (!rx) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rx);
  }

  return NextResponse.json(PRESCRIPTIONS);
}
