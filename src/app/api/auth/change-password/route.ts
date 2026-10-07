import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Valid User ID and new password (min 6 chars) are required.' },
        { status: 400 }
      );
    }

    const success = db.users.changePassword(userId, newPassword);
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'User not found or unable to change password.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password successfully updated.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Change password service error' },
      { status: 500 }
    );
  }
}

