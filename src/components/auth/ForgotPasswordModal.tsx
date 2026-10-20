'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import {
  X,
  Mail,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: (email: string) => void;
}

export function ForgotPasswordModal({ isOpen, onClose, onSuccessLogin }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'identify' | 'verify_and_reset' | 'success'>('identify');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  // OTP lifecycle timers
  const [countdown, setCountdown] = useState(600); // 10 minutes total validity
  const [cooldown, setCooldown] = useState(60); // 60s resend cooldown

  // Active timer ticks during step 2
  useEffect(() => {
    if (step !== 'verify_and_reset') return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  if (!isOpen) return null;

  const isExpired = countdown === 0;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  // Password strength calculation
  const hasMinLen = newPassword.length >= 6;
  const hasMixedCase = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const strengthScore = [hasMinLen, hasMixedCase, hasNumber, passwordsMatch].filter(Boolean).length;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResendNotice(null);

    if (!identifier.trim()) {
      setErrorMsg('Please enter your Registration Number or Church Email.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.requestPasswordOtp(identifier.trim());
      setCountdown(res.expiresInSeconds || 600);
      setCooldown(res.cooldownSeconds || 60);
      setOtp('');
      setSuccessMsg(res.message);
      setStep('verify_and_reset');
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to request password reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 && !isExpired) return;
    setIsResending(true);
    setErrorMsg(null);
    setResendNotice(null);

    try {
      const res = await api.resendPasswordOtp(identifier.trim(), isExpired);
      setCountdown(res.expiresInSeconds || 600);
      setCooldown(res.cooldownSeconds || 60);
      setOtp('');
      setResendNotice(
        res.message || 'A fresh verification code has been dispatched to your email.'
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to resend verification code. Please wait.');
    } finally {
      setIsResending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isExpired) {
      setErrorMsg('Your verification code has elapsed (expired). Click "Resend Code" to receive a fresh code.');
      return;
    }

    if (!otp.trim() || otp.length < 6) {
      setErrorMsg('Please enter the valid 6-digit verification code.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.resetPassword(identifier.trim(), newPassword, otp.trim());
      setSuccessMsg(res.message);
      setStep('success');
    } catch (err: any) {
      if (err.code === 'OTP_EXPIRED') {
        setErrorMsg('Verification code has elapsed. Please click Resend Code to obtain a new code.');
      } else {
        setErrorMsg(err.message || 'Password reset failed. Please check your verification code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('identify');
    setIdentifier('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setResendNotice(null);
    setCountdown(600);
    setCooldown(60);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-slate-100 my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Password Recovery & Reset
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Self-service security credential reset for ESOCS accounts
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="px-6 pt-4 pb-2 bg-slate-50/40 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-colors ${
                step === 'identify'
                  ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {step === 'identify' ? '1' : <Check className="w-3.5 h-3.5" />}
            </div>
            <span className={`font-semibold ${step === 'identify' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
              Account Lookup
            </span>
          </div>

          <div className="h-0.5 w-8 bg-slate-200 dark:bg-slate-800" />

          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-colors ${
                step === 'verify_and_reset'
                  ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20'
                  : step === 'success'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {step === 'success' ? <Check className="w-3.5 h-3.5" /> : '2'}
            </div>
            <span
              className={`font-semibold ${
                step === 'verify_and_reset'
                  ? 'text-amber-600 dark:text-amber-400'
                  : step === 'success'
                  ? 'text-slate-400'
                  : 'text-slate-400'
              }`}
            >
              Reset & Verify
            </span>
          </div>

          <div className="h-0.5 w-8 bg-slate-200 dark:bg-slate-800" />

          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-colors ${
                step === 'success'
                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              3
            </div>
            <span className={`font-semibold ${step === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              Complete
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-2xl flex items-start gap-3 text-xs animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium space-y-1">
                <div>{errorMsg}</div>
                {isExpired && (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-200 underline mt-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    Resend New Code Now
                  </button>
                )}
              </div>
            </div>
          )}

          {resendNotice && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-start gap-3 text-xs animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div className="flex-1 font-medium">{resendNotice}</div>
            </div>
          )}

          {/* STEP 1: Request OTP */}
          {step === 'identify' && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Provide your Ordination Registration Number (e.g. <code>ESOCS/ORD/2026/0481</code>) or official Church Email address. We will verify your ordination record and generate an immediate security reset token.
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Registration Number or Church Email *
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. e.adeleke@esocs.church or ESOCS/ORD/2026/0481"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  loading={isLoading}
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold"
                >
                  Generate Verification Code
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: Verify OTP & Choose New Password */}
          {step === 'verify_and_reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Expiration & Active Status Banner */}
              <div
                className={`p-4 rounded-2xl text-xs flex items-start gap-3 border transition-colors ${
                  isExpired
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                {isExpired ? (
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                )}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>{isExpired ? 'Verification Code Elapsed:' : 'Verification Code Dispatched:'}</strong> Sent for <code>{identifier}</code>.
                    </div>
                    {/* Live Expiration Countdown Badge */}
                    <div
                      className={`flex items-center gap-1.5 font-mono px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        isExpired
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isExpired ? 'Elapsed' : `Expires in ${formatTime(countdown)}`}</span>
                    </div>
                  </div>

                  {isExpired ? (
                    <p className="text-[11px] text-rose-700 dark:text-rose-300 font-medium pt-0.5">
                      The prior 10-minute validity period has elapsed. Please click below to generate and resend a fresh verification code.
                    </p>
                  ) : null}
                </div>
              </div>

              {/* 6-Digit Token & Resend Actions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    6-Digit Verification Code *
                  </label>
                  {/* Resend Action Button */}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending || (cooldown > 0 && !isExpired)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                      isExpired
                        ? 'text-amber-600 dark:text-amber-400 hover:underline font-bold'
                        : cooldown > 0
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-amber-600 dark:text-amber-400 hover:underline'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    <span>
                      {isResending
                        ? 'Sending Code...'
                        : isExpired
                        ? 'Resend New Code'
                        : cooldown > 0
                        ? `Resend in ${cooldown}s`
                        : 'Resend Verification Code'}
                    </span>
                  </button>
                </div>

                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  className={`w-full text-center tracking-[0.5em] font-mono text-xl py-3 bg-slate-50 dark:bg-slate-950/80 border rounded-2xl font-bold transition-all focus:outline-none focus:ring-4 ${
                    isExpired
                      ? 'border-rose-400 dark:border-rose-700 text-rose-600 focus:ring-rose-500/15 focus:border-rose-500'
                      : 'border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white focus:ring-amber-500/15 focus:border-amber-500'
                  }`}
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Set New Secure Password *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Meter */}
              {newPassword.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Password Security Strength:</span>
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

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('identify')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  ← Back to Email Lookup
                </button>
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  loading={isLoading}
                  disabled={isExpired}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  className={`font-bold ${
                    isExpired
                      ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isExpired ? 'Code Expired (Resend Above)' : 'Update & Conclude Reset'}
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: Success Confirmation */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                  Password Reset Successfully!
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
                  Your portal password has been securely updated. You may now sign in using your new credentials.
                </p>
              </div>

              <div className="pt-2 max-w-xs mx-auto">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => {
                    if (onSuccessLogin) onSuccessLogin(identifier);
                    handleClose();
                  }}
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-3.5"
                >
                  Return to Portal Sign In
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
