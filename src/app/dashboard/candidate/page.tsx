'use client';

import React, { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { CandidateDashboard } from '@/components/sections/CandidateDashboard';
import { useAuth } from '@/context/AuthContext';
import { CandidateProfile } from '@/types';
import { api } from '@/services/api';
import { AppLoader } from '@/components/ui/AppLoader';

export default function CandidateDashboardPage() {
  const { user } = useAuth();
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setIsLoading(true);
      setErrorMessage(null);

      try {
        if (user?.candidateId) {
          const candidateData = await api.getCandidateById(user.candidateId);
          if (candidateData) {
            setCandidate(candidateData);
            return;
          }
        }

        // Match by email
        if (user?.email) {
          const candidates = await api.getCandidates({ email: user.email });
          if (candidates && candidates.length > 0) {
            setCandidate(candidates[0]);
            return;
          }
        }

        setErrorMessage('No active ordination record found for this account.');
      } catch (err: any) {
        setErrorMessage(err.message || 'Unable to retrieve your ordination profile from the server.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <AppLoader message="Loading your ordination profile & records..." />
      </div>
    );
  }

  if (errorMessage || !candidate) {
    return (
      <AuthGuard allowedRoles={['candidate', 'super_admin']}>
        <DashboardLayout activeSectionTitle="My Profile & Clearance">
          <div className="p-8 text-center max-w-lg mx-auto my-12 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              !
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Candidate Record Not Found</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              {errorMessage || 'Your registration is being verified by the church office. Please refresh or contact your Parish Priest.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-sm"
            >
              Refresh Record
            </button>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={['candidate', 'super_admin']}>
      <DashboardLayout activeSectionTitle="My Profile & Credentials">
        <CandidateDashboard candidate={candidate} />
      </DashboardLayout>
    </AuthGuard>
  );
}
