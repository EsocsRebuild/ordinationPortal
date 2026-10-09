'use client';

import React from 'react';
import { CandidateProfile } from '@/types';
import { QrCodeSvg } from '@/components/ui/QrCodeSvg';
import { Button } from '@/components/ui/Button';
import { getRobingSpecifications } from '@/utils/ranks';
import { formatDate } from '@/utils/formatters';
import { Shield, Printer, X, Award, CheckCircle2, User, Calendar, MapPin, Sparkles } from 'lucide-react';

interface DigitalPassModalProps {
  candidate: CandidateProfile;
  isOpen?: boolean;
  onClose: () => void;
}

export function DigitalPassModal({ candidate, isOpen = true, onClose }: DigitalPassModalProps) {
  if (!isOpen) return null;

  const robing = getRobingSpecifications(candidate.targetRankId);
  const verifyUrl = `https://ordination.esocs.church/verify/${candidate.id}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 text-slate-900 dark:text-slate-100">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white font-serif">
                Official Ordination Admission Pass
              </h2>
              <p className="text-xs text-amber-400/90 font-medium">
                The Eternal Sacred Order of the Cherubim and Seraphim (Mount Zion)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Pass Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto" id="printable-pass">
          {/* Top Banner Notice */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 rounded-2xl gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Duly Accredited & Cleared
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Admit to Holy Investiture Chancel • General Conference 2026
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold px-3 py-1.5 bg-white dark:bg-slate-950 border border-amber-400/40 rounded-xl text-amber-600 dark:text-amber-400 shadow-sm">
                {candidate.regNumber}
              </span>
            </div>
          </div>

          {/* Candidate Profile Details with QR code and Passport Photo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-50 dark:bg-slate-950/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col items-center justify-center md:border-r border-slate-200 dark:border-slate-800 pr-0 md:pr-6 gap-2">
              {candidate.passportPhotoUrl ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-md mb-1">
                  <img src={candidate.passportPhotoUrl} alt={candidate.fullName} className="w-full h-full object-cover" />
                </div>
              ) : null}
              <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <QrCodeSvg value={verifyUrl} size={candidate.passportPhotoUrl ? 100 : 120} />
              </div>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 text-center font-semibold">
                Scan to Authenticate Entry
              </p>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ordinand Name</p>
                <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white mt-0.5">{candidate.fullName}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Target Sacred Order:</span>
                  <p className="font-bold text-amber-600 dark:text-amber-400 text-sm mt-0.5">{candidate.targetRankName}</p>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Current Holy Order:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">{candidate.currentRank}</p>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Province / Diocese:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{candidate.province}</p>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Parish Assembly:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{candidate.parish}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Investiture & Seating Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 rounded-2xl">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4" />
                <span>Session Time</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {candidate.investitureSession || 'Saturday 09:00 AM'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Nov 14, 2026</p>
            </div>

            <div className="p-4 bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 rounded-2xl">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <MapPin className="w-4 h-4" />
                <span>Allocated Pew</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {candidate.seatNumber || 'Zone A - Chancel'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Mount Zion Cathedral</p>
            </div>

            <div className="p-4 bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 rounded-2xl">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <User className="w-4 h-4" />
                <span>Robing Prelate</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {candidate.robingOfficer || 'Most Senior Apostle Coker'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Presiding Ordainer</p>
            </div>
          </div>

          {/* Canonical Robing Requirements */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-950/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Canonical Robing & Vestment Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Vestment Color:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{robing.vestmentColor}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Stole & Band:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{robing.stoleType}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Headwear / Mitre:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{robing.capOrCrown}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Insignia / Staff:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{robing.insigniaNotes}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-950/80 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Issued: {formatDate(new Date().toISOString())} • Non-transferable
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" size="lg" onClick={onClose} className="flex-1 sm:flex-none">
              Close
            </Button>
            <Button
              variant="primary"
              size="lg"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
              className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-3"
            >
              Print Admission Pass
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
