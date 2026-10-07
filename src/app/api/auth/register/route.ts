import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      gender,
      currentRank,
      targetRankName,
      province,
      district,
      parish,
      password,
      enable2FA,
    } = body;

    if (!fullName || !email || !password || !province || !parish) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required registration fields.' },
        { status: 400 }
      );
    }

    const { user, candidate } = db.users.register({
      fullName,
      email,
      phone: phone || '+234 800 000 0000',
      gender: gender || 'male',
      currentRank: currentRank || 'Member',
      targetRankName: targetRankName || 'Rabbi',
      province,
      district,
      parish,
      password,
      enable2FA: !!enable2FA,
    });

    const token = `esocs_jwt_${Buffer.from(
      JSON.stringify({ userId: user.userId, role: user.role, timestamp: Date.now() })
    ).toString('base64')}`;

    return NextResponse.json({
      success: true,
      message: 'Canonical application submitted successfully.',
      token,
      user,
      candidate,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Registration service error' },
      { status: 500 }
    );
  }
}

