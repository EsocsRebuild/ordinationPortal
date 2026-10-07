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
} from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('candidate');
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

  const handleQuickRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const targetUser = INITIAL_USERS.find((u) => u.role === role);
    if (targetUser) {
      setIdentifier(targetUser.email);
      setPassword('••••••••••••');
    }
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

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Sacred Crest */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <EsocsLogo size={52} showText={false} />
          </div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
            Canonical Directorate Login
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
          {/* Role Selection Tabs */}
          <div>
            <label className="block font-medium text-slate-300 mb-2">
              Select Ecclesiastical Jurisdiction / Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {(['candidate', 'parish_leader', 'screening_officer', 'advisory_board', 'super_admin'] as UserRole[]).map((r) => {
                const config = ROLE_CONFIGS[r];
                const isSelected = selectedRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleQuickRoleSelect(r)}
                    className={`p-2 rounded-lg text-center transition-all border ${
                      isSelected
                        ? 'bg-gold-500/20 text-gold-300 border-gold-400/60 font-bold'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-[11px] block truncate">{config.badgeLabel.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Membership Reg Number or Ecclesiastical Email
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
                Password / Access Key
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
                className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
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
          <p className="text-slate-400">New Candidate seeking Ordination?</p>
          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="w-full py-2 px-3 rounded-xl border border-gold-500/40 hover:border-gold-500 bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" /> Apply for Ordination (Self-Registration)
          </button>
        </div>
      </div>

      {/* Modals */}
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

      {/* Bottom Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500">
        © 1925 – 2026 The Eternal Sacred Order of the Cherubim and Seraphim Worldwide.
      </div>
    </div>
  );
}
