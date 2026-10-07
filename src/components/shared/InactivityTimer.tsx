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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-white tracking-tight">Canonical Session Inactivity</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            For canonical security and data protection, your session will automatically terminate in:
          </p>
          <div className="text-3xl font-mono font-extrabold text-amber-400 py-1">
            00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={triggerLogout}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out Now
          </button>
          <button
            onClick={handleResetActivity}
            className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-amber-500/20"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
}

