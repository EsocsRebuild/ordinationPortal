'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import {
  LogOut,
  ShieldAlert,
  X,
  CheckCircle2,
  Lock,
  Building,
  User,
} from 'lucide-react';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export function SignOutModal({ isOpen, onClose, onConfirm }: SignOutModalProps) {
  const { user, logout } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSigningOut) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSigningOut, onClose]);

  if (!isOpen) return null;

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      if (onConfirm) {
        await onConfirm();
      } else {
        await logout();
      }
      onClose();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ES';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSigningOut}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          aria-label="Cancel sign out"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Icon with Warning Glow */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/10">
              <LogOut className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-slate-950 rounded-full border-2 border-white dark:border-[#0b1021] shadow-xs">
              <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 inline-block">
              Security & Session Protocol
            </span>
            <h2 id="signout-modal-title" className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
              End Canonical Session?
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Are you sure you want to sign out of the ESOCS Holy Order Ordination Portal?
            </p>
          </div>
        </div>

        {/* User Identity Snapshot */}
        {user && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user.name}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                <span className="font-mono text-amber-700 dark:text-amber-400 truncate">
                  {user.email}
                </span>
                {user.jurisdiction && (
                  <>
                    <span>&bull;</span>
                    <span className="truncate">{user.jurisdiction}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reassurance Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[11px]">
            Your ordination progress, clearance endorsements, and payment records remain saved in the ecclesiastical central registry. You can sign back in anytime.
          </p>
        </div>

        {/* Modal Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSigningOut}
            className="w-full text-xs font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Stay Signed In
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleConfirmSignOut}
            loading={isSigningOut}
            icon={<LogOut className="w-4 h-4" />}
            className="w-full text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md border-0"
          >
            Sign Out Now
          </Button>
        </div>
      </div>
    </div>
  );
}

