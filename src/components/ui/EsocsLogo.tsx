'use client';

import React from 'react';

interface EsocsLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function EsocsLogo({
  size = 44,
  className = '',
  showText = false,
}: EsocsLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Official ESOCS Brand Crest */}
      <div
        className="relative shrink-0 transition-transform duration-200 hover:scale-105"
        style={{ width: size, height: size }}
      >
        <img
          src="/brand/esocs-crest.png"
          alt="ESOCS Holy Order Official Crest"
          width={size}
          height={size}
          className="w-full h-full object-contain drop-shadow-sm"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-serif font-bold text-base tracking-tight text-slate-900 dark:text-white leading-tight">
            ESOCS HOLY ORDER
          </span>
          <span className="text-[10px] text-slate-500 dark:text-gold-400 font-medium tracking-wide">
            Ordination Directorate • Worldwide
          </span>
        </div>
      )}
    </div>
  );
}
