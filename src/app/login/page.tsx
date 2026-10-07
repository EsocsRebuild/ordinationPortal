'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { INITIAL_USERS } from '@/lib/mockData';
import { ROLE_CONFIGS } from '@/utils/security';
import { Button } from '@/components/ui/Button';
import { EsocsLogo } from '@/components/ui/EsocsLogo';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { TwoFactorModal } from '@/components/auth/TwoFactorModal';
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  KeyRound,
  UserPlus,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Crown,
  Church,
  FileCheck,
  Award,
} from 'lucide-react';

const DEMO_TEST_PERSONAS = [
  {
    role: 'candidate' as UserRole,
    name: 'Senior Apostle Emmanuel Adeleke',
    email: 'e.adeleke@esocs.church',
    title: 'Male Ordinand (Yellow → Blue)',
    status: 'Investiture Ready • Pass & Cert Issued',
    icon: '👨',
    badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-400/40',
  },
  {
    role: 'candidate' as UserRole,
    name: 'Lady Leader Grace Williams',
    email: 'g.williams@esocs.church',
    title: 'Female Ordinand (Prophetess → Mother in Israel)',
    status: 'CMC Approved • 100% Cleared',
    icon: '👩',
    badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-400/40',
  },
  {
    role: 'parish_leader' as UserRole,
    name: 'Senior Apostle Festus Okon',
    email: 'f.okon@esocs.church',
    title: 'Branch Rector & Parish Chairman',
    status: 'Branch Endorsements Cockpit',
    icon: '⛪',
    badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/40',
  },
  {
    role: 'screening_officer' as UserRole,
    name: 'Dr. Godwin Bassey (CMC)',
    email: 'screening@esocs.church',
    title: 'CMC National Screening Directorate',
    status: 'Theology Exams & Doc Vetting',
    icon: '📋',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-400/40',
  },
  {
    role: 'advisory_board' as UserRole,
    name: 'Apostle General J. K. Coker',
    email: 'advisory@esocs.church',
    title: 'Holy Synod Advisory Board',
    status: 'Apex Synodical Ratification',
    icon: '👑',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-400/40',
  },
  {
    role: 'super_admin' as UserRole,
    name: 'Supervising Apostle General Prof. Oladele',
    email: 'admin@esocs.church',
    title: 'Secretary General & Portal Sovereign',
    status: '5-Tier Cockpit & Treasury Ledger',
    icon: '🏛️',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40',
  },
];

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('admin@esocs.church');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await login({
        identifier: identifier || INITIAL_USERS.find((u) => u.role === selectedRole)?.email || '',
        password,
        role: selectedRole,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleApplyPersona = (persona: typeof DEMO_TEST_PERSONAS[0]) => {
    setSelectedRole(persona.role);
    setIdentifier(persona.email);
    setPassword('password123');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portal Landing Page
        </Link>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gold-400" />
          <span className="text-xs font-mono text-slate-400">ESOCS CANONICAL AUTH GATEWAY</span>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: 1-Click Fast Test Personas Deck */}
        <div className="lg:col-span-6 space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-400/30 text-gold-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Rapid Test Accounts Deck
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Select a Canonical Role to Test Instantly
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click any verified test persona below to instantly prefill credentials and inspect their dedicated dashboard workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DEMO_TEST_PERSONAS.map((p, idx) => {
              const isSelected = identifier === p.email;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPersona(p)}
                  className={`p-3 rounded-2xl text-left border transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-gold-500/15 border-gold-400/70 shadow-gold ring-1 ring-gold-400/40'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="text-xl shrink-0 p-1.5 rounded-xl bg-slate-800/80">{p.icon}</span>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-xs text-white truncate">{p.name}</p>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-gold-300 font-medium truncate">{p.title}</p>
                    <span className="inline-block text-[9px] text-slate-400 font-mono">{p.status}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Universal Dev Password: <strong className="font-mono text-white">password123</strong></span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Database Seeding Active
            </span>
          </div>
        </div>

        {/* Right Side: Main Login Card */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative overflow-hidden">
          {/* Sacred Crest */}
          <div className="text-center space-y-1.5">
            <div className="flex justify-center mb-1">
              <EsocsLogo size={46} showText={false} />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
              Canonical Authentication Gateway
            </h1>
            <p className="text-xs text-slate-400">
              Sign in to access your designated ecclesiastical dashboard
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Membership Reg Number or Ecclesiastical Email *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. e.adeleke@esocs.church or ESOCS/ORD/2026/0481"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-slate-300">
                  Password / Access Key *
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-[11px] text-gold-400 hover:underline flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" /> Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <Button
              variant="gold"
              size="lg"
              type="submit"
              loading={isLoading}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Authenticate & Enter Portal
            </Button>
          </form>

          {/* Self-registration action */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-2 text-xs">
            <p className="text-slate-400">New Candidate seeking Holy Ordination?</p>
            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-gold-500/40 hover:border-gold-500 bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" /> Apply for Ordination (Self-Registration)
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        onSuccessLogin={(id) => {
          setIdentifier(id);
          setPassword('password123');
        }}
      />
      <TwoFactorModal />

      {/* Bottom Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500">
        © 1925 – 2026 The Eternal Sacred Order of the Cherubim and Seraphim Worldwide.
      </div>
    </div>
  );
}
