'use client';

import React, { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { CandidateDashboard } from '@/components/sections/CandidateDashboard';
import { useAuth } from '@/context/AuthContext';
import { CandidateProfile } from '@/types';
import { MOCK_CANDIDATES } from '@/lib/mockData';
import { api } from '@/services/api';

export default function CandidateDashboardPage() {
  const { user } = useAuth();
  const [candidate, setCandidate] = useState<CandidateProfile>(MOCK_CANDIDATES[0]);

  useEffect(() => {
    async function loadData() {
      try {
        const candidates = await api.getCandidates();
        if (candidates && candidates.length > 0) {
          const found = candidates.find((c) => c.id === user?.candidateId) || candidates[0];
          setCandidate(found);
        }
      } catch {
        // Fallback to local
      }
    }
    loadData();
  }, [user]);

  return (
    <AuthGuard allowedRoles={['candidate', 'super_admin']}>
      <DashboardLayout activeSectionTitle="Ordinand Dossier & Clearance">
        <CandidateDashboard candidate={candidate} />
      </DashboardLayout>
    </AuthGuard>
  );
}

