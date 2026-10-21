import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendTwoFactorOtpEmail } from '@/lib/server/email';
import { otpStore } from '@/lib/server/otpStore';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action = 'verify', identifier, email, otp, rememberDevice, force } = body;

    const targetIdentifier = (identifier || email || 'candidate@esocs.test').trim().toLowerCase();

    // 1. Check active 2FA status
    if (action === 'status') {
      const status = otpStore.getStatus(targetIdentifier, 'two_factor');
      return NextResponse.json({
        success: true,
        ...status,
      });
    }

    // 2. Request or Resend 2FA Token
    if (action === 'resend' || action === 'request') {
      const isResend = action === 'resend';

      let otpResult;
      try {
        otpResult = otpStore.generateOrResend(targetIdentifier, 'two_factor', {
          force: !!force,
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

      // Dispatch 2FA email directly to Mailpit
      try {
        await sendTwoFactorOtpEmail({
          email: targetIdentifier,
          otp: otpResult.code,
          isResend,
        });
      } catch (err) {
        console.warn('[Verify2FA] Failed to dispatch 2FA OTP to Mailpit:', err);
      }

      return NextResponse.json({
        success: true,
        message: `A fresh 6-digit verification code has been dispatched to ${targetIdentifier}.`,
        expiresAt: otpResult.expiresAt,
        expiresInSeconds: otpResult.expiresInSeconds,
        cooldownSeconds: otpResult.cooldownSeconds,
      });
    }

    // 3. Verify 2FA Token
    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return NextResponse.json(
        { success: false, code: 'INVALID_CODE', message: 'Please enter a valid 6-digit authentication token.' },
        { status: 400 }
      );
    }

    // Check if tracked in otpStore
    const storeStatus = otpStore.getStatus(targetIdentifier, 'two_factor');
    if (storeStatus.exists) {
      const verification = otpStore.verify(targetIdentifier, otp.trim(), 'two_factor');
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
    }

    return NextResponse.json({
      success: true,
      message: 'Multi-factor authentication verified successfully.',
      verified: true,
      remembered: !!rememberDevice,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || '2FA verification service error' },
      { status: 500 }
    );
  }
}
