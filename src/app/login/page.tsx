'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EsocsLogo } from '@/components/ui/EsocsLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { TwoFactorModal } from '@/components/auth/TwoFactorModal';
import {
  Shield,
  Lock,
  User,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Home,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inactivityNotice, setInactivityNotice] = useState(false);

  // Clear input credentials on mount and check if redirected due to inactivity
  React.useEffect(() => {
    setIdentifier('');
    setPassword('');
    setErrorMsg(null);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reason') === 'inactivity') {
        setInactivityNotice(true);
      }
    }
  }, []);

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const targetId = identifier.trim();
    const targetPassword = password.trim();

    if (!targetId) {
      setErrorMsg('Please enter your Registration Number or Church Email.');
      return;
    }

    if (!targetPassword) {
      setErrorMsg('Please enter your security access key password.');
      return;
    }

    // Immediately clear password from local form state for credential hygiene
    setPassword('');

    try {
      await login({
        identifier: targetId,
        password: targetPassword,
      });
      // Clear identifier upon successful dispatch or session transition
      setIdentifier('');
    } catch (err: any) {
      setPassword('');
      setErrorMsg(err.message || 'Unable to sign in. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#060913] text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500/20">
      
      {/* Top Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f21] px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <EsocsLogo size={36} showText={true} />
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white text-xs font-semibold transition-all shadow-xs"
          >
            <Home className="w-3.5 h-3.5 text-amber-500" />
            <span>Back to Home</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-all"
          >
            Apply for Ordination
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
        {/* Ambient lighting halo */}
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[550px] h-[550px] bg-gradient-to-tr from-amber-500/10 via-amber-400/5 to-transparent rounded-full blur-[140px] transform -translate-y-8" />
        </div>

        <div className="w-full max-w-md card-luxury card-luxury-top-glow rounded-3xl p-6 sm:p-8 space-y-6 relative z-10 shadow-2xl">
          
          {/* Top ambient highlight glow line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/80 to-transparent" />

          {/* Header */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest">
              <Shield className="w-3.5 h-3.5" />
              <span>Official Ecclesiastical Access</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Sign In to Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your verified Registration ID or ecclesiastical email.
            </p>
          </div>

          {inactivityNotice && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs rounded-2xl flex items-center gap-2.5 shadow-xs">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>You were automatically signed out due to inactivity to protect your account. Please sign in again.</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs rounded-2xl flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-[11px] uppercase tracking-wider">
                Registration Number or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. ESOCS/ORD/2026/0481 or your email"
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-[#070b18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
                  Password / Access Key
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-bold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security access key"
                  className="w-full pl-10 pr-10 py-3.5 bg-slate-50 dark:bg-[#070b18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl btn-shimmer-sweep bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-[0_4px_25px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_30px_rgba(245,158,11,0.55)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Link */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New Candidate for 2026?{' '}
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
              >
                Apply for Ordination
              </button>
            </p>
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Main Website
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Modals */}
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
