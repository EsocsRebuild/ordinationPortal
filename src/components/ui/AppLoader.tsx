'use client';

import React from 'react';

interface AppLoaderProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export function AppLoader({
  message = 'Loading ESOCS Ordination Portal...',
  subMessage = 'Connecting to Secure Canonical Ledger • ESOCS Worldwide',
  fullScreen = true,
}: AppLoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-6 max-w-sm mx-auto">
      {/* Official ESOCS Brand Crest with gentle glow */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Ring Glow */}
        <div className="absolute w-28 h-28 rounded-full bg-gold-500/20 blur-xl animate-pulse" />

        {/* Spinning Golden Accent Ring */}
        <div className="w-24 h-24 rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-gold-500 animate-spin absolute" />

        {/* Core Official Crest Image */}
        <div className="relative z-10 w-16 h-16 p-2 rounded-2xl bg-white dark:bg-slate-900 shadow-elevated border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <img
            src="/brand/esocs-crest.png"
            alt="ESOCS Holy Order"
            className="w-12 h-12 object-contain"
          />
        </div>
      </div>

      {/* Progress & Text */}
      <div className="space-y-1.5">
        <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
          {message}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
          {subMessage}
        </p>
      </div>

      {/* Minimal indeterminate progress line */}
      <div className="w-48 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-gold-600 via-gold-400 to-amber-500 rounded-full animate-pulse" />
      </div>
    </div>
  );

  if (!fullScreen) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/95 dark:bg-[#070B14]/95 backdrop-blur-md transition-all duration-300">
      {content}
    </div>
  );
}
