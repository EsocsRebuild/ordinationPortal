'use client';

import React, { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { SuperAdminDashboard } from '@/components/sections/SuperAdminDashboard';
import { useAuth } from '@/context/AuthContext';
import { CandidateProfile } from '@/types';
import { api } from '@/services/api';
import { AppLoader } from '@/components/ui/AppLoader';

export default function SuperAdminDashboardPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await api.getCandidates();
      setCandidates(data || []);
    } catch (err) {
      console.error('Failed to load admin candidate roster:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateCandidate = async (updated: CandidateProfile) => {
    setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    try {
      await api.updateCandidate(updated.id, updated, user?.name);
    } catch (e) {
      console.error('Update candidate error:', e);
    }
  };

  const handleBatchGenerateCerts = async () => {
    const eligibleIds = candidates
      .filter((c) => ['board_approved', 'investiture_assigned', 'ordained'].includes(c.stage))
      .map((c) => c.id);

    if (eligibleIds.length === 0) return;

    try {
      await api.batchAction({
        action: 'generate_certs',
        candidateIds: eligibleIds,
        approverName: user?.name || 'Apex Sovereign Admin',
        approverRole: 'Super Admin',
      });
      await loadData();
    } catch (e) {
      console.error('Batch cert generation error:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <AppLoader message="Loading Central Secretariat Sovereign Master Cockpit..." />
      </div>
    );
  }

  if (!user) return null;

  return (
    <AuthGuard allowedRoles={['super_admin']}>
      <DashboardLayout activeSectionTitle="Central Secretariat Sovereign Master Roster">
        <SuperAdminDashboard
          session={user}
          candidates={candidates}
          onUpdateCandidate={handleUpdateCandidate}
          onBatchGenerateCerts={handleBatchGenerateCerts}
        />
      </DashboardLayout>
    </AuthGuard>
  );
}
