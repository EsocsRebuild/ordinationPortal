'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CandidateProfile, InAppMessage, VettingTier } from '@/types';
import { Button } from '@/components/ui/Button';
import { DigitalPassModal } from '@/components/shared/DigitalPassModal';
import { CertificateModal } from '@/components/shared/CertificateModal';
import { PaymentClearanceSlipModal } from '@/components/shared/PaymentClearanceSlipModal';
import { CandidateLearnerTour } from '@/components/shared/CandidateLearnerTour';
import { DemoAccountModal } from '@/components/shared/DemoAccountModal';
import { Tooltip } from '@/components/ui/Tooltip';
import { api } from '@/services/api';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  QrCode,
  Calendar,
  Printer,
  ChevronRight,
  User,
  MapPin,
  Check,
  Camera,
  Copy,
  Receipt,
  FileText,
  Send,
  MessageSquare,
  Building,
  CheckCheck,
  Sparkles,
  CreditCard,
  HelpCircle,
  Download,
  Info,
  Compass,
} from 'lucide-react';

interface CandidateDashboardProps {
  candidate: CandidateProfile;
  onUpdateCandidate?: (updated: CandidateProfile) => void;
}

export function CandidateDashboard({ candidate: initialCandidate, onUpdateCandidate }: CandidateDashboardProps) {
  const [candidate, setCandidate] = useState<CandidateProfile>(initialCandidate);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [copiedReg, setCopiedReg] = useState(false);

  // Photo upload state
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(candidate.passportPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // In-app messaging state
  const [messages, setMessages] = useState<InAppMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCandidate(initialCandidate);
    if (initialCandidate.passportPhotoUrl) {
      setPhotoPreview(initialCandidate.passportPhotoUrl);
    }
  }, [initialCandidate]);

  useEffect(() => {
    api.getMessages(candidate.id)
      .then((data) => setMessages(data))
      .catch((err) => console.error('Error fetching messages:', err));
  }, [candidate.id]);

  const isInvestitureReady = ['board_approved', 'investiture_assigned', 'ordained'].includes(candidate.stage);
  const isOrdained = candidate.stage === 'ordained';

  const handleCopyReg = () => {
    navigator.clipboard.writeText(candidate.regNumber);
    setCopiedReg(true);
    setTimeout(() => setCopiedReg(false), 2000);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);

      try {
        const updated = await api.updateCandidate(candidate.id, { passportPhotoUrl: base64 }, candidate.fullName);
        if (updated) {
          setCandidate(updated);
          onUpdateCandidate?.(updated);
        }
      } catch (err) {
        console.error('Failed to update photo:', err);
      } finally {
        setIsUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      const sent = await api.sendMessage({
        candidateId: candidate.id,
        senderId: `user-${candidate.id}`,
        senderName: candidate.fullName,
        senderRole: 'candidate',
        content: newMessageText.trim(),
        category: 'general',
      });

      setMessages((prev) => [...prev, sent]);
      setNewMessageText('');
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // 5-Step Plain Language Progression
  const tierOrder: VettingTier[] = ['branch', 'district', 'province', 'cmc', 'national'];
  const currentTierIndex = tierOrder.indexOf(candidate.currentVettingTier);

  const approvalSteps = [
    {
      id: 'branch',
      title: 'Step 1: Parish Priest Approval',
      desc: 'Nomination verified & endorsed by your local Branch Parish',
      isCompleted: candidate.tierApprovals?.branch?.approved || currentTierIndex > 0 || isInvestitureReady,
      statusLabel: 'Approved ✓',
    },
    {
      id: 'district',
      title: 'Step 2: District Leader Review',
      desc: 'Vetting cleared by District Superintendent',
      isCompleted: candidate.tierApprovals?.district?.approved || currentTierIndex > 1 || isInvestitureReady,
      statusLabel: 'Approved ✓',
    },
    {
      id: 'province',
      title: 'Step 3: Provincial Office Clearance',
      desc: 'Quotas confirmed by Lagos Western Province Secretary',
      isCompleted: candidate.tierApprovals?.province?.approved || currentTierIndex > 2 || isInvestitureReady,
      statusLabel: 'Approved ✓',
    },
    {
      id: 'cmc',
      title: 'Step 4: Ordination Screening & Exam',
      desc: 'Doctrinal test passed with score: 89% (Passed)',
      isCompleted: candidate.tierApprovals?.cmc?.approved || currentTierIndex > 3 || isInvestitureReady,
      statusLabel: 'Passed ✓',
    },
    {
      id: 'national',
      title: 'Step 5: Church Council Final Seal',
      desc: 'Ratified by the Holy Order Supreme Council',
      isCompleted: candidate.tierApprovals?.national?.approved || isInvestitureReady,
      statusLabel: 'Cleared & Sealed ✓',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. CANDIDATE PROFILE & HEADER HERO CARD                                   */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#090e1c] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-9 shadow-xl relative overflow-hidden transition-colors duration-200">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Reference Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2.5">
            <Tooltip content="Click to Copy Registration ID">
              <button
                type="button"
                onClick={handleCopyReg}
                className="px-3 py-1.5 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-900 text-amber-700 dark:text-amber-300 border border-slate-300 dark:border-slate-700 rounded-xl inline-flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                <Copy className="w-3.5 h-3.5 text-amber-500" />
                <span>{candidate.regNumber}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                  {copiedReg ? '✓ Copied' : 'Copy'}
                </span>
              </button>
            </Tooltip>

            <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isInvestitureReady ? 'All 5 Approvals Cleared' : 'Approvals in Progress'}</span>
            </span>

            <button
              type="button"
              onClick={() => setShowDemoModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Demo Account Mode</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip content="Take an interactive tour of your candidate portal">
              <button
                type="button"
                onClick={() => setShowTourModal(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 inline-flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <Compass className="w-3.5 h-3.5 text-amber-500" />
                <span>Portal Guide & Tour</span>
              </button>
            </Tooltip>

            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              Session: <strong className="text-slate-900 dark:text-white font-mono">2026</strong>
            </span>
          </div>
        </div>

        {/* Main Identity Core (Passport Photo + Details + Actions) */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          
          {/* Left: Avatar & Candidate Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
            
            {/* Circular Avatar / Passport with Upload Option */}
            <div className="relative group shrink-0 mx-auto sm:mx-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 border-2 border-amber-500/80 ring-4 ring-amber-500/10 shadow-xl flex items-center justify-center relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={candidate.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <User className="w-10 h-10 text-slate-400" />
                    <span className="text-[9px] text-slate-400 mt-1 font-mono font-bold">PHOTO</span>
                  </div>
                )}

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-950/85 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-amber-300 transition-all cursor-pointer p-1 text-center"
                  title="Upload / Change Passport Photo"
                >
                  <Camera className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Update Photo</span>
                </div>
              </div>

              {/* Verified Status Check Badge */}
              <div className="absolute bottom-1 right-1 bg-emerald-500 text-white dark:text-slate-950 p-1.5 rounded-full border-2 border-white dark:border-slate-950 shadow-md">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>

            {/* Candidate Identity Text */}
            <div className="space-y-2 flex-1 text-center sm:text-left min-w-0">
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-['Raleway'] leading-tight">
                {candidate.fullName}
              </h1>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-white">{candidate.parish}</span>
                <span className="text-slate-400">&bull;</span>
                <span className="text-slate-600 dark:text-slate-400">{candidate.province}</span>
              </div>

              {/* Rank Progression Badge */}
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                <span className="text-slate-700 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  Current: <strong className="text-slate-900 dark:text-white ml-1">{candidate.currentRank}</strong>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                  Promoting to: {candidate.targetRankName}
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                  {candidate.tenureYears || 5} Years Service in Church ✓
                </span>
              </div>

            </div>

          </div>

          {/* Right: Key Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-56 shrink-0">
            {isInvestitureReady && (
              <Tooltip content="Open your digital accreditation pass with QR verification" position="left" className="w-full">
                <Button
                  variant="gold"
                  size="md"
                  icon={<QrCode className="w-4 h-4" />}
                  onClick={() => setShowPassModal(true)}
                  className="w-full justify-center shadow-lg font-bold text-xs h-11"
                >
                  Digital Ceremony Pass
                </Button>
              </Tooltip>
            )}

            {(isOrdained || isInvestitureReady) && (
              <Tooltip content="View and print your official certificate of ordination" position="left" className="w-full">
                <Button
                  variant="outline"
                  size="md"
                  icon={<Award className="w-4 h-4" />}
                  onClick={() => setShowCertModal(true)}
                  className="w-full justify-center bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 text-xs h-11"
                >
                  Ordination Certificate
                </Button>
              </Tooltip>
            )}

            <Tooltip content="Open and print your official itemized payment and clearance receipt" position="left" className="w-full">
              <Button
                variant="outline"
                size="md"
                icon={<Receipt className="w-4 h-4 text-emerald-500" />}
                onClick={() => setShowSlipModal(true)}
                className="w-full justify-center bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs h-11"
              >
                Official Payment Slip
              </Button>
            </Tooltip>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. QUICK SUMMARY KPI CARDS                                                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Approval Status */}
        <Tooltip content="All 5 levels of church canonical vetting have been completed" position="top" className="w-full">
          <div className="w-full bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-sm hover:border-emerald-500/40 transition-all cursor-default">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Approval Progress</p>
              <p className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">5 of 5 Approved</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">100% Cleared</p>
            </div>
          </div>
        </Tooltip>

        {/* KPI 2: Total Dues */}
        <Tooltip content="All Parish, District, Province, and Synod levies are settled" position="top" className="w-full">
          <div className="w-full bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-sm hover:border-amber-500/40 transition-all cursor-default">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Payment Status</p>
              <p className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">₦80,000 Paid</p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">Receipt Confirmed ✓</p>
            </div>
          </div>
        </Tooltip>

        {/* KPI 3: Ceremony Date */}
        <Tooltip content="Ordination convocation service at Mount Zion Cathedral, Yaba" position="top" className="w-full">
          <div className="w-full bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-sm hover:border-blue-500/40 transition-all cursor-default">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Ceremony Date</p>
              <p className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">Sat, Nov 14, 2026</p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400">09:00 AM Prompt</p>
            </div>
          </div>
        </Tooltip>

        {/* KPI 4: Assigned Seating */}
        <Tooltip content="Reserved seating in the chancel section with fast-track entry" position="top" className="w-full">
          <div className="w-full bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-sm hover:border-purple-500/40 transition-all cursor-default">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Assigned Seating</p>
              <p className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">Zone A &bull; Pew 14</p>
              <p className="text-[11px] text-purple-600 dark:text-purple-400">Gate 2 Entrance</p>
            </div>
          </div>
        </Tooltip>

      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN 2-COLUMN BALANCED WORKSPACE                                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: 5-Step Approval Progress & Ceremony Details */}
        <div className="space-y-6">
          
          {/* Card 1: 5-Step Approval Progress */}
          <div className="bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm transition-colors duration-200">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-['Raleway']">
                  5-Step Approval Progress
                </h2>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                5 of 5 Completed
              </span>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-3">
              {approvalSteps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    step.isCompleted
                      ? 'bg-slate-50 dark:bg-slate-900/90 border-emerald-500/30 text-slate-900 dark:text-white'
                      : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-mono text-xs text-amber-600 dark:text-amber-400 font-bold shrink-0">
                      0{idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {step.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 shrink-0 ml-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{step.statusLabel}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Ceremony & Seating Details */}
          <div id="ceremony-details" className="bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm transition-colors duration-200 scroll-mt-24">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Calendar className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-['Raleway']">
                Ceremony & Seating Details
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Date & Schedule</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    Saturday, Nov 14, 2026 &bull; 09:00 AM
                  </span>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium block mt-0.5">
                    Candidate Arrival & Check-in: 07:30 AM Sharp
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Venue Address</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    Mount Zion Cathedral Headquarters
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-0.5">
                    11/13 Hughes Avenue, Alagomeji, Yaba, Lagos
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <Building className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">Your Assigned Seat</span>
                  <span className="font-bold text-purple-700 dark:text-purple-300 text-sm">
                    Zone A &bull; Pew 14 (Reserved Front Section)
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-0.5">
                    Enter through Gate 2 &bull; Candidate Fast-Track Entry
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Payment Summary & Help Desk */}
        <div className="space-y-6">
          
          {/* Card 1: Payment & Dues Summary */}
          <div id="payment-summary" className="bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm transition-colors duration-200 scroll-mt-24">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-['Raleway']">
                  Payment & Dues Summary
                </h2>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                ₦80,000 Paid in Full ✓
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Branch Parish Fee</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">₦15,000 ✓</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">District Council Fee</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">₦15,000 ✓</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">Provincial Diocese Fee</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">₦20,000 ✓</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600 dark:text-slate-400">National Church Council Levy</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">₦30,000 ✓</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Receipt: {candidate.receiptNumber || 'REC-2026-ESOCS-7120'}
              </span>
              <button
                type="button"
                onClick={() => setShowSlipModal(true)}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>View & Print Official Slip</span>
              </button>
            </div>
          </div>

          {/* Card 2: Help Desk & Messages */}
          <div id="help-desk" className="bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm transition-colors duration-200 scroll-mt-24">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-['Raleway']">
                  Help Desk & Messages
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Send a direct message to the Church Ordination Office
                </p>
              </div>
            </div>

            {/* Chat Thread */}
            <div className="h-48 overflow-y-auto bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 mb-3.5 text-xs">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
                  <span>No messages yet. Type your inquiry below.</span>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.senderRole === 'candidate' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-3.5 py-2 rounded-xl text-xs ${
                        m.senderRole === 'candidate'
                          ? 'bg-amber-500 text-slate-950 font-medium shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-sm'
                      }`}
                    >
                      <p>{m.content}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                      {m.senderName} &bull; {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Ask a question or request assistance..."
                className="flex-1 bg-white dark:bg-[#080d1a] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <Button
                type="submit"
                variant="gold"
                size="sm"
                disabled={isSendingMessage || !newMessageText.trim()}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Send
              </Button>
            </form>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}
      {showPassModal && (
        <DigitalPassModal
          candidate={candidate}
          isOpen={showPassModal}
          onClose={() => setShowPassModal(false)}
        />
      )}

      {showCertModal && (
        <CertificateModal
          candidate={candidate}
          isOpen={showCertModal}
          onClose={() => setShowCertModal(false)}
        />
      )}

      {showSlipModal && (
        <PaymentClearanceSlipModal
          candidate={candidate}
          isOpen={showSlipModal}
          onClose={() => setShowSlipModal(false)}
        />
      )}

      {showTourModal && (
        <CandidateLearnerTour
          isOpen={showTourModal}
          onClose={() => setShowTourModal(false)}
          onOpenPass={() => setShowPassModal(true)}
          onOpenSlip={() => setShowSlipModal(true)}
        />
      )}

      {showDemoModal && (
        <DemoAccountModal
          isOpen={showDemoModal}
          onClose={() => setShowDemoModal(false)}
          onStartTour={() => setShowTourModal(true)}
        />
      )}

    </div>
  );
}
