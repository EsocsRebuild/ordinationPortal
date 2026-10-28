'use client';

import React from 'react';
import { CandidateProfile } from '@/types';
import { QrCodeSvg } from '@/components/ui/QrCodeSvg';
import { Button } from '@/components/ui/Button';
import { getRobingSpecifications } from '@/utils/ranks';
import { formatDate } from '@/utils/formatters';
import { Shield, Printer, X, CheckCircle2, User, Calendar, MapPin, Sparkles, Building, Lock, Check, Crown, Award, ShieldCheck } from 'lucide-react';

interface DigitalPassModalProps {
  candidate: CandidateProfile;
  isOpen?: boolean;
  onClose: () => void;
}

export function DigitalPassModal({ candidate, isOpen = true, onClose }: DigitalPassModalProps) {
  if (!isOpen) return null;

  const completedTiersCount = [
    candidate.tierApprovals?.branch?.approved,
    candidate.tierApprovals?.district?.approved,
    candidate.tierApprovals?.province?.approved,
    candidate.tierApprovals?.cmc?.approved,
    candidate.tierApprovals?.national?.approved,
  ].filter(Boolean).length;

  const isVettingCompleted = completedTiersCount === 5 || ['board_approved', 'investiture_assigned', 'ordained'].includes(candidate.stage);
  const isLeviesCleared = candidate.duesStatus === 'cleared';
  const isPassUnlocked = isVettingCompleted && isLeviesCleared;

  const robing = getRobingSpecifications(candidate.targetRankId);
  const verifyUrl = `https://ordination.esocs.church/verify/${candidate.id}`;
  const isOrdained = candidate.stage === 'ordained';

  // Formatted date
  const rawDate = candidate.dateOrdained || candidate.ordinationDate;
  const ceremonyDateFormatted = rawDate && !rawDate.includes('T')
    ? rawDate
    : 'Saturday, November 14, 2026';

  const assignedSeat = candidate.seatNumber || 'Zone A — Chancel Nave Pew 14';
  const presidingOfficiant = candidate.robingOfficer || 'His Most Eminence, The Baba Aladura & Prelate';
  const certNumber = candidate.certificateNumber || `CERT-2026-${candidate.targetRankId.replace('rank_', '').toUpperCase().slice(0, 8)}-6416`;

  const handlePrint = () => {
    window.print();
  };

  if (!isPassUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
        <div className="relative w-full max-w-xl bg-white dark:bg-[#090e1c] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 text-slate-900 dark:text-slate-100 transition-colors">
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide font-['Raleway']">
                  Admission Pass &bull; Verification Required
                </h2>
                <p className="text-[11px] text-amber-400 font-medium">
                  General Conference 2026 &bull; Mount Zion Fast-Track Entry
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-7 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
                Digital Ceremony Admission Pass Restricted
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                In accordance with Holy Order ordination canons, ceremony admission credentials and reserved seating allocations are released upon canonical clearance across all governance levels and settlement of statutory levies.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Governance Level Clearances:</span>
                <span className={`font-mono font-bold ${isVettingCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {isVettingCompleted ? 'Cleared (5/5 Approved) ✓' : `In Review (${completedTiersCount}/5 Approved) ⏳`}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Statutory Ordination Levies:</span>
                <span className={`font-mono font-bold ${isLeviesCleared ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {isLeviesCleared ? 'Settled in Full ✓' : `Pending (₦${Math.max(0, (candidate.levyBreakdown?.total || 0) - (candidate.duesAmountPaid || 0)).toLocaleString()} Due) ⏳`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Holy Synod Supreme Council Seal:</span>
                <span className={`font-mono font-bold ${isVettingCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {isVettingCompleted ? 'Affixed ✓' : 'Awaiting Final Synod Ratification 🔒'}
                </span>
              </div>
            </div>

            <Button
              variant="gold"
              size="md"
              onClick={onClose}
              className="w-full font-bold text-xs"
            >
              Return to Candidate Clearance Roadmap
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      {/* Global Print Isolation Stylesheet */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-pass, #printable-pass * {
            visibility: visible !important;
          }
          #printable-pass {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 12mm 15mm !important;
            background: white !important;
            color: #0f172a !important;
            box-shadow: none !important;
            border: 3px double #b45309 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            display: block !important;
          }
          @page {
            size: portrait;
            margin: 8mm;
          }
        }
      `}</style>

      <div className="relative w-full max-w-2xl bg-white dark:bg-[#090e1c] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 text-slate-900 dark:text-slate-100 transition-colors">
        
        {/* Modal Window Top Header (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
              {isOrdained ? <Crown className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide font-['Raleway']">
                {isOrdained ? 'Official Ministerial Credential' : 'Official Ordination Admission Pass'}
              </h2>
              <p className="text-[11px] text-amber-400 font-medium">
                {isOrdained
                  ? 'Holy Synod Consecrated Clergy Roster • Central Secretariat Worldwide'
                  : 'Holy Order General Conference 2026 • Mount Zion Sanctuary'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-slate-800 border border-amber-400/40 rounded-lg text-amber-300">
              {isOrdained ? certNumber : candidate.regNumber}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRINTABLE PASS / CREDENTIAL CARD (FOR ON-SCREEN & PHYSICAL PRINT)         */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-7 max-h-[78vh] overflow-y-auto" id="printable-pass">
          <div className="border-2 border-amber-600/70 rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30 dark:from-slate-900 dark:via-[#090e1c] dark:to-slate-900/90 shadow-sm relative overflow-hidden text-slate-900 dark:text-slate-100">
            
            {/* Watermark Crest */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
              <img src="/brand/esocs-crest.png" alt="ESOCS Crest" className="w-80 h-80 object-contain" />
            </div>

            {/* Ecclesiastical Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b-2 border-amber-600/40 text-center sm:text-left">
              <div className="flex items-center gap-3.5">
                <img
                  src="/brand/esocs-crest.png"
                  alt="ESOCS Crest"
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-sm shrink-0"
                />
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-amber-800 dark:text-amber-400 block font-serif">
                    The Eternal Sacred Order of the Cherubim & Seraphim
                  </span>
                  <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white leading-tight">
                    {isOrdained
                      ? 'Annual General Conference & Ministerial Consecration Record'
                      : 'Annual General Conference & Ordination Convocation 2026'}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    National Headquarters Cathedral &bull; Mount Zion, Ebute Metta, Lagos
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end shrink-0">
                {isOrdained ? (
                  <>
                    <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5" />
                      <span>Consecrated Clergy</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active Synod Roster
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-xs">
                      Official Gate Pass
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-1">
                      Gate 2 Access
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Candidate / Minister Identity Dossier */}
            <div className="py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              
              {/* Photo & QR Strip */}
              <div className="flex sm:flex-col items-center gap-3 shrink-0">
                <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-amber-500 shadow-md bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center">
                  {candidate.passportPhotoUrl ? (
                    <img
                      src={candidate.passportPhotoUrl}
                      alt={candidate.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <User className="w-8 h-8 text-amber-500" />
                      <span className="text-[9px] font-mono font-bold text-amber-500 mt-1">
                        {isOrdained ? 'ORDAINED' : 'ACCREDITED'}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-amber-500 text-slate-950 font-bold text-[9px] text-center py-0.5 uppercase tracking-wider">
                    {isOrdained ? 'Consecrated' : 'Candidate'}
                  </div>
                </div>

                <div className="p-1.5 bg-white rounded-xl shadow-xs border border-slate-200">
                  <QrCodeSvg value={verifyUrl} size={88} />
                </div>
              </div>

              {/* Minister / Candidate Metadata Details */}
              <div className="space-y-2.5 flex-1 text-center sm:text-left min-w-0">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    {isOrdained ? 'Consecrated Minister Legal & Ecclesiastical Name' : 'Candidate Legal & Ecclesiastical Name'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-slate-900 dark:text-white leading-tight break-words">
                    {candidate.fullName}
                  </h2>
                </div>

                {/* Rank Elevation Card */}
                {isOrdained ? (
                  <div className="inline-flex flex-wrap items-center justify-center sm:justify-start gap-2 p-2 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span>Consecrated Sacred Order:</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-extrabold uppercase tracking-wide">
                      {candidate.targetRankName}
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex flex-wrap items-center justify-center sm:justify-start gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="text-slate-600 dark:text-slate-400">
                      Current: <strong className="text-slate-900 dark:text-white">{candidate.currentRank}</strong>
                    </span>
                    <span className="text-amber-500 font-bold">&rarr;</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold border border-amber-500/40">
                      Ordaining To: {candidate.targetRankName}
                    </span>
                  </div>
                )}

                {/* Canonical Jurisdiction */}
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Building className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-slate-200 truncate">
                      Branch Level: {candidate.parish}
                    </span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">
                      District Level: {candidate.district || 'Ebute Metta District'} &bull; Province: {candidate.province}
                    </span>
                  </div>
                </div>

                {/* Verified Badge */}
                <div className="pt-1 flex items-center justify-center sm:justify-start gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/30 inline-flex items-center gap-1.5 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {isOrdained
                      ? 'Duly Consecrated & Invested by Holy Synod'
                      : 'Canonically Cleared & Ratified by Holy Synod'}
                  </span>
                </div>
              </div>

            </div>

            {/* Sanctuary Convocation / Consecration Logistics (4 Grid Blocks) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-4 border-b border-slate-200 dark:border-slate-800 text-xs">
              
              <div className="p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-center sm:text-left">
                <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                  {isOrdained ? 'Date of Consecration' : 'Convocation Date'}
                </span>
                <p className="font-bold text-slate-900 dark:text-white text-xs leading-tight">
                  {ceremonyDateFormatted}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isOrdained ? 'Solemn Consecration' : '07:30 AM Processional'}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-center sm:text-left">
                <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                  {isOrdained ? 'Canonical Roll & Cert' : 'Chancel Gate & Pew'}
                </span>
                <p className="font-bold text-slate-900 dark:text-white text-xs leading-tight">
                  {isOrdained ? certNumber : assignedSeat}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                  {isOrdained ? 'Permanent Synod Roll' : 'Gate 2 Admitted'}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-center sm:text-left">
                <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                  {isOrdained ? 'Consecration Cathedral' : 'Cathedral Venue'}
                </span>
                <p className="font-bold text-slate-900 dark:text-white text-xs leading-tight truncate">
                  Mount Zion Cathedral
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Ebute Metta, Lagos</p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 text-center sm:text-left">
                <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                  {isOrdained ? 'Consecrating Prelate' : 'Presiding Minister'}
                </span>
                <p className="font-bold text-slate-900 dark:text-white text-xs leading-tight truncate">
                  {presidingOfficiant}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isOrdained ? 'Prelate & Supreme Head' : 'Grand Consecrator'}
                </p>
              </div>

            </div>

            {/* Liturgical Vestment & Robing Standard */}
            <div className="py-3.5 border-b border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
                {isOrdained ? 'Authorized Sacred Vestment & Liturgical Dignity' : 'Sanctuary Robing & Liturgical Standard'}
              </span>
              <div className="p-2.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-amber-800 dark:text-amber-300 font-bold">Vestment Robe:</strong> {robing.vestmentColor} &bull;{' '}
                <strong className="text-amber-800 dark:text-amber-300 font-bold">Liturgical Stole:</strong> {robing.stoleType} &bull;{' '}
                {isOrdained ? (
                  <>
                    <strong className="text-amber-800 dark:text-amber-300 font-bold">Ministerial Authority:</strong> Canonically Authorized Sanctuary Officiant in all parishes and dioceses worldwide.
                  </>
                ) : (
                  <>
                    <strong className="text-amber-800 dark:text-amber-300 font-bold">Protocol:</strong> Unshod Holy Sanctuary Entry &bull; Consecration Hymnal Required.
                  </>
                )}
              </div>
            </div>

            {/* Official Attestation & Signatures Strip */}
            <div className="pt-4 flex items-center justify-between gap-4 text-xs">
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block">
                  {isOrdained ? 'General Secretary & Central Seal' : 'Candidate Signature & Date'}
                </span>
                <div className="w-36 sm:w-44 border-b border-slate-400 dark:border-slate-600 mt-3 pt-1">
                  <span className="font-serif italic text-slate-700 dark:text-slate-300 text-xs">
                    {isOrdained ? 'S. O. Amodu, SSA' : candidate.fullName}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">
                  {isOrdained ? 'Patriarchal Signature & Altar Seal' : 'Grand Registrar & Secretariat Seal'}
                </span>
                <div className="w-36 sm:w-48 border-b border-slate-400 dark:border-slate-600 mt-3 pt-1 flex items-center justify-end gap-1">
                  <span className="font-serif text-[11px] font-bold text-amber-800 dark:text-amber-400">
                    {isOrdained ? 'Baba Aladura, Prelate' : 'Dr. A. O. Oladipo, Reg.'}
                  </span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 inline" />
                </div>
              </div>
            </div>

            {/* Bottom Security Monospace Trace */}
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span>SECURITY HASH: SHA256-ORD-2026-{candidate.regNumber.replace(/[^a-zA-Z0-9]/g, '')}</span>
              <span>{isOrdained ? 'HOLY SYNOD ECCLESIASTICAL ROSTER' : 'NON-TRANSFERABLE • SACRED SANCTUARY USE ONLY'}</span>
            </div>

          </div>
        </div>

        {/* Footer Actions (Hidden in Print) */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 print:hidden">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
            {isOrdained
              ? 'Official Ministerial Credential • Registered with Central Secretariat Worldwide'
              : 'Issued for Holy Order Session 2026 • Present at Cathedral Check-in'}
          </span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1 sm:flex-none border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              Close
            </Button>
            <Button
              variant="gold"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
              className="flex-1 sm:flex-none font-bold shadow-md cursor-pointer"
            >
              {isOrdained ? 'Print Credential / Save PDF' : 'Print Pass / Save PDF'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}