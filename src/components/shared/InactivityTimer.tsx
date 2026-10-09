'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, Clock, LogOut, ArrowRight } from 'lucide-react';

interface InactivityTimerProps {
  timeoutMinutes?: number;
  warningSeconds?: number;
}

export function InactivityTimer({
  timeoutMinutes = 15,
  warningSeconds = 60,
}: InactivityTimerProps) {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(warningSeconds);

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningSeconds * 1000;

  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const handleResetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setSecondsLeft(warningSeconds);
    }
  }, [showWarning, warningSeconds]);

  const triggerLogout = useCallback(() => {
    setShowWarning(false);
    logout();
  }, [logout]);

  useEffect(() => {
    if (!user) return;

    const checkInactivity = () => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;

      if (elapsed >= timeoutMs) {
        triggerLogout();
      } else if (elapsed >= timeoutMs - warningMs) {
        setShowWarning(true);
        const remaining = Math.max(0, Math.round((timeoutMs - elapsed) / 1000));
        setSecondsLeft(remaining);
      } else {
        setShowWarning(false);
      }
    };

    // Events to monitor
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    activityEvents.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));
    timerRef.current = setInterval(checkInactivity, 2000);

    return () => {
      activityEvents.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user, timeoutMs, warningMs, triggerLogout]);

  useEffect(() => {
    if (showWarning) {
      countdownRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            triggerLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showWarning, triggerLogout]);

  if (!showWarning || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-center space-y-6 text-slate-900 dark:text-slate-100 my-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
            Session Inactivity Warning
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
            For data protection and portal security, your session will automatically terminate in:
          </p>
          <div className="text-4xl font-mono font-extrabold text-amber-600 dark:text-amber-400 py-2 tracking-widest">
            00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={triggerLogout}
            className="w-full sm:flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out Now
          </button>
          <button
            onClick={handleResetActivity}
            className="w-full sm:flex-1 py-3.5 px-4 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-2xl text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            Extend Session
          </button>
        </div>
      </div>
    </div>
  );
}

