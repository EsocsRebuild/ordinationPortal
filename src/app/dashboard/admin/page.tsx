'use client';

import React, { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { SuperAdminDashboard } from '@/components/sections/SuperAdminDashboard';
import { useAuth } from '@/context/AuthContext';
import { CandidateProfile } from '@/types';
import { MOCK_CANDIDATES } from '@/lib/mockData';
import { api } from '@/services/api';
import { generateCertificateHash } from '@/utils/certificate';

export default function SuperAdminDashboardPage() {
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

  const handleBatchGenerateCerts = () => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (['board_approved', 'investiture_assigned', 'ordained'].includes(c.stage)) {
          const hash = c.verificationHash || generateCertificateHash(c.regNumber, c.fullName, c.targetRankName, 2026);
          const certNo = c.certificateNumber || `CERT-2026-${c.targetRankId.replace('rank_', '').toUpperCase()}-${c.regNumber.split('/').pop()}`;

          const updated = {
            ...c,
            certificateNumber: certNo,
            verificationHash: hash,
            lastUpdated: new Date().toISOString().split('T')[0],
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

