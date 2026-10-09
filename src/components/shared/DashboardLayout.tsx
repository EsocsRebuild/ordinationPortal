'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLE_CONFIGS } from '@/utils/security';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { EsocsLogo } from '@/components/ui/EsocsLogo';
import { NotificationCenter } from '@/components/shared/NotificationCenter';
import { AccountSettingsModal } from '@/components/shared/AccountSettingsModal';
import { LiveSyncStatus } from '@/components/shared/LiveSyncStatus';
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
  Settings,
  HelpCircle,
  Menu,
  X,
  Search,
  Building,
  Bell,
  Sparkles,
  Receipt,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { InactivityTimer } from './InactivityTimer';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeSectionTitle: string;
  currentTab?: string;
}

export function DashboardLayout({ children, activeSectionTitle, currentTab }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop compact mode
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  if (!user) return null;
  const roleConfig = ROLE_CONFIGS[user.role] || {
    title: 'Portal Dashboard',
    badgeLabel: 'Clergy',
  };

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ES';

  const isCandidate = user.role === 'candidate';
  const effectiveTab = currentTab || 'overview';

  const navItems = isCandidate
    ? [
        {
          id: 'overview',
          title: 'My Overview & Records',
          href: '/dashboard/candidate?tab=overview',
          icon: LayoutDashboard,
          badge: 'Home',
          isActive: effectiveTab === 'overview',
        },
        {
          id: 'clearance',
          title: 'Ordination Clearance',
          href: '/dashboard/candidate?tab=clearance',
          icon: CheckSquare,
          badge: '5 of 5',
          isActive: effectiveTab === 'clearance',
        },
        {
          id: 'payments',
          title: 'Payment & Fee Receipts',
          href: '/dashboard/candidate?tab=payments',
          icon: Receipt,
          badge: 'Cleared',
          isActive: effectiveTab === 'payments',
        },
        {
          id: 'pass',
          title: 'Ceremony Pass & Seating',
          href: '/dashboard/candidate?tab=pass',
          icon: QrCode,
          badge: 'Nov 14',
          isActive: effectiveTab === 'pass',
        },
        {
          id: 'support',
          title: 'Support & Help Desk',
          href: '/dashboard/candidate?tab=support',
          icon: MessageSquare,
          isActive: effectiveTab === 'support',
        },
      ]
    : [
        {
          id: 'master',
          title: 'Master Candidate Register',
          href: '/dashboard/admin',
          icon: Users,
          badge: 'Unified',
          isActive: pathname === '/dashboard/admin',
        },
        {
          id: 'vetting',
          title: '5-Tier Vetting Pipeline',
          href: '/dashboard/admin',
          icon: CheckSquare,
          badge: '5 Tiers',
          isActive: false,
        },
        {
          id: 'accreditation',
          title: 'Live Accreditation & Pews',
          href: '/dashboard/admin',
          icon: QrCode,
          badge: 'Live',
          isActive: false,
        },
        {
          id: 'hierarchy',
          title: 'Hierarchy & Quota Deck',
          href: '/dashboard/admin',
          icon: Building,
          isActive: false,
        },
        {
          id: 'financials',
          title: 'Financial Levies Ledger',
          href: '/dashboard/admin',
          icon: Award,
          isActive: false,
        },
      ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200 transition-colors duration-200">
      <InactivityTimer timeoutMinutes={20} warningSeconds={60} />

      {/* ========================================================================= */}
      {/* MOBILE BACKDROP                                                           */}
      {/* ========================================================================= */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* SIDEBAR NAVIGATION                                                        */}
      {/* ========================================================================= */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white dark:bg-[#090e1b] border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-all duration-300 ease-in-out shadow-sm ${
          isCollapsed ? 'lg:w-20' : 'lg:w-72'
        } ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0'}`}
      >
        {/* Header with Crest & Collapse Toggle */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group overflow-hidden">
            <EsocsLogo size={32} />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 transition-opacity duration-200">
                <span className="font-bold text-xs tracking-tight text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                  ESOCS HOLY ORDER
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono tracking-wider truncate">
                  {isCandidate ? 'MEMBER PORTAL' : 'ADMIN PORTAL'}
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card with Click-to-Open Settings */}
        <Tooltip content="Click to view profile & account settings" position="right" className="w-full block">
          <div
            onClick={() => setShowAccountModal(true)}
            className={`mx-3 my-3 p-3 rounded-2xl bg-slate-100 dark:bg-[#0e162a] border border-slate-200 dark:border-slate-800 flex items-center cursor-pointer hover:border-amber-500/50 transition-all ${
              isCollapsed ? 'justify-center' : 'gap-3'
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center shadow-md">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-100 dark:ring-[#0e162a]" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                <span className="inline-block text-[10px] text-amber-700 dark:text-amber-300 font-medium truncate max-w-full">
                  {isCandidate ? 'Ordination Candidate' : roleConfig.badgeLabel}
                </span>
              </div>
            )}
          </div>
        </Tooltip>

        {/* Navigation Categories */}
        <div className="flex-1 px-3 py-2 space-y-6 overflow-y-auto">
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                {isCandidate ? 'MY WORKSPACE' : 'ORDINATION WORKSPACE'}
              </p>
            )}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.isActive;
                
                const linkContent = (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-slate-950/20 text-slate-950'
                            : 'bg-slate-200 dark:bg-slate-800 text-amber-700 dark:text-amber-400 border border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.title} content={item.title} position="right">
                      {linkContent}
                    </Tooltip>
                  );
                }

                return linkContent;
              })}
            </nav>
          </div>

          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                QUICK ACCESS
              </p>
            )}
            <nav className="space-y-1">
              {isCollapsed ? (
                <>
                  <Tooltip content="Verify Accreditation Pass" position="right">
                    <Link
                      href="/verify/cand-001"
                      className="flex items-center justify-center p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <QrCode className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                    </Link>
                  </Tooltip>
                  <Tooltip content="Public Portal Home" position="right">
                    <Link
                      href="/"
                      className="flex items-center justify-center p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <Church className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                    </Link>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Link
                    href="/verify/cand-001"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                    <span>Verify Accreditation Pass</span>
                  </Link>
                  <Link
                    href="/"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <Church className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                    <span>Public Portal Home</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Jurisdiction & Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#070b14]">
          {!isCollapsed && (
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5 px-1">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span className="truncate text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  {user.jurisdiction}
                </span>
              </div>
            </div>
          )}

          {isCollapsed ? (
            <Tooltip content="Sign Out Session" position="right">
              <button
                onClick={logout}
                type="button"
                className="w-full flex items-center justify-center p-2.5 rounded-xl text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-500 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={logout}
              type="button"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Session</span>
            </button>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN WORKSPACE (Header + Body)                                            */}
      {/* ========================================================================= */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out min-w-0 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-[#090e1b]/95 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
          
          {/* Left: Sidebar Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden shrink-0"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen className="w-5 h-5 text-amber-500" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
              <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors shrink-0">
                Portal
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 font-medium shrink-0">{roleConfig.title}</span>
              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
              <span className="text-amber-600 dark:text-amber-400 font-bold truncate">{activeSectionTitle}</span>
            </div>
          </div>

          {/* Center: Global Fast Search */}
          <div className="hidden md:flex items-center max-w-xs w-full relative">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Quick search candidate or pass..."
              className="w-full bg-slate-100 dark:bg-[#0e162a] border border-slate-300 dark:border-slate-700/80 focus:border-amber-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono transition-colors"
            />
          </div>

          {/* Right Actions: Session Status, Alerts, Theme, Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden xl:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Session 2026 Active</span>
            </div>

            <LiveSyncStatus />

            <NotificationCenter />

            <ThemeToggle />

            {/* User Profile Avatar with Click-to-Open Settings */}
            <Tooltip content="Account Settings & Profile" position="bottom">
              <button
                type="button"
                onClick={() => setShowAccountModal(true)}
                className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shadow-md cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all focus:outline-none"
              >
                {initials}
              </button>
            </Tooltip>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Minimalist Admin Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070b14] py-4 px-4 sm:px-8 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} The Eternal Sacred Order of the Cherubim and Seraphim.</span>
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-500">
            ESOCS Ordination System &bull; 2026 Session
          </span>
        </footer>

      </div>

      {/* Account Settings & Profile Modal */}
      {showAccountModal && (
        <AccountSettingsModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
        />
      )}
    </div>
  );
}
