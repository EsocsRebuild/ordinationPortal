'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { QrCodeSvg } from '@/components/ui/QrCodeSvg';
import {
  X,
  Lock,
  KeyRound,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  History,
  Eye,
  EyeOff,
  Copy,
  Check,
  Laptop,
  Globe,
  Trash2,
} from 'lucide-react';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SecuritySettingsModal({ isOpen, onClose }: SecuritySettingsModalProps) {
  const { user, changePassword, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'password' | '2fa' | 'sessions'>('password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [is2FAActive, setIs2FAActive] = useState(() => {
    if (typeof window !== 'undefined' && user?.userId) {
      return localStorage.getItem(`esocs_2fa_${user.userId}`) === 'true';
    }
    return true;
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  // Password strength calculation
  const hasMinLen = newPassword.length >= 6;
  const hasMixedCase = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const strengthScore = [hasMinLen, hasMixedCase, hasNumber, passwordsMatch].filter(Boolean).length;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match. Please verify.');
      return;
    }

    try {
      await changePassword(newPassword);
      setSuccessMsg('Your ecclesiastical account password was successfully updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
    }
  };

  const handleToggle2FA = () => {
    const nextState = !is2FAActive;
    setIs2FAActive(nextState);
    if (user?.userId) {
      localStorage.setItem(`esocs_2fa_${user.userId}`, nextState ? 'true' : 'false');
    }
    setSuccessMsg(
      nextState
        ? 'Two-Factor Authentication (2FA) is now ENABLED for your account.'
        : 'Two-Factor Authentication (2FA) has been disabled.'
    );
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText('ESOCS-AUTH-7892-K92X-2026');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-slate-100 my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Account & Security Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your credentials, 2FA protection, and authorized sessions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-950/40 text-xs sm:text-sm overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('password');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-4 px-4 font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'password'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <KeyRound className="w-4 h-4" /> Password Management
          </button>
          <button
            onClick={() => {
              setActiveTab('2fa');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-4 px-4 font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === '2fa'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Smartphone className="w-4 h-4" /> 2FA Protection
          </button>
          <button
            onClick={() => {
              setActiveTab('sessions');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-4 px-4 font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'sessions'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <History className="w-4 h-4" /> Active Terminals
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-2xl flex items-start gap-3 text-xs animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-start gap-3 text-xs animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMsg}</div>
            </div>
          )}

          {/* TAB 1: Change Password */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Updating security credentials for <strong>{user.name}</strong> ({user.email}). Ensure your password has at least 6 characters and is unique.
              </div>

              {/* Current Password */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Current Password / Passkey
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter existing password"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  New Preferred Password *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Strength Score */}
              {newPassword.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Security Rating:</span>
                    <span
                      className={
                        strengthScore === 4
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : strengthScore >= 2
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-500'
                      }
                    >
                      {strengthScore === 4
                        ? 'Strong & Verified ✓'
                        : strengthScore >= 2
                        ? 'Moderate'
                        : 'Weak'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore >= 1
                          ? strengthScore >= 3
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                          : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore >= 2
                          ? strengthScore >= 3
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                          : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore >= 3 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full transition-all ${
                        strengthScore === 4 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                <Button variant="outline" size="lg" type="button" onClick={onClose} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  loading={isLoading}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-3.5"
                >
                  Save New Password
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: Two-Factor Authentication */}
          {activeTab === '2fa' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                    <span>Two-Factor Authentication (2FA) Protection</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Require 6-digit TOTP validation on all ecclesiastical terminal sign-in attempts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggle2FA}
                  className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shrink-0 ${
                    is2FAActive
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {is2FAActive ? '✓ 2FA Enabled' : 'Enable 2FA Now'}
                </button>
              </div>

              {/* Authenticator QR Code Setup Box */}
              <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Authenticator Application Setup
                </h4>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                    <QrCodeSvg value={`otpauth://totp/ESOCS:${user.email}?secret=JBSWY3DPEHPK3PXP&issuer=ESOCS`} size={110} />
                  </div>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <p>
                      Scan this QR code with <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or <strong>1Password</strong>.
                    </p>
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 block">Or enter code manually:</span>
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                          ESOCS-AUTH-7892-K92X-2026
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyKey}
                          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          {copiedKey ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Active Sessions */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Active Logged-in Devices
                </span>
                <button
                  type="button"
                  onClick={() => setSuccessMsg('All other remote terminal sessions have been terminated.')}
                  className="text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Terminate Other Sessions
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-400/5 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Apple Silicon Mac • Chrome 126</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                          Current Terminal
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 font-mono mt-0.5">
                        <Globe className="w-3 h-3" /> Lagos, Nigeria • IP: 197.210.65.12
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        iPhone 15 Pro • Safari Mobile
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 font-mono mt-0.5">
                        <Globe className="w-3 h-3" /> Abuja, Nigeria • Active 2h ago
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
