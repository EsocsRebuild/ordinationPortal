'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserSession } from '@/types';
import { ROLE_CONFIGS } from '@/utils/security';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { EsocsLogo } from '@/components/ui/EsocsLogo';
import { SecuritySettingsModal } from '@/components/shared/SecuritySettingsModal';
import { MapPin, Shield, KeyRound } from 'lucide-react';

interface HeaderProps {
  session: UserSession;
}

export function Header({ session }: HeaderProps) {
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const roleConfig = ROLE_CONFIGS[session.role];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-church-950 border-b border-slate-200 dark:border-church-900 text-slate-900 dark:text-white shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand with Official ESOCS Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <EsocsLogo size={36} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                    ESOCS HOLY ORDER
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-gold-300 border border-amber-500/30">
                    Ordination Portal
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right Session & Theme Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-end gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                {session.name}
              </span>
              <span className="text-[11px] text-amber-700 dark:text-gold-300 font-medium">
                {session.roleTitle}
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-church-800 hidden md:block" />

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex px-2.5 py-1 bg-slate-100 dark:bg-church-900/90 border border-slate-200 dark:border-church-800 rounded-lg items-center gap-1.5 text-xs text-slate-700 dark:text-church-200">
                <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-gold-400 shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-[200px] text-[11px]">
                  {session.jurisdiction}
                </span>
              </div>

              {/* Password & Security Modal Trigger */}
              <button
                type="button"
                onClick={() => setIsSecurityOpen(true)}
                title="Account & Security Settings"
                className="p-2 rounded-xl bg-slate-100 dark:bg-church-900/90 hover:bg-slate-200 dark:hover:bg-church-800 border border-slate-200 dark:border-church-800 text-amber-700 dark:text-gold-400 hover:text-amber-800 dark:hover:text-gold-300 transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                <KeyRound className="w-4 h-4" />
                <span className="hidden md:inline">Security</span>
              </button>

              <ThemeToggle className="bg-slate-100 dark:bg-church-900 border-slate-200 dark:border-church-800 text-slate-700 dark:text-church-300 hover:text-slate-900 dark:hover:text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Security & Password Modal */}
      <SecuritySettingsModal isOpen={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />
    </header>
  );
}
