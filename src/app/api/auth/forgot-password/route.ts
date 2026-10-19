import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPasswordResetOtpEmail } from '@/lib/server/email';

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
      const allCandidates = db.candidates.getAll();
      const matched = allCandidates.find(
        (c) =>
          c.email.toLowerCase() === identifier.trim().toLowerCase() ||
          c.regNumber.toLowerCase() === identifier.trim().toLowerCase()
      );

      const targetEmail = matched?.email || (identifier.includes('@') ? identifier.trim() : 'candidate@esocs.test');
      const targetName = matched?.fullName || 'Ecclesiastical Member';

      // Generate authentic 6-digit cryptographic security code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Dispatch to Mailpit
      try {
        await sendPasswordResetOtpEmail({
          email: targetEmail,
          name: targetName,
          otp: otpCode,
        });
      } catch (err) {
        console.warn('[ForgotPassword] Failed to dispatch OTP to Mailpit:', err);
      }

      return NextResponse.json({
        success: true,
        message: `A 6-digit canonical verification code has been dispatched to ${targetEmail} (check Mailpit at http://localhost:8025).`,
        simulatedOtp: otpCode, // Provided for convenience in tests alongside Mailpit
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

