'use client';

import React, { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { AdvisoryBoardDashboard } from '@/components/sections/AdvisoryBoardDashboard';
import { useAuth } from '@/context/AuthContext';
import { CandidateProfile } from '@/types';
import { MOCK_CANDIDATES } from '@/lib/mockData';
import { api } from '@/services/api';

export default function AdvisoryBoardDashboardPage() {
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

  const handleBatchApprove = (ids: string[]) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (ids.includes(c.id)) {
          const updated = {
            ...c,
            stage: 'board_approved' as CandidateProfile['stage'],
            lastUpdated: new Date().toISOString().split('T')[0],
            screeningNotes: [
              ...(c.screeningNotes || []),
              `Decreed and formally ratified by Holy Order Advisory Board & Council of Elders on ${new Date().toLocaleDateString()}.`,
            ],
          };
          api.updateCandidate(c.id, updated).catch(console.error);
          return updated;
        }
        return c;
      })
    );
  };

  if (!user) return null;

  return (
    <AuthGuard allowedRoles={['advisory_board', 'super_admin']}>
      <DashboardLayout activeSectionTitle="Holy Synod Elevation Ratification Deck">
        <AdvisoryBoardDashboard
          session={user}
          candidates={candidates}
          onUpdateCandidate={handleUpdateCandidate}
          onBatchApprove={handleBatchApprove}
        />
      </DashboardLayout>
    </AuthGuard>
  );
}

