'use client';

import React, { useState } from 'react';
import { CandidateProfile } from '@/types';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { DigitalPassModal } from '@/components/shared/DigitalPassModal';
import { CertificateModal } from '@/components/shared/CertificateModal';
import { PaymentClearanceSlipModal } from '@/components/shared/PaymentClearanceSlipModal';
import { getRobingSpecifications } from '@/utils/ranks';
import { api } from '@/services/api';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  QrCode,
  Printer,
  Sparkles,
  BookOpen,
  User,
  Building,
  Check,
  ChevronRight,
  History,
  FileCheck,
  Receipt,
  Download,
  Flame,
  Layers,
  Crown,
  Scroll,
  Lock,
  Mail,
  Send,
  ExternalLink,
  Info,
  Clock,
  Shirt,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface ConsecratedClergyDashboardProps {
  candidate: CandidateProfile;
  onSwitchToClearanceView?: () => void;
  onUpdateCandidate?: (updated: CandidateProfile) => void;
}

export function ConsecratedClergyDashboard({
  candidate: initialCandidate,
  onSwitchToClearanceView,
  onUpdateCandidate,
}: ConsecratedClergyDashboardProps) {
  const [candidate, setCandidate] = useState<CandidateProfile>(initialCandidate);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'vestments' | 'timeline' | 'synod'>('overview');
  const [isConfirmingOrdination, setIsConfirmingOrdination] = useState(false);
  const [showEmailNotice, setShowEmailNotice] = useState(false);

  // Gating rule: User must be ordained AND accredited/checked-in
  const isOrdainedAndAccredited = candidate.stage === 'ordained' && (candidate.isCheckedIn || !!candidate.accreditedBy || !!candidate.seatNumber);

  const robing = getRobingSpecifications(candidate.targetRankId);
  const certNumber = candidate.certificateNumber || `CERT-2026-${candidate.targetRankId.replace('rank_', '').toUpperCase()}-0219`;
  const ordinationDate = candidate.dateOrdained || 'November 14, 2026';
  const conferredRank = candidate.targetRankName;

  // Super Admin Action to confirm ordination and accreditation
  const handleSuperAdminConfirmOrdination = async () => {
    setIsConfirmingOrdination(true);
    try {
      const generatedCert = `CERT-2026-SYNOD-${Math.floor(1000 + Math.random() * 9000)}`;
      const updated = await api.updateCandidate(
        candidate.id,
        {
          stage: 'ordained',
          isCheckedIn: true,
          accreditedBy: 'Prof. David A. Oladele (Super Admin)',
          certificateNumber: generatedCert,
          dateOrdained: 'November 14, 2026',
        },
        'Prof. David A. Oladele (Super Admin)'
      );

      if (updated) {
        setCandidate(updated);
        onUpdateCandidate?.(updated);
        setShowEmailNotice(true);
      }
    } catch (err) {
      console.error('Failed to confirm ordination:', err);
    } finally {
      setIsConfirmingOrdination(false);
    }
  };

  // ===========================================================================
  // GATED STATE: If NOT YET Ordained & Accredited
  // ===========================================================================
  if (!isOrdainedAndAccredited) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* Top Header Card */}
        <div className="bg-white dark:bg-[#090e1c] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                  Canonical Access Gateway
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
                  Consecrated Clergy Record Locked
                </h2>
              </div>
            </div>

            {onSwitchToClearanceView && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSwitchToClearanceView}
                icon={<ChevronRight className="w-4 h-4 rotate-180" />}
                className="text-xs font-semibold"
              >
                Return to Clearance Deck
              </Button>
            )}
          </div>

          <div className="py-6 space-y-6">
            <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <p className="font-semibold text-slate-900 dark:text-white mb-1">
                Official Ordination Records & Gazette Seal Access Criteria:
              </p>
              This permanent clergy records dashboard unlocks automatically once your physical attendance is accredited at Mount Zion Cathedral and the Sacred Consecration Rites are confirmed by the Super Admin Secretariat.
            </div>

            {/* 4-Step Accreditation & Consecration Progression Tracker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    1. Vetting & Doctrinal Clearances
                  </span>
                  <span>Cleared ✓</span>
                </div>
                <p className="text-emerald-700/80 dark:text-emerald-400/80 text-[11px]">
                  5 of 5 ecclesiastical tiers approved including Holy Synod examination.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-1.5 ${
                candidate.isCheckedIn || candidate.accreditedBy
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-2">
                    {candidate.isCheckedIn || candidate.accreditedBy ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
                    2. Cathedral Accreditation Check-In
                  </span>
                  <span>{candidate.isCheckedIn || candidate.accreditedBy ? 'Accredited ✓' : 'Awaiting Check-in'}</span>
                </div>
                <p className="opacity-80 text-[11px]">
                  Physical pass scanned at Cathedral Chancel Gate (Seat: {candidate.seatNumber || 'Assigned Zone A'}).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    3. Consecration Rites by Baba Aladura
                  </span>
                  <span className="text-amber-600 dark:text-amber-400">Nov 14, 2026</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Laying of hands and investiture of the {candidate.targetRankName} order.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-500" />
                    4. Super Admin Gazette & Email Dispatch
                  </span>
                  <span className="text-slate-500">Pending Rites</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Official gazetting, digital certificate generation, and email confirmation dispatch.
                </p>
              </div>

            </div>

            {/* Super Admin / Reviewer Simulation Action Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-purple-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Super Admin Consecration Confirmation
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg">
                  Click below to simulate the Super Admin signing off on {candidate.fullName}&apos;s consecration, issuing the gazetted seal, sending the confirmation email, and unlocking the Consecrated Clergy Dashboard.
                </p>
              </div>

              <button
                type="button"
                disabled={isConfirmingOrdination}
                onClick={handleSuperAdminConfirmOrdination}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0 active:scale-95 flex items-center gap-2"
              >
                {isConfirmingOrdination ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Signing Gazette...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Confirm Consecration (Admin)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // ===========================================================================
  // UNLOCKED STATE: CONSECRATED CLERGY RECORD DASHBOARD
  // ===========================================================================
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Email Dispatch Toast Notice */}
      {showEmailNotice && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-2xl flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-xs sm:text-sm">
              <strong>Official Gazette Consecration Notice Sent:</strong> A formal letter of consecration and digital credential seal has been dispatched to <strong>{candidate.email}</strong>.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowEmailNotice(false)}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. OFFICIAL CONSECRATED HERO HEADER                                       */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#090e1c] border border-amber-500/30 rounded-3xl p-6 sm:p-8 lg:p-9 shadow-xl relative overflow-hidden transition-colors">
        
        {/* Subtle Ambient Gold / Royal Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Reference & Consecration Gazetted Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 inline-flex items-center gap-1.5 shadow-sm">
              <Crown className="w-3.5 h-3.5" />
              <span>Consecrated Holy Order Clergy</span>
            </span>

            <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Holy Synod Gazetted & Conferred ✓</span>
            </span>

            <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Cert No: {certNumber}
            </span>
          </div>

          {onSwitchToClearanceView && (
            <Tooltip content="Switch to pre-ordination clearance history timeline">
              <button
                type="button"
                onClick={onSwitchToClearanceView}
                className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-600 underline inline-flex items-center gap-1"
              >
                <span>View Clearance Progression History</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </Tooltip>
          )}
        </div>

        {/* Main Consecrated Profile Body */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          
          {/* Left: Consecrated Portrait & Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
            
            {/* Consecrated Portrait with Golden Ring */}
            <div className="relative shrink-0 mx-auto sm:mx-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 border-2 border-amber-500 ring-4 ring-amber-500/20 shadow-2xl flex items-center justify-center">
                {candidate.passportPhotoUrl ? (
                  <img
                    src={candidate.passportPhotoUrl}
                    alt={candidate.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <User className="w-10 h-10 text-amber-500" />
                    <span className="text-[9px] text-amber-500 mt-1 font-mono font-bold">ORDAINED</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-amber-500 text-slate-950 rounded-full shadow-lg border-2 border-white dark:border-[#090e1c]">
                <Crown className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

            {/* Consecrated Minister Details */}
            <div className="space-y-2 text-center sm:text-left min-w-0">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Elevated Ecclesiastical Order Conferred</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
                {candidate.fullName}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  {conferredRank}
                </span>

                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{candidate.parish}</span>
                </span>

                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{candidate.province}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Consecration Quick Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0 justify-center sm:justify-start">
            <button
              type="button"
              onClick={() => setShowCertModal(true)}
              className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Scroll className="w-4 h-4" />
              <span>Official Certificate</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPassModal(true)}
              className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xs border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-amber-500" />
              <span>Clergy Pass</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSlipModal(true)}
              className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xs border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-emerald-500" />
              <span>Payment Slip</span>
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. PATRIARCHAL WELCOME & PASTORAL BLESSING FROM HIS MOST EMINENCE           */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-amber-500/15 via-white to-amber-500/5 dark:from-amber-950/40 dark:via-[#090e1c] dark:to-purple-950/30 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 lg:p-9 shadow-xl relative overflow-hidden transition-colors">
        
        {/* Subtle Watermark Cross / Insignia */}
        <div className="absolute right-6 -bottom-6 opacity-5 dark:opacity-10 pointer-events-none">
          <Crown className="w-64 h-64 text-amber-500" />
        </div>

        <div className="relative z-10 space-y-6">
          
          {/* Header of the Blessing */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-serif font-bold text-2xl flex items-center justify-center shadow-lg ring-4 ring-amber-500/20 shrink-0">
                BA
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 inline-block mb-1">
                  Apostolic Charge & Consecration Blessing
                </span>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-white">
                  Welcome Address from His Most Eminence, The Baba Aladura
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Prelate & Supreme Head of the Eternal Sacred Order of the Cherubim & Seraphim Worldwide
                </p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 block">
                Session 2026 Consecration
              </span>
              <span className="text-[11px] text-slate-500">Holy Mount Zion Headquarters</span>
            </div>
          </div>

          {/* Scriptural Charge Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 font-serif italic text-sm sm:text-base text-amber-950 dark:text-amber-200 leading-relaxed text-center sm:text-left">
            &ldquo;Feed the flock of God which is among you, taking the oversight thereof, not by constraint, but willingly; not for filthy lucre, but of a ready mind; neither as being lords over God&apos;s heritage, but being ensamples to the flock. And when the chief Shepherd shall appear, ye shall receive a crown of glory that fadeth not away.&rdquo;
            <span className="block mt-2 font-sans font-bold not-italic text-xs text-amber-800 dark:text-amber-400">
              — 1 Peter 5:2–4
            </span>
          </div>

          {/* Pastoral Welcome Message Body */}
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-3 leading-relaxed">
            <p>
              Beloved in Christ, <strong>{candidate.fullName}</strong>, by the sovereign grace of the Almighty God and the apostolic authority vested in the Holy Order, we welcome you into the exalted college of the <strong>{conferredRank}</strong> of the Eternal Sacred Order of the Cherubim & Seraphim.
            </p>
            <p>
              You have been called to higher ministerial stewardship, sanctuary governance, and continuous intercession for the body of Christ. Let your elevation reflect unwavering humility, holy devotion, and exemplary pastoral leadership in your parish, district, and province.
            </p>
          </div>

          {/* Patriarchal Signature & Altar Seal Footer */}
          <div className="pt-4 border-t border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-serif font-bold text-slate-900 dark:text-white">
                  His Most Eminence, Baba Aladura
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  Apostolic Seal & Patriarchal Office Ratified ✓
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                Gazette: SYNOD-ORD-{candidate.targetRankId.toUpperCase().slice(0, 8)}-2026
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. STRUCTURED TAB NAVIGATION                                              */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Conferred Rights & Altar Duties</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vestments')}
          className={`py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'vestments'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Shirt className="w-4 h-4 text-purple-500" />
          <span>Authorized Vestment Standard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'timeline'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4 text-blue-500" />
          <span>Lifetime Ministerial Progression</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('synod')}
          className={`py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'synod'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>Clergy Synod Directives</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. TAB CONTENTS                                                           */}
      {/* ========================================================================= */}

      {/* TAB 1: OVERVIEW & CONFERRED ALTAR RIGHTS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          
          {/* Left 2 Cols: Conferred Canonical Rights */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#090e1c] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                    Conferred Ecclesiastical Authority & Ministry Rights
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                  Fully Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                    01
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Sacred Altar Administration
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Authorized to administer holy sacraments, lead sanctuary devotion, and officiate altar ceremonies in accordance with Holy Order canons.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                    02
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Pastoral Care & Counseling
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Ratified leader of family spiritual development, maternal council, youth mentoring, and Holy Mount prayer rites.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                    03
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Holy Synod Council Voting Seat
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Entitled to voice and vote at Provincial Clergy Assemblies and National Advisory Board deliberations.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                    04
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Ecclesiastical Gazette Seal
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Permanent entry into the National Holy Order Gazette Roll with verifiable QR accreditation credentials worldwide.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Right 1 Col: Quick Credentials & Contact Secretariat */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#090e1c] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-500" />
                <span>Clergy Credential Summary</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Conferred Order</span>
                  <span className="font-bold text-slate-900 dark:text-white">{conferredRank}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Certificate No.</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{certNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Date Ordained</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{ordinationDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Jurisdiction</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{candidate.province}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Gazetted & Active ✓</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => setShowCertModal(true)}
                  icon={<Download className="w-4 h-4" />}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Download Sealed Certificate PDF
                </Button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: AUTHORIZED VESTMENT STANDARD */}
      {activeTab === 'vestments' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#090e1c] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                Synod Regalia Protocol
              </span>
              <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mt-1">
                Official Consecration Vestment Specifications for {conferredRank}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Mandated ecclesiastical tailoring standard for all liturgical services and Holy Synod assemblies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Primary Cassock */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                    Primary Sacred Cassock
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                    Body Garment
                  </span>
                </div>
                <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                  {robing.vestmentColor}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tailored floor-length cassock with pleated back, cuffs, and gold ecclesiastical piping.
                </p>
              </div>

              {/* Liturgical Stole & Sash */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Liturgical Stole & Sash
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    Ministerial Yoke
                  </span>
                </div>
                <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                  {robing.stoleType}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Embroidered silk drape adorned with seven golden stars and metallic bullion fringe.
                </p>
              </div>

              {/* Cap, Crown or Diadem */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    Consecration Cap & Headwear
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                    Head Covering
                  </span>
                </div>
                <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                  {robing.capOrCrown}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Structured ceremonial velvet headwear featuring gold cross embroidered crest.
                </p>
              </div>

              {/* Insignia & Altar Seal */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Insignia & Altar Seal
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    Jurisdiction
                  </span>
                </div>
                <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                  {robing.insigniaNotes}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Certified for sacred altar administration, family counseling, and Holy Mount prayer rites.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIFETIME MINISTERIAL PROGRESSION TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-[#090e1c] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              Permanent Clergy Chronicle
            </span>
            <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mt-1">
              Ministerial Progression Timeline
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Verified record of your elevation milestones across the Holy Order.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            
            {/* Consecrated Rank (Current) */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 shadow-md">
                <Crown className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {conferredRank} (Consecrated)
                  </h4>
                  <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                    2026 Conferred ✓
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Elevated at Mount Zion Cathedral Headquarters by His Most Eminence, The Baba Aladura. Cert No: {certNumber}.
                </p>
              </div>
            </div>

            {/* Previous Rank */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {candidate.currentRank}
                  </h4>
                  <span className="text-xs font-mono text-slate-500">
                    {candidate.currentRankYear} Conferred
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Confirmed order with {candidate.tenureYears || 5} years meritorious service rendered across branch and district.
                </p>
              </div>
            </div>

            {/* Foundation Order */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 opacity-80">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Holy Baptism & Admission into Holy Order
                  </h4>
                  <span className="text-xs font-mono text-slate-500">
                    {candidate.dateJoinedChurch?.split('-')[0] || '1996'} Registered
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Initial enrollment into {candidate.parish}, {candidate.province}.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: CLERGY SYNOD DIRECTIVES */}
      {activeTab === 'synod' && (
        <div className="bg-white dark:bg-[#090e1c] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Liturgical Schedule & Assemblies
            </span>
            <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mt-1">
              Upcoming Consecrated Clergy Synod Schedule
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Mandatory gatherings, annual advisory retreats, and sanctuary communion sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Annual Clergy Retreat
                </span>
                <span className="font-mono text-slate-500">Jan 15–18, 2027</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Holy Mount Prayer & Consecration Re-Dedication
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Mount Zion Cathedral Headquarters, Lagos. Reserved Seating: Chancel Section A.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" /> General Conference
                </span>
                <span className="font-mono text-slate-500">Easter 2027</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Holy Order Supreme Council Deliberations
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Provincial Synod Voting delegation roll call at 08:00 AM WAT.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Modals */}
      <DigitalPassModal
        isOpen={showPassModal}
        onClose={() => setShowPassModal(false)}
        candidate={candidate}
      />

      <CertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        candidate={candidate}
      />

      <PaymentClearanceSlipModal
        isOpen={showSlipModal}
        onClose={() => setShowSlipModal(false)}
        candidate={candidate}
      />

    </div>
  );
}
