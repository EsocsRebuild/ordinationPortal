'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  User,
  ShieldCheck,
  Calendar,
  Receipt,
  QrCode,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface CandidateLearnerTourProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPass?: () => void;
  onOpenSlip?: () => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    title: 'Your Profile & Passport Photo',
    subtitle: 'Official Church Record',
    icon: User,
    color: 'from-amber-500 to-amber-600',
    description:
      'Your profile displays your full official name, current church rank, target elevation rank, and ministry tenure. You can hover over your avatar to upload or update your official ordination passport photograph anytime.',
    tip: 'Make sure your photo has a plain white background for the official consecration register.',
  },
  {
    step: 2,
    title: '5-Step Sequential Approval Tracker',
    subtitle: '5-Tier Ordination Clearance',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-emerald-600',
    description:
      'Track your progress through all 5 levels of church administration: Step 1 (Parish Priest), Step 2 (District Leader), Step 3 (Provincial Diocese), Step 4 (Screening Exam), and Step 5 (Church Council Seal).',
    tip: 'All 5 steps are cleared automatically when verified by the presiding church authorities.',
  },
  {
    step: 3,
    title: 'Ceremony Schedule & Allocated Pew',
    subtitle: 'Convocation Day Instructions',
    icon: Calendar,
    color: 'from-blue-500 to-blue-600',
    description:
      'View your official ceremony date (Nov 14, 2026), arrival check-in time (07:30 AM), Cathedral address, allocated zone and pew number, and authorized liturgical vestments.',
    tip: 'Keep your assigned seat and gate number handy when arriving at the Cathedral portico.',
  },
  {
    step: 4,
    title: 'Digital Pass & Official Payment Slip',
    subtitle: 'Accreditation & Financial Receipts',
    icon: Receipt,
    color: 'from-purple-500 to-purple-600',
    description:
      'Access your digital ceremony pass with instant QR verification for gate marshals, view your official assessment fee receipts, and print your formal ordination clearance slip.',
    tip: 'You can print or download your payment receipt and admission pass anytime before ordination day.',
  },
];

export function CandidateLearnerTour({
  isOpen,
  onClose,
  onOpenPass,
  onOpenSlip,
}: CandidateLearnerTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const current = TOUR_STEPS[currentStepIndex];
  const Icon = current.icon;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#090e1c] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 text-slate-900 dark:text-slate-100">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white font-['Raleway']">
                Candidate Portal Interactive Guide
              </h2>
              <p className="text-[11px] text-amber-400 font-mono">
                Step {current.step} of {TOUR_STEPS.length}
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

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Progress Indicator Dots */}
          <div className="flex items-center justify-center gap-2">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? 'w-8 bg-amber-500'
                    : idx < currentStepIndex
                    ? 'w-2 bg-emerald-500'
                    : 'w-2 bg-slate-300 dark:bg-slate-700'
                }`}
                title={`Go to step ${s.step}`}
              />
            ))}
          </div>

          {/* Step Hero Visual */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                {current.subtitle}
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-['Raleway']">
                {current.title}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-center px-2">
            {current.description}
          </p>

          {/* Helpful Tip Box */}
          <div className="p-3.5 bg-amber-500/10 dark:bg-amber-400/5 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-xs">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-bold text-amber-800 dark:text-amber-300 block text-[11px]">Helpful Tip:</span>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] mt-0.5">{current.tip}</p>
            </div>
          </div>

        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={isFirst}
            icon={<ChevronLeft className="w-4 h-4" />}
            className={isFirst ? 'invisible' : ''}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-slate-500"
            >
              Skip Tour
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleNext}
              icon={isLast ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              className="font-bold"
            >
              {isLast ? 'Got it, Finish' : 'Next Step'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

