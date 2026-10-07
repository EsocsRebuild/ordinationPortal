import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { otp, rememberDevice } = body;

    // In demo/canonical simulation, accept valid 6-digit OTPs
    if (!otp || otp.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 6-digit authentication token.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Multi-factor authentication verified.',
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

