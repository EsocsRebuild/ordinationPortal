'use client';

import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

export function HeroBanner() {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-elevated border border-slate-200/90 dark:border-slate-800 bg-church-950">
      {/* High-Resolution Photography Container */}
      <div className="relative h-48 sm:h-60 md:h-72 w-full overflow-hidden">
        <img
          src="/brand/hero-fathers.webp"
          alt="ESOCS Ordained Council of Elders and Ministers"
          className="w-full h-full object-cover object-top scale-100 hover:scale-105 transition-transform duration-700 ease-out brightness-95 contrast-105"
        />

        {/* Sophisticated Dual-Tone Gradient Overlay for high text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060A17] via-[#060A17]/50 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white" />

        {/* Text Overlay Content */}
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 backdrop-blur-md border border-gold-400/40 text-gold-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
            <span className="tracking-wide">ESOCS Church Worldwide</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-md">
            The Holy Ordination & Consecration Portal
          </h2>

          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl font-sans leading-relaxed drop-shadow-sm">
            Official portal for ecclesiastical vetting, theological examination scoring, and canonical credential issuance across all dioceses.
          </p>
        </div>
      </div>
    </div>
  );
}
