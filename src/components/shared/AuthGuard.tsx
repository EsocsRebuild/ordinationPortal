'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Authenticating Portal Session...</p>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="max-w-md w-full bg-slate-950 border border-rose-900/60 p-8 rounded-2xl text-center space-y-4 shadow-2xl">
          <h2 className="text-lg font-bold text-rose-400">Restricted Ecclesiastical Jurisdiction</h2>
          <p className="text-xs text-slate-400">
            Your current role (<strong className="text-white">{user.roleTitle}</strong>) does not have authorization to view this section.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-white font-medium"
          >
            Return to Portal Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

