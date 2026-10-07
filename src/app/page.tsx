'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { EsocsLogo } from '@/components/ui/EsocsLogo';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { AppLoader } from '@/components/ui/AppLoader';
import { PathwayMarquee } from '@/components/ui/PathwayMarquee';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { TwoFactorModal } from '@/components/auth/TwoFactorModal';
import {
  Shield,
  ArrowRight,
  Lock,
  User,
  AlertCircle,
  UserPlus,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function HomePage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  // App loader transition on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim()) {
      setErrorMsg('Please enter your Registration Number or Church Email.');
      return;
    }

    try {
      await login({
        identifier: identifier.trim(),
        password: password || 'password',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to sign in. Please verify your credentials.');
    }
  };

  const handleQuickSelect = (email: string) => {
    setIdentifier(email);
    setPassword('••••••••••••');
  };

  if (isInitialLoading) {
    return <AppLoader message="Connecting to ESOCS Ordination Portal..." subMessage="ESOCS Central Secretariat Worldwide" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navigation Header with Official Brand Crest */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EsocsLogo size={40} showText={true} />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-church-50 hover:bg-church-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-church-800 dark:text-gold-300 border border-slate-200/80 dark:border-slate-700 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-gold-500" />
              Apply for Ordination
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Authentic ESOCS Ordained Elders & Fathers of the Church Banner */}
        <HeroBanner />

        {/* Responsive Grid: Text -> Login (mobile order) & Side-by-Side (desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Welcome Text Section (Order 1 on mobile & desktop) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 dark:bg-gold-500/15 text-gold-800 dark:text-gold-300 text-xs font-semibold border border-gold-400/30">
              <Shield className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
              Holy Order Consecration & Ordination Exercise
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-church-950 dark:text-white leading-[1.15]">
                Welcome to ESOCS Ordination Portal
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-sans max-w-xl">
                The official canonical platform for candidates, parish priests, screening officers, and secretariat administrators of The Eternal Sacred Order of the Cherubim and Seraphim Worldwide.
              </p>
            </div>

            {/* Quick Action Button for New Candidates */}
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-church-950 font-bold text-xs shadow-sm hover:shadow transition-all duration-200"
              >
                <UserPlus className="w-4 h-4" />
                New Candidate? Apply for Ordination
              </button>
            </div>

            {/* TV-style Pathway Marquee */}
            <div className="hidden lg:block pt-3">
              <PathwayMarquee />
            </div>
          </div>

          {/* Sign-In Card (Order 2 on mobile, right column on desktop) */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-card space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-church-900 text-gold-400">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                      Sign In to Portal
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Enter your church registration details to continue
                    </p>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-3.5 sm:space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Registration Number or Church Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. ESOCS/ORD/2026/0481 or email"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-church-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-medium text-slate-700 dark:text-slate-300">
                      Password / Access Key
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotOpen(true)}
                      className="text-[11px] text-gold-700 dark:text-gold-400 hover:underline font-medium flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" /> Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-church-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  fullWidth
                  loading={isLoading}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Sign In to Dashboard
                </Button>
              </form>

              {/* Self-Registration Banner */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  Not yet registered for the 2026 Ordination Exercise?
                </p>
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(true)}
                  className="w-full py-2 px-3 rounded-xl border border-gold-500/40 hover:border-gold-500 bg-gold-500/10 hover:bg-gold-500/20 text-gold-900 dark:text-gold-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Apply / Self-Register Candidate Profile
                </button>
              </div>

              {/* Quick Access Demo Accounts */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                  Quick Access Demo Accounts:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleQuickSelect('e.adeleke@esocs.church')}
                    className="p-1.5 text-left rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 truncate transition-colors"
                  >
                    👤 Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelect('admin@esocs.church')}
                    className="p-1.5 text-left rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 truncate transition-colors"
                  >
                    🛡️ Secretariat Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelect('f.okon@esocs.church')}
                    className="p-1.5 text-left rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 truncate transition-colors"
                  >
                    ⛪ Parish Priest
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelect('screening@esocs.church')}
                    className="p-1.5 text-left rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 truncate transition-colors"
                  >
                    📋 Screening Board
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View TV Pathway Marquee (comes after login on mobile) */}
        <div className="block lg:hidden pt-2">
          <PathwayMarquee />
        </div>
      </main>

      {/* Modals for Self-Registration, Forgot Password & 2FA */}
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        onSuccessLogin={(id) => {
          setIdentifier(id);
          setPassword('');
        }}
      />
      <TwoFactorModal />

      {/* Clean, Modest Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-5 sm:py-6 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 1925 – 2026 The Eternal Sacred Order of the Cherubim and Seraphim Worldwide.</p>
          <span className="font-mono text-[11px] text-slate-400">Canonical Ordination Portal</span>
        </div>
      </footer>
    </div>
  );
}
