'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  Layers,
  Info,
} from 'lucide-react';

interface DemoAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
}

export function DemoAccountModal({
  isOpen,
  onClose,
  onStartTour,
}: DemoAccountModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#090e1c] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white font-['Raleway']">
                Demonstration Mode Active
              </h2>
              <p className="text-[11px] text-amber-400 font-mono">
                Ordination Session 2026 Sandbox
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-['Raleway']">
              This is a Demo Account
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed px-2">
              You are signed into a live simulation of the <strong>ESOCS Ordination Portal</strong>. All ecclesiastical approvals, fees, seat allocations, and digital QR passes are fully interactive for evaluation.
            </p>
          </div>

          {/* Features highlight */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Full 5-tier clearance records pre-loaded</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Real-time photo upload & credential pass</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Itemized financial receipt & print preview</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          {onStartTour && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onStartTour();
              }}
              icon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
            >
              Start Guide Tour
            </Button>
          )}

          <Button
            variant="gold"
            size="sm"
            onClick={onClose}
            className="flex-1 font-bold"
          >
            Explore Dashboard
          </Button>
        </div>

      </div>
    </div>
  );
}

