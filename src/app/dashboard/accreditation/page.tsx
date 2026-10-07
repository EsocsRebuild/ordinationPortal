'use client';

import React from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { LiveAccreditationDesk } from '@/components/sections/LiveAccreditationDesk';
import { useAuth } from '@/context/AuthContext';

export default function AccreditationPage() {
  const { user } = useAuth();

  return (
    <AuthGuard allowedRoles={['super_admin', 'screening_officer', 'parish_leader', 'advisory_board']}>
      <DashboardLayout activeSectionTitle="Live Gate Accreditation Desk">
        <LiveAccreditationDesk officerName={user?.name || 'Gate Marshal'} />
      </DashboardLayout>
    </AuthGuard>
  );
}

