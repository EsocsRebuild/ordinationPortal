import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const summary = db.analytics.getSummary();
    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

