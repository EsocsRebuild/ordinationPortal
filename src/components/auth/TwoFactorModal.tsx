'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Clock,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-300">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-amber-500/10 dark:bg-amber-400/8 rounded-full blur-[120px] transform -translate-y-12" />
      </div>

      <div className="relative w-full max-w-lg card-luxury card-luxury-top-glow rounded-3xl overflow-hidden transition-all text-slate-900 dark:text-slate-100 my-6 shadow-2xl">
        {/* Top ambient highlight glow line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/80 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 sm:p-7 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#070b18]/60 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="relative p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 text-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                <span>Secure Ecclesiastical Clearance</span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Two-Factor Verification
              </h3>
            </div>
          </div>
          <button
            onClick={cancelTwoFactor}
            className="p-2.5 rounded-xl hover:bg-slate-200/80 dark:hover:bg-slate-800/80 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all active:scale-95"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleVerify} className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 rounded-2xl flex items-start gap-3 text-xs animate-in fade-in duration-200 shadow-xs">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1 font-medium space-y-1">
                <div>{errorMsg}</div>
                {isExpired && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-200 underline mt-1 hover:text-rose-950 dark:hover:text-rose-100"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    Resend Fresh 2FA Token Now
                  </button>
                )}
              </div>
            </div>
          )}

          {resendNotice && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3.5 text-xs animate-in fade-in duration-200 shadow-xs">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="flex-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Authentication Token Dispatched
                </div>
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                  {resendNotice}
                </div>
              </div>
            </div>
          )}

          {/* Info Header */}
          <div className="text-center space-y-2 py-1">
            <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
              Verify Your Secretariat Identity
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs max-w-sm mx-auto leading-relaxed">
              Enter the 6-digit security token dispatched to{' '}
              <span className="inline-block px-2 py-0.5 mt-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono font-bold border border-amber-500/20">
                {pendingUserSession?.user?.email || 'your registered church contact'}
              </span>
            </p>
          </div>

          {/* 6-Box PIN Inputs with Expiration Countdown */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Security Token
              </label>

              {/* Countdown badge & Resend button */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || (cooldown > 0 && !isExpired)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isExpired
                      ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-bold'
                      : cooldown > 0
                      ? 'text-slate-400 cursor-not-allowed bg-slate-100 dark:bg-slate-800/40'
                      : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:text-amber-500'
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
                  className={`flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                    isExpired
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-rose-500' : 'text-amber-500'}`} />
                  <span>{isExpired ? 'Elapsed' : formatTime(secondsRemaining)}</span>
                </div>
              </div>
            </div>

            {/* 3 + 3 Grouped PIN Inputs */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2" onPaste={handlePaste}>
              {/* First 3 Digits */}
              <div className="flex-1 grid grid-cols-3 gap-1.5 sm:gap-2">
                {[0, 1, 2].map((index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digits[index]}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-full h-14 sm:h-16 text-center font-mono text-2xl font-black rounded-2xl border transition-all duration-200 focus:outline-none focus:scale-105 select-all ${
                      isExpired
                        ? 'bg-rose-500/10 border-rose-400 text-rose-500'
                        : digits[index]
                        ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-50 dark:bg-[#070b18] border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/20'
                    }`}
                  />
                ))}
              </div>

              {/* Center Divider Dot */}
              <div className="px-1 text-slate-300 dark:text-slate-600 font-extrabold text-xl select-none">
                ·
              </div>

              {/* Second 3 Digits */}
              <div className="flex-1 grid grid-cols-3 gap-1.5 sm:gap-2">
                {[3, 4, 5].map((index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digits[index]}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-full h-14 sm:h-16 text-center font-mono text-2xl font-black rounded-2xl border transition-all duration-200 focus:outline-none focus:scale-105 select-all ${
                      isExpired
                        ? 'bg-rose-500/10 border-rose-400 text-rose-500'
                        : digits[index]
                        ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-50 dark:bg-[#070b18] border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {isExpired && (
              <p className="text-xs text-rose-500 text-center font-semibold pt-1">
                Your 2FA security token has elapsed. Click &ldquo;Resend Token&rdquo; above to receive a fresh authentication code.
              </p>
            )}
          </div>

          {/* Remember Device Toggle */}
          <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/80 dark:bg-[#070b18]/80 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer select-none transition-all">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-amber-400 border-slate-300 dark:border-slate-600 cursor-pointer accent-amber-500"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Trust this secure device for 30 days
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-relaxed">
                Biometric & session token persistence enabled. You won&apos;t be prompted for 2FA on this workstation.
              </span>
            </div>
          </label>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={cancelTwoFactor}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 transition-all active:scale-[0.98]"
            >
              Cancel Sign In
            </button>

            <button
              type="submit"
              disabled={!isComplete || isExpired || isLoading}
              className={`w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2.5 transition-all select-none ${
                isExpired || !isComplete
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300/40 dark:border-slate-700/40'
                  : 'btn-shimmer-sweep bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-[0_4px_25px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_30px_rgba(245,158,11,0.55)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] group'
              }`}
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Token...</span>
                </>
              ) : (
                <>
                  <span>{isExpired ? 'Token Elapsed (Resend Above)' : 'Verify & Enter Portal'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
