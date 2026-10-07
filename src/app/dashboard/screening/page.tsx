'use client';

import React, { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { ScreeningDashboard } from '@/components/sections/ScreeningDashboard';
import { useAuth } from '@/context/AuthContext';
import { CandidateProfile } from '@/types';
import { api } from '@/services/api';
import { AppLoader } from '@/components/ui/AppLoader';

export default function ScreeningDashboardPage() {
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
        console.error('Failed to load screening candidates:', err);
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
      console.error('Failed to save screening update:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <AppLoader message="Loading CMC Screening & Theological Exam Roster..." />
      </div>
    );
  }

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
