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
    <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 space-y-6 max-w-sm mx-auto">
      
      {/* Animated Stately Crest Container */}
      <div className="relative flex items-center justify-center w-28 h-28">
        
        {/* Soft Ambient Pulse Aura */}
        <div className="absolute inset-0 rounded-full bg-amber-500/15 dark:bg-amber-400/20 blur-xl animate-pulse" />

        {/* Outer Counter-Clockwise Thin Ring */}
        <div
          className="absolute inset-0 rounded-full border border-dashed border-amber-500/40 dark:border-amber-400/40 animate-spin"
          style={{ animationDuration: '14s', animationDirection: 'reverse' }}
        />

        {/* Inner Clockwise Golden Orbit Ring */}
        <div
          className="absolute inset-2 rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-amber-500 dark:border-t-amber-400 animate-spin"
          style={{ animationDuration: '1.8s' }}
        />

        {/* Core Official Crest Badge */}
        <div className="relative z-10 w-14 h-14 p-2 rounded-2xl bg-white dark:bg-[#0c1222] shadow-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center transform transition-transform hover:scale-105">
          <img
            src="/brand/esocs-crest.png"
            alt="ESOCS Holy Order"
            className="w-10 h-10 object-contain drop-shadow-sm"
          />
        </div>
      </div>

      {/* Narrative Progress Message */}
      <div className="space-y-1.5 px-4">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight font-sans">
          {message}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
          {subMessage}
        </p>
      </div>

      {/* High-Precision Continuous Progress Shimmer */}
      <div className="w-44 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500 to-transparent w-full h-full animate-[shimmer_1.5s_infinite]" />
      </div>
    </div>
  );

  if (!fullScreen) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/95 dark:bg-[#070b14]/95 backdrop-blur-sm transition-colors duration-300">
      {content}
    </div>
  );
}
