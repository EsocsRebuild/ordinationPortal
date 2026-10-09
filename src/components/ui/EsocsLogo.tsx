'use client';

import React from 'react';

interface EsocsLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function EsocsLogo({
  size = 32,
  className = '',
  showText = false,
}: EsocsLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official ESOCS Brand Crest */}
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        <img
          src="/brand/esocs-crest.png"
          alt="ESOCS Holy Order Official Crest"
          width={size}
          height={size}
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center">
          <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white leading-tight font-sans">
            ESOCS HOLY ORDER
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-normal leading-tight mt-0.5">
            Ordination Directorate
          </span>
        </div>
      )}
    </div>
  );
}
