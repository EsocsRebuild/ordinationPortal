'use client';

import React from 'react';
import { UserCheck, BookOpen, Award, Radio } from 'lucide-react';

interface PathwayItem {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tag: string;
}

const pathwayItems: PathwayItem[] = [
  {
    number: '1',
    title: 'Profile & Records',
    description: 'View your ecclesiastical history and baptismal records.',
    icon: <UserCheck className="w-4 h-4 text-church-600 dark:text-gold-400" />,
    tag: 'Stage 01',
  },
  {
    number: '2',
    title: 'Exams & Vetting',
    description: 'Track theological test scores and committee approval.',
    icon: <BookOpen className="w-4 h-4 text-royal-600 dark:text-purple-400" />,
    tag: 'Stage 02',
  },
  {
    number: '3',
    title: 'Pass & Certificate',
    description: 'Download official admission slip and QR certificate.',
    icon: <Award className="w-4 h-4 text-gold-600 dark:text-gold-400" />,
    tag: 'Stage 03',
  },
];

export function PathwayMarquee() {
  // Duplicate array for seamless infinite marquee loop
  const duplicatedItems = [...pathwayItems, ...pathwayItems, ...pathwayItems, ...pathwayItems];

  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 shadow-subtle backdrop-blur-sm py-3.5">
      {/* TV Marquee Header Indicator */}
      <div className="px-4 pb-2.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-church-900 dark:text-gold-300 font-sans flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" /> Canonical Ordination Pathway
          </span>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          Live Canonical Progression
        </span>
      </div>

      {/* Marquee gradient masks */}
      <div className="pointer-events-none absolute left-0 top-10 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-10 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10" />

      {/* Marquee scrolling track */}
      <div className="flex overflow-hidden group">
        <div className="animate-marquee flex items-center gap-4 group-hover:[animation-play-state:paused] py-1">
          {duplicatedItems.map((item, idx) => (
            <div
              key={`${item.number}-${idx}`}
              className="flex-shrink-0 flex items-center gap-3.5 px-4 py-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/50 hover:border-gold-500/40 transition-all duration-200 shadow-sm w-[290px] sm:w-[320px]"
            >
              {/* Number Badge */}
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-church-900 dark:bg-church-800 text-gold-400 font-bold flex items-center justify-center text-sm shadow-sm border border-gold-500/20">
                {item.number}
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate font-serif">
                    {item.title}
                  </h4>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-church-100 dark:bg-church-900/60 text-church-700 dark:text-gold-300">
                    {item.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug line-clamp-1">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

