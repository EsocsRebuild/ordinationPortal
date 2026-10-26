import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSuccessResponse, createErrorResponse } from '@/lib/server/response';
import { realtimeHub } from '@/lib/server/realtimeHub';

export const dynamic = 'force-dynamic';

export interface FormConfig {
  conferenceYear: number;
  conferenceTitle: string;
  theme: string;
  registrationOpen: boolean;
  minTenureYears: number;
  availableOrders: Array<{ id: 'male' | 'female'; label: string }>;
  contactEmail: string;
  contactPhone: string;
  statutoryLevyNotice: string;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
}

const DEFAULT_FORM_CONFIG: FormConfig = {
  conferenceYear: 2026,
  conferenceTitle: 'Holy Order General Conference 2026 Candidate Portal',
  theme: 'Walking in the Light of His Eternal Covenant',
  registrationOpen: true,
  minTenureYears: 3,
  availableOrders: [
    { id: 'male', label: 'Brethren Order (Male)' },
    { id: 'female', label: 'Sisters Order (Female)' },
  ],
  contactEmail: 'secretariat@esocs.church',
  contactPhone: '+234 1 234 5678',
  statutoryLevyNotice: 'Statutory levies cover local branch ordination dues, district levies, provincial clearance, and national gazette registration.',
  bankDetails: {
    bankName: 'Zenith Bank Plc',
    accountName: 'ESOCS Holy Order Secretariat',
    accountNumber: '1012345678',
  },
};

// In-memory or persisted configuration
let currentConfig: FormConfig = { ...DEFAULT_FORM_CONFIG };

export async function GET() {
  try {
    const hierarchy = db.hierarchy.get();
    const ranks = db.ranks.get();

    return createSuccessResponse(
      {
        config: currentConfig,
        hierarchy,
        ranks,
        provincesCount: hierarchy.length,
        ranksCount: ranks.length,
      },
      'Registration form configuration retrieved successfully.',
      200
    );
  } catch (error: any) {
    return createErrorResponse(
      error.message || 'Failed to fetch form configuration.',
      [error.message || 'Server error'],
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { config, performedBy } = body;

    if (config) {
      currentConfig = {
        ...currentConfig,
        ...config,
      };

      db.auditLogs.add({
        performedBy: performedBy || 'Admin Directorate',
        action: 'FORM_CONFIG_UPDATE',
        details: `Updated ordination form configuration for General Conference ${currentConfig.conferenceYear}.`,
      });

      realtimeHub.publish('HIERARCHY_UPDATED', { config: currentConfig }, { actor: performedBy || 'Admin Directorate' });

      return createSuccessResponse(
        { config: currentConfig },
        'Registration form configuration updated successfully.',
        200
      );
    }

    return createErrorResponse('No configuration data provided', ['Invalid payload'], 400);
  } catch (error: any) {
    return createErrorResponse(
      error.message || 'Failed to update form configuration.',
      [error.message || 'Server error'],
      500
    );
  }
}

