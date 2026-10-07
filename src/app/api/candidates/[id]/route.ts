import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const candidate = db.candidates.getById(id);

    if (!candidate) {
      return NextResponse.json({ success: false, message: 'Candidate not found in canonical ledger' }, { status: 404 });
    }

    return NextResponse.json({ success: true, candidate });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const candidate = db.candidates.update(id, updates);
    if (!candidate) {
      return NextResponse.json({ success: false, message: 'Candidate not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, candidate });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
