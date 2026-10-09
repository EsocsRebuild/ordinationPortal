'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Portal Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 text-red-500 dark:text-red-400 shadow-lg">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Portal Service Notice</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-8">
        An unexpected condition occurred while loading this ecclesiastical portal view. You may attempt to reinitialize or return to the main portal index.
      </p>
      <div className="flex items-center gap-3">
        <Button
          onClick={() => reset()}
          variant="primary"
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reinitialize View
        </Button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          Home
        </Link>
      </div>
    </div>
  );
}

