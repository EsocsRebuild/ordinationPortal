import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = db.auditLogs.getAll();
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

