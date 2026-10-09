'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { EsocsLogo } from '@/components/ui/EsocsLogo';
import { AppLoader } from '@/components/ui/AppLoader';
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
  Sparkles,
  CheckCircle2,
  Church,
  Crown,
  Award,
  ChevronRight,
  Check,
  Building,
  GraduationCap,
  BadgeCheck,
  Flame,
  Scroll,
} from 'lucide-react';

const QUICK_DEMO_PERSONAS = [
  {
    role: 'candidate',
    name: 'Snr. Apostle Emmanuel Adeleke',
    email: 'e.adeleke@esocs.church',
    title: 'Male Candidate (Yellow → Blue)',
    badge: 'Candidate',
    badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    icon: '👨',
  },
  {
    role: 'candidate',
    name: 'Lady Leader Grace Williams',
    email: 'g.williams@esocs.church',
    title: 'Female Candidate (Prophetess → Mother in Israel)',
    badge: 'Candidate',
    badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    icon: '👩',
  },
  {
    role: 'parish_leader',
    name: 'Snr. Apostle Festus Okon',
    email: 'f.okon@esocs.church',
    title: 'Branch Rector & Parish Chairman',
    badge: 'Parish Leader',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    icon: '⛪',
  },
  {
    role: 'screening_officer',
    name: 'Special Snr. Apostle Dr. Bassey',
    email: 'g.bassey@esocs.church',
    title: 'CMC Screening & Examination Director',
    badge: 'CMC Screener',
    badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: '📋',
  },
  {
    role: 'advisory_board',
    name: 'Apostle General Elder M. Adebayo',
    email: 'm.adebayo@esocs.church',
    title: 'Holy Synod Advisory Board of Elders',
    badge: 'Holy Synod',
    badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    icon: '👑',
  },
  {
    role: 'admin',
    name: 'Prof. David A. Oladele',
    email: 'admin@esocs.church',
    title: 'Supervising Apostle General / Super Admin',
    badge: 'Super Admin',
    badgeColor: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    icon: '🛡️',
  },
];

export default function HomePage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Active auth tab: 'signin' | 'apply' | 'demo'
  const [authTab, setAuthTab] = useState<'signin' | 'apply' | 'demo'>('signin');

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 120);
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
        password: password || 'password123',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to sign in. Please verify your credentials.');
    }
  };

  const handleQuickDemoLogin = async (email: string) => {
    setErrorMsg(null);
    setIdentifier(email);
    setPassword('password123');
    try {
      await login({
        identifier: email,
        password: 'password123',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed.');
    }
  };

  if (isInitialLoading) {
    return <AppLoader message="Initializing ESOCS Portal Gateway..." subMessage="Canonical Ordination Directorate Worldwide" />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500/20 selection:text-amber-900">
      
      {/* ========================================================================= */}
      {/* LEFT SIDE (50%): Brand Context, Canonical Heritage & Sovereign Ledger */}
      {/* ========================================================================= */}
      <section className="lg:w-1/2 min-h-[50vh] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-gradient-to-br from-slate-900 via-[#0a0f24] to-[#050814] text-white relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Official Logo & Crest */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md p-1.5 border border-white/15 flex items-center justify-center shadow-lg">
              <img
                src="/brand/esocs-crest.png"
                alt="ESOCS Holy Order Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-serif font-bold text-sm tracking-wider text-white block">
                ESOCS HOLY ORDER
              </span>
              <span className="text-[10px] text-amber-400 font-medium tracking-widest uppercase block">
                Ordination Directorate • Worldwide
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-amber-300 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-[11px]">2026 Session Live</span>
          </div>
        </div>

        {/* Center: Hero Narrative & Canonical Statistics */}
        <div className="relative z-10 my-8 lg:my-auto space-y-6 max-w-xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-semibold">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>General Conference Cohort 2026</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
              Holy Ordination & <br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                Consecration Portal
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              The official sovereign platform for candidate vetting, theological examinations, apostolic endorsements, and digital investiture credential issuance across all dioceses.
            </p>
          </div>

          {/* Minimalist Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="block font-serif font-bold text-xl text-amber-400">6</span>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Dioceses</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="block font-serif font-bold text-xl text-amber-400">12</span>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Holy Orders</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="block font-serif font-bold text-xl text-amber-400">100%</span>
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Cryptographic</span>
            </div>
          </div>

          {/* Council of Elders Desaturated Photography Card */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group bg-slate-950">
            <div className="h-36 sm:h-40 w-full relative overflow-hidden">
              <img
                src="/brand/hero-fathers.webp"
                alt="ESOCS Council of Elders"
                className="w-full h-full object-cover object-top opacity-85 group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-[#060913]/50 to-transparent flex flex-col justify-end p-4">
                <span className="text-xs font-serif font-bold text-amber-300">
                  Council of Consecrated Ministers & Elders
                </span>
                <span className="text-[10px] text-slate-300 font-light">
                  Mount Zion Cathedral Worldwide Headquarters • Lagos, Nigeria
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Canonical Stepper & Trademark */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Anti-Forgery Cryptographic Ledger</span>
          </div>
          <span>The Eternal Sacred Order of the Cherubim and Seraphim</span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* RIGHT SIDE (50%): Pure Clean, Focused, High-Contrast Auth Cockpit */}
      {/* ========================================================================= */}
      <section className="lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-16 bg-white dark:bg-[#070b18] transition-colors">
        
        {/* Top Header Controls */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800/80">
          {/* Segmented Control Tabs */}
          <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAuthTab('signin')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                authTab === 'signin'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('apply')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                authTab === 'apply'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Apply Now
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('demo')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                authTab === 'demo'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Demo Logins
            </button>
          </div>

          <ThemeToggle />
        </div>

        {/* Center: Auth Forms & Interactive Cockpits */}
        <div className="my-auto py-8 max-w-md w-full mx-auto space-y-6">
          
          {/* TAB 1: Pure Clean Sign In */}
          {authTab === 'signin' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1.5">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Please enter your canonical credentials to access the ordination cockpit.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Registration Number Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Registration Number or Church Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. ESOCS/ORD/2026/0481 or e.adeleke@esocs.church"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password / Access Key
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotOpen(true)}
                      className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your security access key"
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Sign In Primary CTA */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Registration CTA */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  New Candidate for the 2026 Exercise?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthTab('apply')}
                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline ml-1"
                  >
                    Apply Here
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Clean Apply / Self-Registration Overview */}
          {authTab === 'apply' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1.5">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Candidate Registration
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Self-service portal for new ordinands ascending into sacred Holy Orders.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
                <div className="flex items-center gap-2 font-serif font-bold text-sm text-amber-900 dark:text-amber-300">
                  <BadgeCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Prerequisites & Requirements</span>
                </div>
                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Select Holy Order Order Category (Brethren or Sisters Order)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Structured Ecclesiastical Name (Title, First, Middle, Surname)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Dynamic Diocese, District & Parish Branch Selection</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Verified Domestic / International Phone Number</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Launch Candidate Application</span>
              </button>
            </div>
          )}

          {/* TAB 3: 1-Click Instant Demo Personas */}
          {authTab === 'demo' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Demo Personas
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select any canonical role for instant 1-click test access:
                </p>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {QUICK_DEMO_PERSONAS.map((persona, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickDemoLogin(persona.email)}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 hover:bg-amber-500/10 dark:bg-slate-900/80 dark:hover:bg-slate-800/90 transition-all flex items-center justify-between text-left group shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg shrink-0">{persona.icon}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                          {persona.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {persona.title}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${persona.badgeColor}`}>
                        {persona.badge}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Help & Secretariat Info */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Need Secretariat Assistance?</span>
          <span className="text-amber-600 dark:text-amber-400 font-semibold">support@esocs.church</span>
        </div>

      </section>

      {/* Global Modals */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />

      <TwoFactorModal />
    </div>
  );
}
