'use client';

import React, { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { ScreeningDashboard } from '@/components/sections/ScreeningDashboard';
import { useAuth } from '@/context/AuthContext';
import { CandidateProfile } from '@/types';
import { MOCK_CANDIDATES } from '@/lib/mockData';
import { api } from '@/services/api';

export default function ScreeningDashboardPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateProfile[]>(MOCK_CANDIDATES);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getCandidates();
        if (data && data.length > 0) setCandidates(data);
      } catch {
        // Fallback
      }
    }
    loadData();
  }, []);

  const handleUpdateCandidate = async (updated: CandidateProfile) => {
    setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    try {
      await api.updateCandidate(updated.id, updated);
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return null;

  return (
    <AuthGuard allowedRoles={['screening_officer', 'super_admin']}>
      <DashboardLayout activeSectionTitle="Screening & Vetting Directorate">
        <ScreeningDashboard
          session={user}
          candidates={candidates}
          onUpdateCandidate={handleUpdateCandidate}
        />
      </DashboardLayout>
    </AuthGuard>
  );
}

