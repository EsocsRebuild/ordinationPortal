'use client';

import React, { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { ParishLeaderDashboard } from '@/components/sections/ParishLeaderDashboard';
import { useAuth } from '@/context/AuthContext';
import { CandidateProfile } from '@/types';
import { MOCK_CANDIDATES } from '@/lib/mockData';
import { api } from '@/services/api';

export default function ParishLeaderDashboardPage() {
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

  const handleAddNewNomination = async (newCand: Partial<CandidateProfile>) => {
    try {
      const created = await api.createNomination(newCand);
      setCandidates((prev) => [created, ...prev]);
    } catch {
      const id = `cand-${String(candidates.length + 1).padStart(3, '0')}`;
      const fallback: CandidateProfile = {
        id,
        regNumber: `ESOCS/ORD/2026/${Math.floor(100 + Math.random() * 900)}`,
        fullName: newCand.fullName || '',
        email: newCand.email || '',
        phone: newCand.phone || '',
        gender: newCand.gender || 'male',
        dateOfBirth: newCand.dateOfBirth || '',
        occupation: 'Church Worker',
        maritalStatus: 'married',
        dateJoinedChurch: '2005-01-01',
        baptismDate: newCand.baptismDate || '',
        currentRank: newCand.currentRank || 'Pastor',
        currentRankYear: newCand.currentRankYear || 2022,
        tenureYears: 4,
        tenureValid: true,
        targetRankId: newCand.targetRankId || 'rank_evangelist',
        targetRankName: newCand.targetRankName || 'Evangelist',
        province: 'Lagos Central Province',
        district: 'Surulere District',
        parish: 'Mount Zion Cathedral Branch',
        branchPriestName: user?.name || '',
        stage: 'nominated',
        currentVettingTier: 'branch',
        submissionDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        attendanceRecordPercentage: 94,
        conductRating: 'exemplary',
        duesStatus: 'pending',
        duesAmountPaid: 0,
        levyBreakdown: {
          branchLevy: 15000,
          districtLevy: 15000,
          provincialLevy: 20000,
          nationalFee: 30000,
          total: 80000,
        },
        screeningNotes: newCand.screeningNotes || [],
      };
      setCandidates((prev) => [fallback, ...prev]);
    }
  };

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

