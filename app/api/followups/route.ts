import { NextResponse } from 'next/server';
import { getStorage } from '../../../src/storage';
import { FollowUp } from '../../../src/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const storage = getStorage();
    let followUps = await storage.getFollowUps();

    if (status && status !== 'ALL') {
      followUps = followUps.filter(f => f.status.toUpperCase() === status.toUpperCase());
    }

    if (priority && priority !== 'ALL') {
      followUps = followUps.filter(f => f.priority.toUpperCase() === priority.toUpperCase());
    }

    return NextResponse.json(followUps);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load follow-ups" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const storage = getStorage();

    const newFollowUp: FollowUp = {
      id: `FU-${Date.now().toString(36).toUpperCase()}`,
      caseId: body.caseId,
      priority: body.priority || "MEDIUM",
      owner: body.owner || "UNASSIGNED",
      dueDate: body.dueDate || new Date(Date.now() + 86400000 * 2).toISOString(),
      status: "OPEN",
      escalationLevel: body.escalationLevel || 0,
      overrideReason: body.overrideReason,
      resolutionNotes: body.resolutionNotes || "",
      createdAt: new Date().toISOString(),
      escalationHistory: [
        {
          level: body.escalationLevel || 0,
          note: body.initialNote || "Follow-up record created.",
          timestamp: new Date().toISOString(),
          actor: body.actor || "USER"
        }
      ]
    };

    await storage.saveFollowUp(newFollowUp);
    return NextResponse.json({ success: true, followUp: newFollowUp }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create follow-up" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, escalationLevel, resolutionNotes, actor, note } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing follow-up id" }, { status: 400 });
    }

    const storage = getStorage();
    const existingList = await storage.getFollowUps();
    const current = existingList.find(f => f.id === id);

    if (!current) {
      return NextResponse.json({ error: "Follow-up not found" }, { status: 404 });
    }

    const updates: Partial<FollowUp> = {};
    if (status) updates.status = status;
    if (resolutionNotes !== undefined) updates.resolutionNotes = resolutionNotes;
    if (escalationLevel !== undefined) updates.escalationLevel = escalationLevel;

    if (note || escalationLevel !== undefined || status !== undefined) {
      const history = current.escalationHistory ? [...current.escalationHistory] : [];
      history.push({
        level: escalationLevel !== undefined ? escalationLevel : current.escalationLevel,
        note: note || `Status updated to ${status || current.status}`,
        timestamp: new Date().toISOString(),
        actor: actor || "PHARMACIST"
      });
      updates.escalationHistory = history;
    }

    const updated = await storage.updateFollowUp(id, updates);
    return NextResponse.json({ success: true, followUp: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update follow-up" }, { status: 500 });
  }
}
