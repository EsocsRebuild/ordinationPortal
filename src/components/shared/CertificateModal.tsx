'use client';

import React from 'react';
import { CandidateProfile } from '@/types';
import { QrCodeSvg } from '@/components/ui/QrCodeSvg';
import { Button } from '@/components/ui/Button';
import { createCertificateRecord } from '@/utils/certificate';
import { Shield, Printer, X, Download, CheckCircle2 } from 'lucide-react';

interface CertificateModalProps {
  candidate: CandidateProfile;
  isOpen?: boolean;
  onClose: () => void;
}

export function CertificateModal({ candidate, isOpen = true, onClose }: CertificateModalProps) {
  if (!isOpen) return null;

  const cert = createCertificateRecord(candidate);
  const verifyUrl = `https://ordination.esocs.church/verify/${candidate.id}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-gold-400/40 overflow-hidden my-6">
        {/* Modal Bar */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-gold-400" />
            <span className="text-sm font-semibold tracking-wide text-slate-200">
              Official Ordination Certificate Viewer
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrint} className="text-white border-slate-700 hover:bg-slate-800">
              Print Official Certificate
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* High-Resolution Certificate Canvas */}
        <div className="p-6 md:p-10 bg-gradient-to-b from-[#FFFDF7] to-[#FDFBF4] dark:from-slate-950 dark:to-slate-900 print:p-0">
          <div className="relative border-8 border-double border-[#C5A059] p-8 md:p-12 rounded-lg bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
            {/* Watermark Crest Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
              <Shield className="w-[500px] h-[500px] text-slate-900 dark:text-white" />
            </div>

            {/* Corner Filigrees */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#C5A059]" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#C5A059]" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#C5A059]" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#C5A059]" />

            {/* Certificate Header */}
            <div className="text-center space-y-2 relative z-10">
              <div className="inline-flex items-center justify-center p-3 bg-church-900 text-gold-400 rounded-full mb-1 shadow-md">
                <Shield className="w-8 h-8" />
              </div>
              <h1 className="font-serif text-xl sm:text-3xl font-bold tracking-tight text-[#0B132B] dark:text-slate-100 uppercase">
                The Eternal Sacred Order of the Cherubim and Seraphim
              </h1>
              <p className="text-xs sm:text-sm font-serif italic text-[#6B5A38] dark:text-gold-300">
                (Mount Zion - Founded 1925 • Registered in Nigeria Under the Land Perpetual Succession Act)
              </p>
              <div className="w-32 h-0.5 bg-[#C5A059] mx-auto my-3" />
              <h2 className="font-serif text-lg sm:text-2xl font-bold uppercase tracking-widest text-[#B45309] dark:text-gold-400">
                Certificate of Holy Ordination
              </h2>
            </div>

            {/* Certificate Text Body */}
            <div className="my-8 text-center space-y-4 max-w-2xl mx-auto relative z-10">
              <p className="font-serif text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                Be it known unto all the faithful in Christ Jesus, that by the grace of Almighty God and through the sacred laying on of hands in holy convocation,
              </p>

              <div className="py-2">
                <p className="text-2xl sm:text-3xl font-serif font-bold text-church-900 dark:text-gold-200 border-b-2 border-dashed border-[#C5A059]/50 inline-block px-8 py-1">
                  {candidate.fullName}
                </p>
              </div>

              <p className="font-serif text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                having satisfied all ordination requirements, spiritual examinations, and council reviews, has this day been solemnly consecrated and ordained into the sacred order of:
              </p>

              <div className="py-2">
                <span className="text-xl sm:text-2xl font-serif font-extrabold uppercase tracking-wider text-church-800 dark:text-gold-400 bg-gold-50 dark:bg-amber-950/60 px-6 py-2 rounded-lg border border-gold-300 dark:border-amber-700 inline-block shadow-sm">
                  {candidate.targetRankName}
                </span>
              </div>

              <p className="font-serif text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                With full ecclesiastical authority to minister in the sanctuary, proclaim the Word of Truth, conduct divine services, and shepherd the flock under the Constitution and Ordinances of the Holy Order.
              </p>
            </div>

            {/* Signatures & Seal Section */}
            <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 items-end relative z-10">
              {/* Secretary Signature */}
              <div className="text-center space-y-1">
                <div className="h-10 flex items-center justify-center font-serif italic text-sm text-church-800 dark:text-slate-200">
                  S. O. Amodu, SSA
                </div>
                <div className="border-t border-slate-400 w-48 mx-auto" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Secretary General</p>
                <p className="text-[10px] text-slate-500">Central Secretariat Worldwide</p>
              </div>

              {/* Central Golden Seal & QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-[#C5A059] bg-[#FAF6EE] dark:bg-slate-800 flex flex-col items-center justify-center p-2 text-center shadow-inner">
                    <Shield className="w-6 h-6 text-[#B45309]" />
                    <span className="text-[7px] font-bold uppercase tracking-tighter text-[#854D0E] dark:text-gold-300 mt-1">
                      HOLY ORDER SEAL
                    </span>
                    <span className="text-[6px] text-slate-600 dark:text-slate-400">1925 • 2026</span>
                  </div>
                </div>
                <div className="mt-3">
                  <QrCodeSvg value={verifyUrl} size={90} />
                </div>
                <p className="text-[9px] font-mono text-slate-500 mt-1">Scan for Instant Auth</p>
              </div>

              {/* Supreme Head Signature */}
              <div className="text-center space-y-1">
                <div className="h-10 flex items-center justify-center font-serif italic text-base font-bold text-church-900 dark:text-gold-300">
                  Baba Aladura, Prelate
                </div>
                <div className="border-t border-slate-400 w-48 mx-auto" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">His Most Eminence</p>
                <p className="text-[10px] text-slate-500">The Baba Aladura & Prelate of ESOCS</p>
              </div>
            </div>

            {/* Anti-Forgery Footer Bar */}
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 gap-2 relative z-10">
              <div>
                <span>REG NO: {candidate.regNumber}</span> • <span>CERT NO: {cert.certificateNumber}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CRYPTOGRAPHIC HASH: {cert.tamperProofHash}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

