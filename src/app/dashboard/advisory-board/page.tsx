'use client';

import React, { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { AdvisoryBoardDashboard } from '@/components/sections/AdvisoryBoardDashboard';
import { useAuth } from '@/context/AuthContext';
import { CandidateProfile } from '@/types';
import { api } from '@/services/api';
import { AppLoader } from '@/components/ui/AppLoader';

export default function AdvisoryBoardDashboardPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await api.getCandidates();
        setCandidates(data || []);
      } catch (err) {
        console.error('Failed to load synod candidates:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateCandidate = async (updated: CandidateProfile) => {
    setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    try {
      await api.updateCandidate(updated.id, updated, user?.name);
    } catch (e) {
      console.error('Failed to save update:', e);
    }
  };

  const handleBatchApprove = async (ids: string[]) => {
    try {
      await api.batchAction({
        action: 'advance_tier',
        candidateIds: ids,
        targetTier: 'national',
        approverName: user?.name || 'Holy Synod Council of Elders',
        approverRole: 'Advisory Board',
      });
      const data = await api.getCandidates();
      setCandidates(data || []);
    } catch (err) {
      console.error('Batch ratification error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <AppLoader message="Loading Holy Synod Elevation Ratification Deck..." />
      </div>
    );
  }

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
