'use client';

import React from 'react';
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
} from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeSectionTitle: string;
}

export function DashboardLayout({ children, activeSectionTitle }: DashboardLayoutProps) {
  const { user, logout, switchUserRole } = useAuth();

  if (!user) return null;
  const roleConfig = ROLE_CONFIGS[user.role];

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Ecclesiastical Nav */}
      <header className="sticky top-0 z-40 bg-church-950 border-b border-church-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left brand with official logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5">
                <EsocsLogo size={36} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm sm:text-base tracking-tight text-white">
                      ESOCS HOLY ORDER
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gold-600/30 text-gold-300 border border-gold-500/30">
                      Apex Ordination Portal
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Right User, Theme & Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-white flex items-center justify-end gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  {user.name}
                </span>
                <span className="text-[11px] text-gold-300 font-medium">{user.roleTitle}</span>
              </div>

              <div className="h-8 w-px bg-church-800 hidden md:block" />

              <ThemeToggle className="bg-church-900 border-church-800 text-church-300 hover:text-white" />

              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-church-300 hover:text-white bg-church-900 hover:bg-church-800 rounded-lg border border-church-800 transition-colors"
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
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 py-3 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-church-800 dark:hover:text-gold-300">
              Portal Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">{roleConfig.title}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-church-700 dark:text-gold-400 font-medium">{activeSectionTitle}</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400 shrink-0" />
              <span className="truncate max-w-[280px]">{user.jurisdiction}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Switcher for testing all integrated roles */}
        <RoleSwitcher currentSession={user} onSelectRole={(s) => switchUserRole(s.role)} />

        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 1925 – 2026 The Eternal Sacred Order of the Cherubim and Seraphim (Mount Zion Worldwide).</p>
          <p className="font-mono text-[11px]">
            Central Secretariat Ordination Portal v1.0.0 • Micro-Integrated Enterprise Ecosystem
          </p>
        </div>
      </footer>
    </div>
  );
}
