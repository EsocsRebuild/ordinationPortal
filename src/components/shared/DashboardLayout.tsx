'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ROLE_CONFIGS } from '@/utils/security';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { EsocsLogo } from '@/components/ui/EsocsLogo';
import {
  LogOut,
  ChevronRight,
  User,
  Church,
  MapPin,
  Shield,
  Layers,
} from 'lucide-react';

import { InactivityTimer } from './InactivityTimer';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeSectionTitle: string;
}

export function DashboardLayout({ children, activeSectionTitle }: DashboardLayoutProps) {
  const { user, logout } = useAuth();

  if (!user) return null;
  const roleConfig = ROLE_CONFIGS[user.role];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 transition-colors duration-200 antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Inactivity Auto-Logout Monitor */}
      <InactivityTimer timeoutMinutes={15} warningSeconds={60} />
      {/* Top Ecclesiastical Nav */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left brand with official logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <EsocsLogo size={34} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm sm:text-base tracking-tight text-white group-hover:text-amber-400 transition-colors">
                      ESOCS HOLY ORDER
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Ordination Portal
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Right User Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white flex items-center justify-end gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  {user.name}
                </span>
                <span className="text-[11px] text-amber-300 font-medium">{roleConfig.badgeLabel}</span>
              </div>

              <div className="h-6 w-px bg-slate-800 hidden sm:block" />

              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 transition-all font-medium"
                title="Sign out of Canonical Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-Header Breadcrumb & Jurisdiction Bar */}
      <div className="bg-slate-900/50 border-b border-slate-800/80 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Link href="/" className="hover:text-amber-300 transition-colors">
              Portal Home
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-slate-300 font-medium">{roleConfig.title}</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-amber-400 font-medium">{activeSectionTitle}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate max-w-[320px] text-slate-300">{user.jurisdiction}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {children}
      </main>

      {/* Clean Modern Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 1925 – 2026 The Eternal Sacred Order of the Cherubim and Seraphim (Mount Zion Worldwide).</p>
          <p className="font-mono text-[11px] text-slate-600">
            Central Secretariat Ordination Governance Engine
          </p>
        </div>
      </footer>
    </div>
  );
}
