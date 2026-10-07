'use client';

import React from 'react';
import { CandidateProfile } from '@/types';
import { QrCodeSvg } from '@/components/ui/QrCodeSvg';
import { Button } from '@/components/ui/Button';
import { getRobingSpecifications } from '@/utils/ranks';
import { formatDate } from '@/utils/formatters';
import { Shield, Printer, X, Award, CheckCircle2, User, Church, Calendar, MapPin } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header Bar */}
        <div className="bg-church-900 text-white px-6 py-4 flex items-center justify-between border-b border-church-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-church-800 rounded-lg border border-church-700">
              <Shield className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">
                Official Ordination Admission Pass
              </h2>
              <p className="text-xs text-church-300">
                The Eternal Sacred Order of the Cherubim and Seraphim (Mount Zion)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-church-300 hover:text-white rounded-lg hover:bg-church-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Pass Body */}
        <div className="p-6 md:p-8 space-y-6" id="printable-pass">
          {/* Top Banner Notice */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gold-50 dark:bg-amber-950/40 border border-gold-200 dark:border-amber-800/80 rounded-xl gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold-500/20 text-gold-800 dark:text-gold-300 rounded-full">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gold-900 dark:text-gold-200">
                  Duly Accredited & Cleared
                </p>
                <p className="text-xs text-gold-800 dark:text-gold-300/90">
                  Admit to Holy Investiture Chancel • Holy Order General Conference 2026
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-white dark:bg-slate-900 border border-gold-300 dark:border-amber-700 rounded text-slate-800 dark:text-slate-200">
                {candidate.regNumber}
              </span>
            </div>
          </div>

          {/* Candidate Profile Details with QR code and Passport Photo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="flex flex-col items-center justify-center md:border-r border-slate-200 dark:border-slate-700 pr-0 md:pr-4 gap-2">
              {candidate.passportPhotoUrl ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-amber-500/50 shadow-md mb-1">
                  <img src={candidate.passportPhotoUrl} alt={candidate.fullName} className="w-full h-full object-cover" />
                </div>
              ) : null}
              <QrCodeSvg value={verifyUrl} size={candidate.passportPhotoUrl ? 110 : 140} />
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 text-center">
                Scan to Authenticate Entry
              </p>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Ordinand Name</p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{candidate.fullName}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Target Sacred Order:</span>
                  <p className="font-semibold text-church-800 dark:text-gold-400">{candidate.targetRankName}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Current Order:</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{candidate.currentRank}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Province / Diocese:</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{candidate.province}</p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Parish:</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{candidate.parish}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Investiture & Seating Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-church-50 dark:bg-church-950/40 border border-church-200 dark:border-church-800 rounded-xl">
              <div className="flex items-center gap-2 text-church-800 dark:text-church-300 text-xs font-semibold uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4" />
                <span>Session Time</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {candidate.investitureSession || 'Saturday 09:00 AM'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Nov 14, 2026</p>
            </div>

            <div className="p-4 bg-church-50 dark:bg-church-950/40 border border-church-200 dark:border-church-800 rounded-xl">
              <div className="flex items-center gap-2 text-church-800 dark:text-church-300 text-xs font-semibold uppercase tracking-wider mb-1">
                <MapPin className="w-4 h-4" />
                <span>Seating Pew</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {candidate.seatNumber || 'Zone A - Chancel'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Mount Zion Cathedral</p>
            </div>

            <div className="p-4 bg-church-50 dark:bg-church-950/40 border border-church-200 dark:border-church-800 rounded-xl">
              <div className="flex items-center gap-2 text-church-800 dark:text-church-300 text-xs font-semibold uppercase tracking-wider mb-1">
                <User className="w-4 h-4" />
                <span>Robing Prelate</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {candidate.robingOfficer || 'Most Senior Apostle Coker'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Presiding Ordainer</p>
            </div>
          </div>

          {/* Canonical Robing Requirements */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-gold-600" />
              Canonical Robing & Vestment Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Vestment Color: </span>
                <span className="text-slate-600 dark:text-slate-400">{robing.vestmentColor}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Stole & Band: </span>
                <span className="text-slate-600 dark:text-slate-400">{robing.stoleType}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Headwear / Mitre: </span>
                <span className="text-slate-600 dark:text-slate-400">{robing.capOrCrown}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Insignia / Staff: </span>
                <span className="text-slate-600 dark:text-slate-400">{robing.insigniaNotes}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Generated: {formatDate(new Date().toISOString())} • Non-transferable
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
              Print Admission Pass
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

