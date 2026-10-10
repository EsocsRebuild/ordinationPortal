'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { CandidateDashboard } from '@/components/sections/CandidateDashboard';
import { ConsecratedClergyDashboard } from '@/components/sections/ConsecratedClergyDashboard';
import { useAuth } from '@/context/AuthContext';
import { CandidateProfile } from '@/types';
import { api } from '@/services/api';
import { AppLoader } from '@/components/ui/AppLoader';

function CandidateDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = (searchParams.get('tab') as 'overview' | 'clearance' | 'payments' | 'pass' | 'support') || 'overview';

  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'clearance' | 'consecrated'>('clearance');

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
            if (candidateData.stage === 'ordained') {
              setViewMode('consecrated');
            }
            return;
          }
        }

        // Match by email
        if (user?.email) {
          const candidates = await api.getCandidates({ email: user.email });
          if (candidates && candidates.length > 0) {
            setCandidate(candidates[0]);
            if (candidates[0].stage === 'ordained') {
              setViewMode('consecrated');
            }
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
        <DashboardLayout activeSectionTitle="My Profile & Clearance" currentTab={tabParam}>
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

  const isConsecrated = viewMode === 'consecrated';

  const sectionTitles: Record<string, string> = {
    overview: 'My Overview & Records',
    clearance: 'Ordination Clearance',
    payments: 'Payment & Fee Receipts',
    pass: 'Ceremony Pass & Seating',
    support: 'Support & Help Desk',
  };

  const currentSectionTitle = isConsecrated
    ? 'Consecrated Minister Record'
    : sectionTitles[tabParam] || 'My Overview & Records';

  return (
    <AuthGuard allowedRoles={['candidate', 'super_admin']}>
      <DashboardLayout
        activeSectionTitle={currentSectionTitle}
        currentTab={tabParam}
      >
        {isConsecrated ? (
          <ConsecratedClergyDashboard
            candidate={candidate}
            onUpdateCandidate={(updated) => setCandidate(updated)}
            onSwitchToClearanceView={() => setViewMode('clearance')}
          />
        ) : (
          <CandidateDashboard
            candidate={candidate}
            activeTab={tabParam}
            onUpdateCandidate={(updated) => setCandidate(updated)}
            onSwitchToConsecratedView={() => setViewMode('consecrated')}
          />
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}

export default function CandidateDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <AppLoader message="Loading workspace..." />
        </div>
      }
    >
      <CandidateDashboardContent />
    </Suspense>
  );
}
