'use client';

import React, { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { ParishLeaderDashboard } from '@/components/sections/ParishLeaderDashboard';
import { useAuth } from '@/context/AuthContext';
import { CandidateProfile } from '@/types';
import { api } from '@/services/api';
import { AppLoader } from '@/components/ui/AppLoader';

export default function ParishLeaderDashboardPage() {
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
        console.error('Failed to load parish candidates:', err);
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

  const handleAddNewNomination = async (newCand: Partial<CandidateProfile>) => {
    try {
      const created = await api.createNomination({
        ...newCand,
        branchPriestName: user?.name,
        parish: user?.jurisdiction?.split(',')[0] || newCand.parish,
      });
      setCandidates((prev) => [created, ...prev]);
    } catch (e) {
      console.error('Failed to create nomination:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <AppLoader message="Loading Branch Nominations & Roster..." />
      </div>
    );
  }

  if (!user) return null;

  return (
    <AuthGuard allowedRoles={['parish_leader', 'super_admin']}>
      <DashboardLayout activeSectionTitle="Branch Nominations & Endorsement Roster">
        <ParishLeaderDashboard
          session={user}
          candidates={candidates}
          onUpdateCandidate={handleUpdateCandidate}
          onAddNewNomination={handleAddNewNomination}
        />
      </DashboardLayout>
    </AuthGuard>
  );
}
