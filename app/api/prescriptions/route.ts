import { NextResponse } from 'next/server';
import { getStorage } from '../../../src/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search')?.toLowerCase();
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const storage = getStorage();

    if (id) {
      const rx = await storage.getPrescriptionById(id);
      if (!rx) return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
      return NextResponse.json(rx);
    }

    let prescriptions = await storage.getPrescriptions();

    if (search) {
      prescriptions = prescriptions.filter(p =>
        p.id.toLowerCase().includes(search) ||
        p.patientId.toLowerCase().includes(search) ||
        p.medicationId.toLowerCase().includes(search) ||
        (p.scenarioDescription && p.scenarioDescription.toLowerCase().includes(search))
      );
    }

    const total = prescriptions.length;
    const paginated = prescriptions.slice(offset, offset + limit);

    return NextResponse.json({
      total,
      limit,
      offset,
      prescriptions: paginated
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load prescriptions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const storage = getStorage();

    if (!body.id || !body.medicationId || !body.patientId) {
      return NextResponse.json({ error: "Missing required fields (id, medicationId, patientId)" }, { status: 400 });
    }

    const newPrescription = {
      id: body.id,
      medicationId: body.medicationId,
      strength: body.strength || "100 mg",
      route: body.route || "Oral",
      frequency: body.frequency || "Once Daily",
      quantity: body.quantity || 30,
      patientId: body.patientId,
      prescriberId: body.prescriberId || "DOC-01",
      date: body.date || new Date().toISOString(),
      patientConstraints: body.patientConstraints || [],
      allergyIds: body.allergyIds || [],
      expectedOutcome: body.expectedOutcome || "Custom synthetic case",
      scenarioDescription: body.scenarioDescription || "Manual synthetic case creation",
      clinicalNotes: body.clinicalNotes || "Created via API"
    };

    await storage.savePrescription(newPrescription);
    return NextResponse.json({ success: true, prescription: newPrescription }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create prescription" }, { status: 500 });
  }
}
