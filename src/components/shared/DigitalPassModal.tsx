'use client';

import React from 'react';
import { CandidateProfile } from '@/types';
import { QrCodeSvg } from '@/components/ui/QrCodeSvg';
import { Button } from '@/components/ui/Button';
import { getRobingSpecifications } from '@/utils/ranks';
import { formatDate } from '@/utils/formatters';
import { Shield, Printer, X, CheckCircle2, User, Calendar, MapPin, Sparkles } from 'lucide-react';

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
      <div className="relative w-full max-w-xl bg-white dark:bg-[#090e1c] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 text-slate-900 dark:text-slate-100 transition-colors">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide font-['Raleway']">
                Ordination Admission Pass
              </h2>
              <p className="text-[11px] text-amber-400 font-medium">
                General Conference 2026 &bull; Mount Zion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-slate-800 border border-amber-400/40 rounded-lg text-amber-300">
              {candidate.regNumber}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pass Content Body */}
        <div className="p-6 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto" id="printable-pass">
          
          {/* Main Candidate Card */}
          <div className="bg-slate-50 dark:bg-[#0e162a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            
            {/* QR Code & Avatar */}
            <div className="flex flex-col items-center shrink-0">
              <div className="p-2 bg-white rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
                <QrCodeSvg value={verifyUrl} size={110} />
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Duly Verified
              </span>
            </div>

            {/* Candidate Details */}
            <div className="space-y-3 flex-1 text-center sm:text-left min-w-0">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Candidate</span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight font-['Raleway']">
                  {candidate.fullName}
                </h3>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Promoting To:</span>
                  <span className="font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                    {candidate.targetRankName}
                  </span>
                </div>
                <div className="text-slate-700 dark:text-slate-300 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Current Rank:</span> {candidate.currentRank}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                  <MapPin className="w-3 h-3 text-amber-500 inline mr-1" />
                  {candidate.parish} &bull; {candidate.province}
                </div>
              </div>
            </div>

          </div>

          {/* Quick Details (Date, Seating, Officiant) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Date & Time</span>
              <p className="font-bold text-slate-900 dark:text-white text-xs">Sat, Nov 14, 2026</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">09:00 AM Prompt</p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Assigned Seat</span>
              <p className="font-bold text-slate-900 dark:text-white text-xs">{candidate.seatNumber || 'Zone A • Pew 14'}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Gate 2 Entrance</p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl text-center sm:text-left">
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Presiding Minister</span>
              <p className="font-bold text-slate-900 dark:text-white text-xs truncate">{candidate.robingOfficer || 'Apostle General Coker'}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Ordaining Officiant</p>
            </div>
          </div>

          {/* Dress & Robing Standard (Compact Strip) */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Ceremony Vestment Standard</span>
            <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
              <strong className="text-amber-700 dark:text-amber-300">Robe:</strong> {robing.vestmentColor} &bull; <strong className="text-amber-700 dark:text-amber-300">Stole:</strong> {robing.stoleType}
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
            Issued: 2026 Session &bull; Non-transferable
          </span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1 sm:flex-none border-slate-300 dark:border-slate-700">
              Close
            </Button>
            <Button
              variant="gold"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
              className="flex-1 sm:flex-none font-bold"
            >
              Print Pass
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
