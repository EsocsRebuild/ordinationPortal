'use client';

import React from 'react';
import { CandidateProfile } from '@/types';
import { Button } from '@/components/ui/Button';
import { QrCodeSvg } from '@/components/ui/QrCodeSvg';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  Receipt,
  Printer,
  X,
  CheckCircle2,
  Building,
  ShieldCheck,
  Award,
  Download,
  Calendar,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface PaymentClearanceSlipModalProps {
  candidate: CandidateProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentClearanceSlipModal({
  candidate,
  isOpen,
  onClose,
}: PaymentClearanceSlipModalProps) {
  if (!isOpen) return null;

  const verifyUrl = `https://ordination.esocs.church/verify/${candidate.id}`;
  const receiptNo = candidate.receiptNumber || 'REC-2026-ESOCS-7120';
  const totalAmount = candidate.levyBreakdown?.total || 80000;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#090e1c] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 text-slate-900 dark:text-slate-100">
        
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-white font-['Raleway']">
                Official Payment & Clearance Slip
              </h2>
              <p className="text-[11px] text-amber-400 font-mono">
                Ordination Session 2026 &bull; {receiptNo}
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

        {/* Printable Receipt Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto" id="printable-receipt">
          
          {/* Church Crest & Header */}
          <div className="text-center pb-5 border-b border-slate-200 dark:border-slate-800 space-y-1">
            <div className="inline-flex items-center justify-center p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl mb-1">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight uppercase font-serif">
              The Eternal Sacred Order of the Cherubim and Seraphim
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              General Secretariat Headquarters &bull; Mount Zion, Yaba, Lagos
            </p>
            <div className="inline-block px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 mt-2">
              Official Assessment Receipt &bull; Cleared & Sealed
            </div>
          </div>

          {/* Candidate & Metadata Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Candidate Name</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{candidate.fullName}</p>
              <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{candidate.regNumber}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Target Sacred Elevation</span>
              <p className="font-bold text-amber-600 dark:text-amber-400 text-sm">{candidate.targetRankName}</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">From: {candidate.currentRank}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Parish / Branch</span>
              <p className="font-medium text-slate-800 dark:text-slate-200">{candidate.parish}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Province / Diocese</span>
              <p className="font-medium text-slate-800 dark:text-slate-200">{candidate.province}</p>
            </div>
          </div>

          {/* Itemized Assessment Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Ordination Levies & Quota Breakdown
            </h3>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px]">
                  <tr>
                    <th className="px-4 py-2.5">Levy Description</th>
                    <th className="px-4 py-2.5">Jurisdiction</th>
                    <th className="px-4 py-2.5 text-right">Amount</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Branch Parish Development Share</td>
                    <td className="px-4 py-2.5 text-slate-500">{candidate.parish}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold">₦15,000</td>
                    <td className="px-4 py-2.5 text-center text-emerald-600 dark:text-emerald-400 font-semibold">✓ Paid</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">District Council Administrative Share</td>
                    <td className="px-4 py-2.5 text-slate-500">District Office</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold">₦15,000</td>
                    <td className="px-4 py-2.5 text-center text-emerald-600 dark:text-emerald-400 font-semibold">✓ Paid</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Provincial Secretariat Ordination Quota</td>
                    <td className="px-4 py-2.5 text-slate-500">{candidate.province}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold">₦20,000</td>
                    <td className="px-4 py-2.5 text-center text-emerald-600 dark:text-emerald-400 font-semibold">✓ Paid</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Holy Synod Central Apex Levies & Regalia</td>
                    <td className="px-4 py-2.5 text-slate-500">Holy Order Synod</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold">₦30,000</td>
                    <td className="px-4 py-2.5 text-center text-emerald-600 dark:text-emerald-400 font-semibold">✓ Paid</td>
                  </tr>
                  <tr className="bg-amber-500/5 dark:bg-amber-400/5 font-bold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                    <td className="px-4 py-3" colSpan={2}>Total Assessment Cleared</td>
                    <td className="px-4 py-3 text-right font-mono text-base text-amber-600 dark:text-amber-400">
                      {formatCurrency(totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                      PAID IN FULL
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification Barcode & Stamp */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                <QrCodeSvg value={verifyUrl} size={64} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Cryptographic Hash</span>
                <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 block truncate max-w-[240px]">
                  {candidate.verificationHash || 'SHA256-ESOCS-7A9B1C3D8E2F'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Verified by General Secretariat Ledger
                </span>
              </div>
            </div>

            <div className="text-center sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800">
              <div className="inline-block px-3 py-1 border-2 border-dashed border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-black uppercase tracking-widest rotate-[-3deg]">
                ✓ OFFICIAL RECEIPT SEALED
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Date: {formatDate(new Date().toISOString())}</p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
            Official Financial Document &bull; Valid for Accreditation
          </span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1 sm:flex-none">
              Close
            </Button>
            <Button
              variant="gold"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
              className="flex-1 sm:flex-none font-bold"
            >
              Print Payment Slip (PDF)
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

