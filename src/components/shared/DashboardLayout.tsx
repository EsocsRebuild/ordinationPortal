'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLE_CONFIGS } from '@/utils/security';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { EsocsLogo } from '@/components/ui/EsocsLogo';
import { NotificationCenter } from '@/components/shared/NotificationCenter';
import { Tooltip } from '@/components/ui/Tooltip';
import {
  LogOut,
  ChevronRight,
  User,
  Church,
  MapPin,
  Shield,
  Layers,
  LayoutDashboard,
  Users,
  CheckSquare,
  QrCode,
  Award,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Menu,
  X,
  Search,
  Building,
  Bell,
  Sparkles,
} from 'lucide-react';
import { InactivityTimer } from './InactivityTimer';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeSectionTitle: string;
}

export function DashboardLayout({ children, activeSectionTitle }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  if (!user) return null;
  const roleConfig = ROLE_CONFIGS[user.role] || {
    title: 'Portal Dashboard',
    badgeLabel: 'Clergy',
  };

  // Extract initials for circular avatar
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ES';

  const getRoleDashboardHref = (role: string) => {
    switch (role) {
      case 'super_admin':
        return '/dashboard/admin';
      case 'parish_leader':
        return '/dashboard/parish-leader';
      case 'screening_officer':
        return '/dashboard/screening';
      case 'advisory_board':
        return '/dashboard/advisory-board';
      case 'candidate':
      default:
        return '/dashboard/candidate';
    }
  };

  const navItems = [
    {
      title: 'Dossier & Overview',
      href: getRoleDashboardHref(user.role),
      icon: LayoutDashboard,
      badge: 'Active',
    },
    ...(user.role === 'super_admin'
      ? [
          {
            title: 'Candidate Register',
            href: '/dashboard/admin',
            icon: Users,
            badge: '124',
          },
          {
            title: 'Vetting & Screening',
            href: '/dashboard/screening',
            icon: CheckSquare,
            badge: '5 Tiers',
          },
          {
            title: 'Accreditation Desk',
            href: '/dashboard/accreditation',
            icon: QrCode,
            badge: 'Live',
          },
          {
            title: 'Advisory Board',
            href: '/dashboard/advisory-board',
            icon: Shield,
          },
          {
            title: 'Parish Leader Desk',
            href: '/dashboard/parish-leader',
            icon: Church,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
      <InactivityTimer timeoutMinutes={20} warningSeconds={60} />

      {/* ========================================================================= */}
      {/* SIDEBAR NAVIGATION (Desktop & Mobile Drawer)                              */}
      {/* ========================================================================= */}
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#090e1b] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header with Crest */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <EsocsLogo size={32} />
            <div className="flex flex-col">
              <span className="font-bold text-xs tracking-tight text-white group-hover:text-amber-400 transition-colors">
                ESOCS HOLY ORDER
              </span>
              <span className="text-[10px] text-amber-400 font-mono tracking-wider">
                ADMIN PORTAL
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Persona Card */}
        <div className="p-4 mx-4 my-3 rounded-2xl bg-[#0e162a] border border-slate-800 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center shadow-md">
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0e162a]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <span className="inline-block text-[10px] text-amber-300 font-medium truncate max-w-full">
              {roleConfig.badgeLabel}
            </span>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 px-4 py-2 space-y-6 overflow-y-auto">
          <div>
            <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
              CANONICAL WORKSPACE
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-slate-950/20 text-slate-950'
                            : 'bg-slate-800 text-amber-400 border border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
              CANONICAL GOVERNANCE
            </p>
            <nav className="space-y-1">
              <Link
                href="/verify/cand-001"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <QrCode className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Verify Accreditation Pass</span>
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <Church className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Public Portal Gateway</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Jurisdiction & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-[#070b14]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate text-[11px] text-slate-300 font-medium">
                {user.jurisdiction}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            type="button"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN ADMIN WORKSPACE (Header + Body)                                      */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        
        {/* Top Executive Header */}
        <header className="sticky top-0 z-30 h-16 bg-[#090e1b]/95 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 truncate">
              <Link href="/" className="hover:text-amber-400 transition-colors shrink-0">
                Portal
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="text-slate-300 font-medium shrink-0">{roleConfig.title}</span>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className="text-amber-400 font-bold truncate">{activeSectionTitle}</span>
            </div>
          </div>

          {/* Center: Global Fast Search */}
          <div className="hidden md:flex items-center max-w-xs w-full relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Quick search candidate or pass..."
              className="w-full bg-[#0e162a] border border-slate-700/80 focus:border-amber-400 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono transition-colors"
            />
          </div>

          {/* Right Actions: Session Status, Alerts, Theme, Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Automated Session Indicator */}
            <div className="hidden xl:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Session 2026 Active</span>
            </div>

            <NotificationCenter />

            <ThemeToggle />

            {/* User Profile Circle */}
            <Tooltip content={`${user.name} • ${roleConfig.badgeLabel}`} position="bottom">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shadow-md cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all">
                {initials}
              </div>
            </Tooltip>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Minimalist Admin Footer */}
        <footer className="border-t border-slate-800/80 bg-[#070b14] py-4 px-4 sm:px-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} The Eternal Sacred Order of the Cherubim and Seraphim.</span>
          <span className="font-mono text-[11px] text-slate-600">
            Canonical Security Hash SHA-256 Engine
          </span>
        </footer>

      </div>
    </div>
  );
}
