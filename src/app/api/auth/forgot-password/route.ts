import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPasswordResetOtpEmail } from '@/lib/server/email';
import { otpStore } from '@/lib/server/otpStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, identifier, newPassword, otp, force } = body;

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Please provide your Registration Number or Church Email.' },
        { status: 400 }
      );
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();

    // Resolve user / candidate details
    const allCandidates = db.candidates.getAll();
    const matched = allCandidates.find(
      (c) =>
        c.email.toLowerCase() === normalizedIdentifier ||
        c.regNumber.toLowerCase() === normalizedIdentifier
    );

    const targetEmail = matched?.email || (identifier.includes('@') ? identifier.trim() : 'candidate@esocs.test');
    const targetName = matched?.fullName || 'Church Member';

    // 1. Check status of active OTP
    if (action === 'status') {
      const status = otpStore.getStatus(normalizedIdentifier, 'password_reset');
      return NextResponse.json({
        success: true,
        ...status,
      });
    }

    // 2. Request initial OTP or Resend OTP
    if (action === 'request_otp' || action === 'resend_otp') {
      const isResendAction = action === 'resend_otp';

      let otpResult;
      try {
        otpResult = otpStore.generateOrResend(normalizedIdentifier, 'password_reset', {
          force: !!force,
          metadata: { email: targetEmail, name: targetName },
        });
      } catch (err: any) {
        if (err.code === 'OTP_RATE_LIMITED') {
          return NextResponse.json(
            {
              success: false,
              code: 'OTP_RATE_LIMITED',
              message: err.message,
              retryAfterSeconds: err.retryAfterSeconds,
            },
            { status: 429 }
          );
        }
        throw err;
      }

      // Dispatch directly to Mailpit
      try {
        await sendPasswordResetOtpEmail({
          email: targetEmail,
          name: targetName,
          otp: otpResult.code,
          isResend: isResendAction || otpResult.isResend,
        });
      } catch (err) {
        console.warn('[ForgotPassword] Failed to dispatch OTP to Mailpit:', err);
      }

      return NextResponse.json({
        success: true,
        message: isResendAction || otpResult.isResend
          ? `A fresh 6-digit verification code has been dispatched to ${targetEmail}.`
          : `A 6-digit verification code has been dispatched to ${targetEmail}.`,
        expiresAt: otpResult.expiresAt,
        expiresInSeconds: otpResult.expiresInSeconds,
        cooldownSeconds: otpResult.cooldownSeconds,
        isResend: isResendAction || otpResult.isResend,
      });
    }

    // 3. Reset Password
    if (action === 'reset_password') {
      if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
        return NextResponse.json(
          {
            success: false,
            code: 'INVALID_CODE',
            message: 'Please provide the valid 6-digit verification code sent to your church email.',
          },
          { status: 400 }
        );
      }

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: 'New password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      // Verify OTP and check expiration / attempt lockout
      const verification = otpStore.verify(normalizedIdentifier, otp.trim(), 'password_reset');
      if (!verification.valid) {
        return NextResponse.json(
          {
            success: false,
            code: verification.error,
            message: verification.message,
          },
          { status: 400 }
        );
      }

      // Perform password update in database
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
