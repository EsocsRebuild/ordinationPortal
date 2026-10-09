'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLoader } from '@/components/ui/AppLoader';

export default function AccreditationPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <AppLoader message="Connecting to Executive Admin Portal..." />
    </div>
  );
}

