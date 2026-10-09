'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { EsocsLogo } from '@/components/ui/EsocsLogo';
import { AppLoader } from '@/components/ui/AppLoader';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { TwoFactorModal } from '@/components/auth/TwoFactorModal';
import {
  Shield,
  ArrowRight,
  Lock,
  UserPlus,
  QrCode,
  Search,
  CheckCircle2,
  Building2,
  Clock,
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  // Verification Quick Search state
  const [verifyId, setVerifyId] = useState('');
  const [isSearchingVerify, setIsSearchingVerify] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 180);
    return () => clearTimeout(timer);
  }, []);

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = verifyId.trim().toLowerCase();
    if (!cleanId) {
      setVerifyError('Please enter a candidate registration or pass ID.');
      return;
    }
    setVerifyError('');
    setIsSearchingVerify(true);
    router.push(`/verify/${encodeURIComponent(cleanId)}`);
  };

  if (isInitialLoading) {
    return (
      <AppLoader
        message="Loading Canonical Portal..."
        subMessage="The Eternal Sacred Order of the Cherubim & Seraphim"
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200 transition-colors duration-200">
      
      {/* ========================================================================= */}
      {/* CANONICAL HEADER (Fully Responsive, Light & Dark Adaptable)                */}
      {/* ========================================================================= */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#0a0f1d]/95 sticky top-0 z-50 transition-colors backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          
          {/* Official Crest & Brand Title */}
          <Link href="/" className="flex items-center gap-2">
            <EsocsLogo size={30} showText={true} />
          </Link>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm active:scale-95 min-h-[38px]"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:border-amber-500 bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 min-h-[38px]"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>Register</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLoginOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm active:scale-95 min-h-[38px]"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </>
            )}

            <div className="pl-1 border-l border-slate-200 dark:border-slate-800">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SECTION 1: CINEMATIC HD AMBIENT VIDEO HERO                                */}
      {/* ========================================================================= */}
      <section className="relative min-h-[460px] sm:min-h-[520px] flex items-center justify-center border-b border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-[#060810]">
        
        {/* Ambient Video & High-Res Poster Fallback */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/brand/hero-mount-zion.webp"
            className="w-full h-full object-cover object-center opacity-30 dark:opacity-45 brightness-100 dark:brightness-95 transition-opacity"
          >
            <source
              src="/brand/hero-ambient.mp4"
              type="video/mp4"
            />
          </video>
          
          {/* Subtle Contrast Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/70 to-slate-50/85 dark:from-[#070b14] dark:via-[#070b14]/65 dark:to-[#070b14]/75 transition-colors duration-200" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center">
          
          {/* Canonical Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-500/30 bg-amber-100/90 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider mb-4 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
            <span>EST. 1925 &bull; ESOCS HOLY ORDER WORLDWIDE</span>
          </div>

          {/* Stately Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-3 sm:mb-4 font-['Raleway']">
            The Holy Ordination & <br className="hidden sm:inline" />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 dark:from-amber-200 dark:via-amber-400 dark:to-amber-500 font-normal">
              Consecration Gateway
            </span>
          </h1>

          {/* Concise Subtitle */}
          <p className="max-w-lg mx-auto text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 sm:mb-8 px-2">
            The centralized ecclesiastical management platform for clerical nominations, doctrinal vetting, and digital accreditation passes worldwide.
          </p>

          {/* Primary Action Buttons (Mobile-first stacked & ergonomic) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full max-w-xs sm:max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl sm:rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md active:scale-95 min-h-[46px] sm:min-h-[40px]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Access Member Portal</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl sm:rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:border-amber-500 bg-white dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm min-h-[46px] sm:min-h-[40px]"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Register Candidate</span>
            </button>
          </div>

          {/* Conference Status Note */}
          <div className="mt-6 sm:mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-800 dark:text-slate-300">General Conference 2026 Session</span>
            <span className="text-slate-400 dark:text-slate-600">&bull;</span>
            <span>Registry Active</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: INSTANT PASS & CERTIFICATE VERIFICATION (HIGH IMPORTANCE)      */}
      {/* ========================================================================= */}
      <section id="verify-pass" className="py-10 sm:py-16 bg-slate-100/70 dark:bg-[#0a0f1e] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-2xl mx-auto px-3.5 sm:px-6">
          
          <div className="bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-7 shadow-sm dark:shadow-lg transition-colors">
            
            {/* Header in Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Accreditation Pass Verification
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                    Live verification of Holy Ordination credentials
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center self-start sm:self-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>SHA-256 SECURED</span>
              </span>
            </div>

            {/* Direct Verification Form */}
            <form onSubmit={handleQuickVerify} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Enter Candidate ID, Roll Number, or Reference Code
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={verifyId}
                      onChange={(e) => {
                        setVerifyId(e.target.value);
                        if (verifyError) setVerifyError('');
                      }}
                      placeholder="e.g. cand-001 or ESOCS/2026/0842"
                      className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 rounded-lg pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearchingVerify}
                    className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shrink-0 active:scale-95 disabled:opacity-50 min-h-[42px]"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{isSearchingVerify ? 'Verifying...' : 'Verify Pass'}</span>
                  </button>
                </div>

                {verifyError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium">
                    {verifyError}
                  </p>
                )}
              </div>

              {/* Sample Quick Lookups */}
              <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="text-[10px] sm:text-[11px]">Demo Passes:</span>
                {['cand-001', 'cand-002', 'cand-003'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setVerifyId(code);
                      setVerifyError('');
                      router.push(`/verify/${code}`);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-400 text-amber-800 dark:text-amber-300 font-mono text-[10px] transition-colors"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: MINIMALIST EXECUTIVE SECRETARIAT FOOTER                        */}
      {/* ========================================================================= */}
      <footer className="bg-slate-100 dark:bg-[#060810] text-slate-600 dark:text-slate-400 text-xs py-6 sm:py-8 mt-auto border-t border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3.5 border-b border-slate-200 dark:border-slate-800/80">
            <EsocsLogo size={24} showText={true} />
            <div className="flex items-center gap-3 text-[11px]">
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                Portal Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                Register
              </button>
              <a href="#verify-pass" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                Verify Pass
              </a>
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[10px] sm:text-[11px] text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} The Eternal Sacred Order of the Cherubim & Seraphim.
            </div>
            <div className="flex items-center gap-2.5">
              <span>SHA-256 Pass Security</span>
              <span>&bull;</span>
              <span>Canonical Governance</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* AUTHENTICATION & SECURITY MODALS                                          */}
      {/* ========================================================================= */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onOpenForgot={() => {
          setIsLoginOpen(false);
          setIsForgotOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        onSuccessLogin={() => {
          setIsForgotOpen(false);
          setIsLoginOpen(true);
        }}
      />

      <TwoFactorModal />

    </div>
  );
}
