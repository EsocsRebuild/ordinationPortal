import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password, section, role } = body;

    const user = db.users.authenticate(identifier || '', section);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials or jurisdiction.' },
        { status: 401 }
      );
    }

    const token = `esocs_jwt_${Buffer.from(
      JSON.stringify({ userId: user.userId, role: user.role, timestamp: Date.now() })
    ).toString('base64')}`;

    return NextResponse.json({
      success: true,
      token,
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Authentication service error' },
      { status: 500 }
    );
  }
}
