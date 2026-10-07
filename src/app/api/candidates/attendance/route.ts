import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSuccessResponse, createErrorResponse } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const candidates = db.candidates.getAll();
    const eligible = candidates.filter((c) =>
      ['board_approved', 'investiture_assigned', 'ordained'].includes(c.stage) || c.currentVettingTier === 'national'
    );

    const totalEligible = eligible.length > 0 ? eligible.length : candidates.length;
    const targetPool = eligible.length > 0 ? eligible : candidates;

    const checkedInCount = targetPool.filter((c) => c.isCheckedIn).length;
    const pendingCount = Math.max(0, totalEligible - checkedInCount);
    const attendancePercentage = totalEligible > 0 ? Math.round((checkedInCount / totalEligible) * 100) : 0;

    // Breakdown by Target Rank
    const rankMap: Record<string, { rankName: string; total: number; checkedIn: number }> = {};
    targetPool.forEach((c) => {
      const r = c.targetRankName;
      if (!rankMap[r]) rankMap[r] = { rankName: r, total: 0, checkedIn: 0 };
      rankMap[r].total += 1;
      if (c.isCheckedIn) rankMap[r].checkedIn += 1;
    });

    const rankBreakdown = Object.values(rankMap).sort((a, b) => b.total - a.total);

    // Breakdown by Province
    const provMap: Record<string, { province: string; total: number; checkedIn: number }> = {};
    targetPool.forEach((c) => {
      const p = c.province;
      if (!provMap[p]) provMap[p] = { province: p, total: 0, checkedIn: 0 };
      provMap[p].total += 1;
      if (c.isCheckedIn) provMap[p].checkedIn += 1;
    });

    const provinceBreakdown = Object.values(provMap).sort((a, b) => b.total - a.total);

    // Recent arrivals feed (Latest checked-in)
    const recentArrivals = targetPool
      .filter((c) => c.isCheckedIn && c.checkInTimestamp)
      .sort((a, b) => new Date(b.checkInTimestamp!).getTime() - new Date(a.checkInTimestamp!).getTime())
      .slice(0, 15)
      .map((c) => ({
        id: c.id,
        regNumber: c.regNumber,
        fullName: c.fullName,
        targetRankName: c.targetRankName,
        province: c.province,
        seatNumber: c.seatNumber || 'Zone A - Chancel Pew',
        checkInTimestamp: c.checkInTimestamp,
        accreditedBy: c.accreditedBy || 'Accreditation Marshal',
      }));

    return createSuccessResponse(
      {
        totalEligible,
        checkedInCount,
        pendingCount,
        attendancePercentage,
        rankBreakdown,
        provinceBreakdown,
        recentArrivals,
      },
      'Live ordination attendance metrics computed successfully.',
      200
    );
  } catch (error: any) {
    return createErrorResponse(error.message || 'Failed to aggregate attendance metrics.', [error.message], 500);
  }
}

