'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EsocsLogo } from '@/components/ui/EsocsLogo';
import {
  X,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  UserPlus,
  ChevronRight,
  Shield,
  Building,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister?: () => void;
  onOpenForgot?: () => void;
}

const DEMO_PERSONAS = [
  {
    role: 'candidate',
    name: 'Snr. Apostle Emmanuel Adeleke',
    email: 'e.adeleke@esocs.church',
    title: 'Male Candidate (Yellow → Blue)',
    badge: 'Candidate',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    icon: '👨',
  },
  {
    role: 'candidate',
    name: 'Lady Leader Grace Williams',
    email: 'g.williams@esocs.church',
    title: 'Female Candidate (Prophetess → Mother in Israel)',
    badge: 'Candidate',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    icon: '👩',
  },
  {
    role: 'parish_leader',
    name: 'Snr. Apostle Festus Okon',
    email: 'f.okon@esocs.church',
    title: 'Branch Rector & Parish Chairman',
    badge: 'Parish Leader',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    icon: '⛪',
  },
  {
    role: 'screening_officer',
    name: 'Special Snr. Apostle Dr. Bassey',
    email: 'g.bassey@esocs.church',
    title: 'CMC Screening & Examination Director',
    badge: 'CMC Screener',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    icon: '📋',
  },
  {
    role: 'advisory_board',
    name: 'Apostle General Elder M. Adebayo',
    email: 'm.adebayo@esocs.church',
    title: 'Holy Synod Advisory Board of Elders',
    badge: 'Holy Synod',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    icon: '👑',
  },
  {
    role: 'admin',
    name: 'Prof. David A. Oladele',
    email: 'admin@esocs.church',
    title: 'Supervising Apostle General / Super Admin',
    badge: 'Super Admin',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    icon: '🛡️',
  },
];

export function LoginModal({
  isOpen,
  onClose,
  onOpenRegister,
  onOpenForgot,
}: LoginModalProps) {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<'signin' | 'demo'>('signin');

  if (!isOpen) return null;

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
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to sign in. Please check your credentials.');
    }
  };

  const handleDemoLogin = async (email: string) => {
    setErrorMsg(null);
    setIdentifier(email);
    setPassword('password123');
    try {
      await login({
        identifier: email,
        password: 'password123',
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo authentication failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      {/* Solid Elevated Modal Box */}
      <div className="w-full max-w-md bg-white dark:bg-[#0c1326] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50 dark:bg-[#090e1d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                ESOCS Ordination Portal
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                Canonical Authentication Gateway
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0c1326]">
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setTab('signin')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'signin'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('demo')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'demo'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Demo Logins</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Registration Number or Church Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. ESOCS/ORD/2026/0481 or email"
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-200">
                    Password / Access Key
                  </label>
                  {onOpenForgot && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenForgot();
                      }}
                      className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your access password"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {onOpenRegister && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Not yet registered for 2026?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenRegister();
                      }}
                      className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
                    >
                      Apply for Ordination
                    </button>
                  </p>
                </div>
              )}
            </form>
          )}

          {tab === 'demo' && (
            <div className="space-y-2.5">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pb-1">
                Select any canonical persona for instant 1-click test login:
              </p>
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {DEMO_PERSONAS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDemoLogin(p.email)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-amber-50 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{p.icon}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {p.title}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

