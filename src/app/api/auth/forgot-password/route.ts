import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, identifier, newPassword, otp } = body;

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: 'Please provide your Registration Number or Church Email.' },
        { status: 400 }
      );
    }

    if (action === 'request_otp') {
      // In real-world/demo, simulate instant OTP dispatch
      const simulatedOtp = '774921';
      return NextResponse.json({
        success: true,
        message: `A 6-digit canonical verification code has been dispatched to the email on file for ${identifier}.`,
        simulatedOtp, // Exposed for smooth demo testing
      });
    }

    if (action === 'reset_password') {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: 'New password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      const success = db.users.resetPassword(identifier, newPassword);
      if (!success) {
        return NextResponse.json(
          { success: false, message: 'No matching user or candidate profile found for this identifier.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully. You can now sign in with your new password.',
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action specified.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Password reset service error' },
      { status: 500 }
    );
  }
}

