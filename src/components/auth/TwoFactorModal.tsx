'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import {
  X,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export function TwoFactorModal() {
  const {
    twoFactorPending,
    verifyTwoFactor,
    cancelTwoFactor: authCancelTwoFactor,
    resendTwoFactor,
    pendingUserSession,
    twoFactorInitialError,
    isLoading,
  } = useAuth();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  // Lifespan & Cooldown timers
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5 minutes validity
  const [cooldown, setCooldown] = useState(60); // 60s resend cooldown

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const cancelTwoFactor = () => {
    setDigits(['', '', '', '', '', '']);
    setErrorMsg(null);
    setResendNotice(null);
    authCancelTwoFactor();
  };

  // Countdown timer for expiration & resend cooldown
  useEffect(() => {
    if (!twoFactorPending) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [twoFactorPending]);

  // Reset timers, clear inputs, and surface initial dispatch status when modal opens
  useEffect(() => {
    if (twoFactorPending) {
      setSecondsRemaining(300);
      setCooldown(60);
      setDigits(['', '', '', '', '', '']);
      if (twoFactorInitialError) {
        setErrorMsg(twoFactorInitialError);
        setResendNotice(null);
      } else {
        setErrorMsg(null);
        setResendNotice('A fresh 6-digit verification code has been dispatched to your email.');
      }
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [twoFactorPending, twoFactorInitialError]);

  if (!twoFactorPending) return null;

  const isExpired = secondsRemaining === 0;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins}:${remainderSecs < 10 ? '0' : ''}${remainderSecs}`;
  };

  const handleDigitChange = (index: number, value: string) => {
    setErrorMsg(null);
    const cleaned = value.replace(/[^0-9]/g, '');

    // If pasted multi-digit string
    if (cleaned.length > 1) {
      const newDigits = [...digits];
      const chars = cleaned.slice(0, 6).split('');
      chars.forEach((ch, idx) => {
        if (index + idx < 6) {
          newDigits[index + idx] = ch;
        }
      });
      setDigits(newDigits);
      const nextFocus = Math.min(index + chars.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);

    // Auto-advance to next input if filled
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setDigits(newDigits);
    const focusTarget = Math.min(pasteData.length, 5);
    inputRefs.current[focusTarget]?.focus();
  };

  const handleResend = async () => {
    if (cooldown > 0 && !isExpired) return;
    setIsResending(true);
    setErrorMsg(null);
    setResendNotice(null);

    try {
      const res = await resendTwoFactor(isExpired);
      setSecondsRemaining(300);
      setCooldown(60);
      setDigits(['', '', '', '', '', '']);
      setResendNotice(
        res?.message || 'A fresh 2FA authentication token has been dispatched to your email.'
      );
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend authentication token. Please wait.');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (isExpired) {
      setErrorMsg('Authentication token has elapsed (expired). Click "Resend Token" to generate a new one.');
      return;
    }

    const fullOtp = digits.join('');
    if (fullOtp.length < 6) {
      setErrorMsg('Please enter the complete 6-digit authentication code.');
      return;
    }

    try {
      await verifyTwoFactor(fullOtp, rememberDevice);
    } catch (err: any) {
      if (err.code === 'OTP_EXPIRED') {
        setErrorMsg('Authentication token has elapsed. Please click Resend Token to obtain a new code.');
      } else {
        setErrorMsg(err.message || 'Invalid authentication code. Please try again.');
      }
    }
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-slate-100 my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Two-Factor Verification (2FA)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Secure multi-factor account authentication
              </p>
            </div>
          </div>
          <button
            onClick={cancelTwoFactor}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleVerify} className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-2xl flex items-start gap-3 text-xs animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1 font-medium space-y-1">
                <div>{errorMsg}</div>
                {isExpired && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-200 underline mt-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    Resend New 2FA Token Now
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

          {/* Info Header */}
          <div className="text-center space-y-1.5 py-1">
            <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
              Verify Your Identity
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs max-w-sm mx-auto leading-relaxed">
              Enter the 6-digit verification code sent to <strong>{pendingUserSession?.user?.email || 'your registered church contact'}</strong>.
            </p>
          </div>

          {/* 6-Box PIN Inputs with Expiration Countdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Enter 6-Digit Security Token
              </label>

              {/* Countdown badge & Resend button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || (cooldown > 0 && !isExpired)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                    isExpired
                      ? 'text-amber-600 dark:text-amber-400 hover:underline font-bold'
                      : cooldown > 0
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-amber-600 dark:text-amber-400 hover:underline'
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                  <span>
                    {isResending
                      ? 'Sending...'
                      : isExpired
                      ? 'Resend Token'
                      : cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : 'Resend Token'}
                  </span>
                </button>

                <div
                  className={`flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-0.5 rounded-full ${
                    isExpired
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-rose-500' : 'text-amber-500'}`} />
                  <span>{isExpired ? 'Elapsed' : formatTime(secondsRemaining)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-full h-14 sm:h-16 text-center font-mono text-2xl font-bold rounded-2xl border transition-all focus:outline-none ${
                    isExpired
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                      : digit
                      ? 'bg-amber-500/10 dark:bg-amber-400/10 border-amber-500 text-amber-600 dark:text-amber-400 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950/80 border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15'
                  }`}
                />
              ))}
            </div>

            {isExpired && (
              <p className="text-xs text-rose-600 dark:text-rose-400 text-center font-medium pt-1">
                Your 2FA security token has elapsed. Click &ldquo;Resend Token&rdquo; above to receive a fresh authentication code.
              </p>
            )}
          </div>

          {/* Remember Device Toggle */}
          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-600"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                Trust this device for 30 days
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                You won&apos;t be prompted for 2FA on this device unless you explicitly sign out or reset your browser.
              </span>
            </div>
          </label>

          {/* Actions */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <Button
              variant="outline"
              size="lg"
              type="button"
              onClick={cancelTwoFactor}
              className="w-full sm:w-auto"
            >
              Cancel Sign In
            </Button>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              loading={isLoading}
              disabled={!isComplete || isExpired}
              icon={<ArrowRight className="w-4 h-4" />}
              className={`w-full sm:w-auto font-bold py-3.5 ${
                isExpired
                  ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed text-slate-200'
                  : 'bg-amber-600 hover:bg-amber-500 text-slate-950'
              }`}
            >
              {isExpired ? 'Token Elapsed (Resend Above)' : 'Verify & Enter Portal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
