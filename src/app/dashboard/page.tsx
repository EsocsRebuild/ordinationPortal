'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AppLoader } from '@/components/ui/AppLoader';

export default function DashboardIndexPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role === 'candidate') {
      router.replace('/dashboard/candidate');
    } else {
      router.replace('/dashboard/admin');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <AppLoader message="Connecting to your canonical dashboard..." />
    </div>
  );
}

