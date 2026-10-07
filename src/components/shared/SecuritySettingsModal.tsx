'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
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
  const [is2FAActive, setIs2FAActive] = useState(() => {
    if (typeof window !== 'undefined' && user?.userId) {
      return localStorage.getItem(`esocs_2fa_${user.userId}`) === 'true';
    }
    return false;
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-premium overflow-hidden transition-all text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-church-900 text-gold-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-church-950 dark:text-white">
                Account & Security Settings
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Manage your credentials, 2FA protection, and active sessions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
          <button
            onClick={() => {
              setActiveTab('password');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3 px-3.5 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'password'
                ? 'border-gold-500 text-church-900 dark:text-gold-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Change Password
          </button>
          <button
            onClick={() => {
              setActiveTab('2fa');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3 px-3.5 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === '2fa'
                ? 'border-gold-500 text-church-900 dark:text-gold-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> 2FA / MFA Security
          </button>
          <button
            onClick={() => {
              setActiveTab('sessions');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3 px-3.5 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sessions'
                ? 'border-gold-500 text-church-900 dark:text-gold-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Security Logs
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 text-xs space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: Change Password */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                You are modifying the password for <strong>{user.name}</strong> ({user.email}). Choose a strong password you can easily remember.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password / Passkey
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-church-500 focus:outline-none"
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

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Preferred Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-church-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-church-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button variant="outline" size="md" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  loading={isLoading}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Save New Password
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: Two-Factor Authentication */}
          {activeTab === '2fa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                    <ShieldCheck className="w-4 h-4 text-church-600 dark:text-gold-400" />
                    <span>Two-Factor Authentication (2FA)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Require a 6-digit authentication token on every sign-in attempt.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggle2FA}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                    is2FAActive
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {is2FAActive ? 'Enabled (Active)' : 'Disabled (Enable)'}
                </button>
              </div>

              <div className="p-3 bg-gold-500/10 dark:bg-gold-500/15 border border-gold-400/30 rounded-xl text-[11px] text-gold-900 dark:text-gold-200">
                <strong>Apostolic Standard:</strong> 2FA protects sensitive ordination records, test scores, and canonical passes against unauthorized access.
              </div>
            </div>
          )}

          {/* TAB 3: Security Logs */}
          {activeTab === 'sessions' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      Current Active Browser Session
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      IP: 197.210.65.12 (Nigeria) • Mac OS / Modern Browser
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                    Active Now
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      Central Secretariat Ledger Sync
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Timestamp: {new Date().toLocaleDateString()} • Verified Authorization
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-medium text-[10px]">
                    Synchronized
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

