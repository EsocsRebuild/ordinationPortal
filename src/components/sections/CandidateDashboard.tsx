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
import { useRealtimeCandidate, useRealtimeMessages, realtimeClient } from '@/services/realtime';
import Link from 'next/link';
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
  ChevronDown,
  BookOpen,
  CheckSquare,
  Shield,
  ExternalLink,
  Flame,
  AlertCircle,
  ArrowRight,
  DollarSign,
  LayoutDashboard,
} from 'lucide-react';

interface CandidateDashboardProps {
  candidate: CandidateProfile;
  activeTab?: 'overview' | 'clearance' | 'payments' | 'pass' | 'support';
  onUpdateCandidate?: (updated: CandidateProfile) => void;
  onSwitchToConsecratedView?: () => void;
}

export function CandidateDashboard({
  candidate: initialCandidate,
  activeTab = 'overview',
  onUpdateCandidate,
  onSwitchToConsecratedView,
}: CandidateDashboardProps) {
  const [candidate, setCandidate] = useRealtimeCandidate(initialCandidate.id, initialCandidate);
  const [messages, setMessages] = useRealtimeMessages(initialCandidate.id, []);
  const [currentTab, setCurrentTab] = useState<'overview' | 'clearance' | 'payments' | 'pass' | 'support'>(activeTab);
  
  // Modals
  const [showPassModal, setShowPassModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [copiedReg, setCopiedReg] = useState(false);

  // Selected / Expanded clearance step in clearance view
  const [expandedStepId, setExpandedStepId] = useState<string | null>('branch');

  // Interactive Checklist State
  const [checklist, setChecklist] = useState({
    vetting: true,
    levies: true,
    pass: true,
    vestment: false,
    pew: true,
  });

  // Photo upload state
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(candidate?.passportPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // In-app messaging state
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (candidate?.passportPhotoUrl) {
      setPhotoPreview(candidate.passportPhotoUrl);
    }
  }, [candidate?.passportPhotoUrl]);

  useEffect(() => {
    if (candidate) {
      onUpdateCandidate?.(candidate);
    }
  }, [candidate]);

  useEffect(() => {
    if (initialCandidate.id) {
      api.getMessages(initialCandidate.id)
        .then((data) => {
          if (Array.isArray(data)) setMessages(data);
        })
        .catch((err) => console.error('Error fetching messages:', err));
    }
  }, [initialCandidate.id, setMessages]);

  const currentCandidate = candidate || initialCandidate;
  const isInvestitureReady = ['board_approved', 'investiture_assigned', 'ordained'].includes(currentCandidate.stage);
  const isOrdained = currentCandidate.stage === 'ordained';

  const handleCopyReg = () => {
    navigator.clipboard.writeText(currentCandidate.regNumber);
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

      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
      realtimeClient.broadcastLocal({
        id: `evt_${Date.now()}`,
        type: 'MESSAGE_SENT',
        timestamp: new Date().toISOString(),
        payload: sent,
        actor: currentCandidate.fullName,
        candidateId: currentCandidate.id,
      });
      setNewMessageText('');
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // 5-Step Rich Interactive Clearance Progression Data
  const tierOrder: VettingTier[] = ['branch', 'district', 'province', 'cmc', 'national'];
  const currentTierIndex = tierOrder.indexOf(candidate.currentVettingTier);

  const approvalSteps = [
    {
      id: 'branch',
      stepNumber: '01',
      title: 'Parish Priest Nomination & Endorsement',
      authority: 'Branch Parish Rector & Leadership Committee',
      officer: candidate.branchPriestName || 'Snr. Apostle Festus N. Okon',
      date: 'April 14, 2026',
      desc: 'Verified active church membership, local parish tithes, and exemplary moral standing.',
      isCompleted: candidate.tierApprovals?.branch?.approved || currentTierIndex > 0 || isInvestitureReady,
      statusLabel: 'Approved ✓',
      sealBadge: 'Parish Seal Confirmed',
      comments: 'Nomination verified with highest recommendation from Mount Zion Parish.',
    },
    {
      id: 'district',
      stepNumber: '02',
      title: 'District Council Vetting & Ratification',
      authority: 'District Superintendent Council',
      officer: 'Special Snr. Apostle E. O. Johnson (District Leader)',
      date: 'May 02, 2026',
      desc: 'Zonal background check cleared, constitutional ordination quota certified within district.',
      isCompleted: candidate.tierApprovals?.district?.approved || currentTierIndex > 1 || isInvestitureReady,
      statusLabel: 'Approved ✓',
      sealBadge: 'District Quota Cleared',
      comments: 'No disciplinary history on record. Meritorious service verified across branches.',
    },
    {
      id: 'province',
      stepNumber: '03',
      title: 'Provincial Diocese Clearance & Quotas',
      authority: 'Lagos Western Provincial Secretariat',
      officer: 'Apostle General G. A. Adebayo (Provincial Secretary)',
      date: 'June 18, 2026',
      desc: 'Provincial diocesan registry validated and passed forward to the National Screening Board.',
      isCompleted: candidate.tierApprovals?.province?.approved || currentTierIndex > 2 || isInvestitureReady,
      statusLabel: 'Approved ✓',
      sealBadge: 'Diocesan Quota Allotted',
      comments: 'Candidate allocation slot #14 of 25 in Lagos Western Province ratified.',
    },
    {
      id: 'cmc',
      stepNumber: '04',
      title: 'Ordination Screening & Doctrinal Examination',
      authority: 'Central Ministerial Committee (CMC Examination Directorate)',
      officer: 'Special Snr. Apostle Dr. G. Bassey (Screening Director)',
      date: 'July 29, 2026',
      desc: 'Oral interview, written theology assessment, and Liturgical governance examination passed.',
      isCompleted: candidate.tierApprovals?.cmc?.approved || currentTierIndex > 3 || isInvestitureReady,
      statusLabel: 'Passed (89%) ✓',
      sealBadge: 'CMC Distinction Certified',
      comments: 'Scored 89% in Church Liturgy, Biblical Hermeneutics, and Pastoral Administration.',
    },
    {
      id: 'national',
      stepNumber: '05',
      title: 'Holy Synod & Church Supreme Council Final Seal',
      authority: 'Holy Order Supreme Advisory Council & Office of the Prelate',
      officer: 'Prof. David A. Oladele (Supervising Apostle General / Super Admin)',
      date: 'August 15, 2026',
      desc: 'Supreme ratification concluded. Ceremony seating and gazetted ordination pass generated.',
      isCompleted: candidate.tierApprovals?.national?.approved || isInvestitureReady,
      statusLabel: 'Ratified & Sealed ✓',
      sealBadge: 'Supreme Consecration Seal',
      comments: 'Certified for solemn consecration by His Most Eminence, Baba Aladura.',
    },
  ];

  const completedCount = approvalSteps.filter((s) => s.isCompleted).length;
  const progressPercent = Math.round((completedCount / approvalSteps.length) * 100);

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. CANDIDATE PROFILE HERO CARD (MODERN, RESPONSIVE, APP-LIKE)             */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#090e1c] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-7 lg:p-8 shadow-xl relative overflow-hidden transition-colors duration-200">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Reference & Quick Utility Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-5 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          
          {/* Left: Reg ID & Clearance status */}
          <div className="flex items-center gap-2">
            <Tooltip content="Click to Copy Registration ID">
              <button
                type="button"
                onClick={handleCopyReg}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-900 text-amber-700 dark:text-amber-300 border border-slate-300 dark:border-slate-700 rounded-xl inline-flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-amber-500" />
                <span>{candidate.regNumber}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal hidden sm:inline">
                  {copiedReg ? '✓ Copied' : 'Copy'}
                </span>
              </button>
            </Tooltip>

            <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isInvestitureReady ? 'All 5 Approvals Cleared' : 'Approvals in Progress'}</span>
              <span className="sm:hidden">5/5 Cleared</span>
            </span>
          </div>

          {/* Right: Quick actions (Demo, Tour, Clergy View) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowDemoModal(true)}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Demo Mode</span>
              <span className="sm:hidden">Demo</span>
            </button>

            {onSwitchToConsecratedView && (
              <Tooltip content="Preview post-ordination Consecrated Clergy records and official gazette">
                <button
                  type="button"
                  onClick={onSwitchToConsecratedView}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/40 inline-flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Consecrated Clergy</span>
                  <span className="sm:hidden">Clergy</span>
                </button>
              </Tooltip>
            )}

            <Tooltip content="Interactive Portal Tour">
              <button
                type="button"
                onClick={() => setShowTourModal(true)}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 inline-flex items-center gap-1 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden md:inline">Portal Guide</span>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Main Identity Core (Passport Photo + Details + Actions) */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-7">
          
          {/* Left: Avatar & Candidate Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-4 sm:gap-6 w-full lg:w-auto">
            
            {/* Circular Avatar / Passport with Upload Option */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 border-2 border-amber-500/80 ring-4 ring-amber-500/10 shadow-lg flex items-center justify-center relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={candidate.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <User className="w-8 h-8 text-slate-400" />
                    <span className="text-[9px] text-slate-400 mt-1 font-mono font-bold">PHOTO</span>
                  </div>
                )}

                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                >
                  <Camera className="w-4 h-4 mb-0.5" />
                  <span>Update</span>
                </button>
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
            <div className="space-y-1.5 flex-1 text-center sm:text-left min-w-0">
              
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                {candidate.fullName}
              </h1>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-white">{candidate.parish}</span>
                <span className="text-slate-400">&bull;</span>
                <span className="text-slate-600 dark:text-slate-400">{candidate.province}</span>
              </div>

              {/* Rank Progression Path */}
              <div className="pt-1">
                <div className="inline-flex flex-wrap items-center justify-center sm:justify-start gap-1.5 p-1.5 sm:p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium shadow-xs">
                    Current: <strong className="text-slate-900 dark:text-white ml-0.5">{candidate.currentRank}</strong>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30 shadow-xs">
                    Target: {candidate.targetRankName}
                  </span>
                  <span className="hidden md:inline-flex text-[11px] text-emerald-700 dark:text-emerald-400 font-mono px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    {candidate.tenureYears || 5} Yrs Ministry ✓
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Right: Key Action Buttons (Clean Grid on Mobile, Column on Desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-col gap-2.5 w-full lg:w-56 shrink-0 pt-2 lg:pt-0">
            {isInvestitureReady && (
              <Tooltip content="Open your digital accreditation pass with QR verification" position="left" className="w-full">
                <Button
                  variant="gold"
                  size="md"
                  icon={<QrCode className="w-4 h-4" />}
                  onClick={() => setShowPassModal(true)}
                  className="w-full justify-center shadow-md font-bold text-xs h-10 sm:h-11"
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
                  className="w-full justify-center bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 text-xs h-10 sm:h-11"
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
                className="w-full justify-center bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs h-10 sm:h-11"
              >
                Official Payment Slip
              </Button>
            </Tooltip>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. SECTION NAVIGATOR TABS (Overview, Clearance, Payments, Pass, Support)  */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold overflow-x-auto">
        <Link
          href="/dashboard/candidate?tab=overview"
          onClick={() => setCurrentTab('overview')}
          className={`py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            currentTab === 'overview'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-amber-500" />
          <span>My Overview & Records</span>
        </Link>

        <Link
          href="/dashboard/candidate?tab=clearance"
          onClick={() => setCurrentTab('clearance')}
          className={`py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            currentTab === 'clearance'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-emerald-500" />
          <span>Ordination Clearance (5/5)</span>
        </Link>

        <Link
          href="/dashboard/candidate?tab=payments"
          onClick={() => setCurrentTab('payments')}
          className={`py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            currentTab === 'payments'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4 text-amber-500" />
          <span>Payment & Fee Receipts</span>
        </Link>

        <Link
          href="/dashboard/candidate?tab=pass"
          onClick={() => setCurrentTab('pass')}
          className={`py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            currentTab === 'pass'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4 text-blue-500" />
          <span>Ceremony Pass & Seating</span>
        </Link>

        <Link
          href="/dashboard/candidate?tab=support"
          onClick={() => setCurrentTab('support')}
          className={`py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
            currentTab === 'support'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-purple-500" />
          <span>Support & Help Desk</span>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 3. DEDICATED TAB VIEWS                                                    */}
      {/* ========================================================================= */}

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & RECORDS (MODEST, CLEAN, UNCLUTTERED)                     */}
      {/* ========================================================================= */}
      {currentTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Quick Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Link href="/dashboard/candidate?tab=clearance" className="group">
              <div className="w-full bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-sm group-hover:border-emerald-500/60 transition-all cursor-pointer">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                  <CheckCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Clearance Progress</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">5 of 5 Approved</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">100% Cleared →</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/candidate?tab=payments" className="group">
              <div className="w-full bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-sm group-hover:border-amber-500/60 transition-all cursor-pointer">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Payment Status</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">₦80,000 Paid</p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">Receipt Confirmed →</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/candidate?tab=pass" className="group">
              <div className="w-full bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-sm group-hover:border-blue-500/60 transition-all cursor-pointer">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Ceremony Date</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">Sat, Nov 14, 2026</p>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400">09:00 AM Prompt →</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/candidate?tab=pass" className="group">
              <div className="w-full bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-sm group-hover:border-purple-500/60 transition-all cursor-pointer">
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Building className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Assigned Seating</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">Zone A &bull; Pew 14</p>
                  <p className="text-[11px] text-purple-600 dark:text-purple-400">Gate 2 Entrance →</p>
                </div>
              </div>
            </Link>

          </div>

          {/* Readiness Checklist & Quick Access Hub */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Interactive Pre-Ordination Readiness Checklist */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-5 h-5 text-amber-500" />
                  <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    Candidate Ordination Readiness Checklist
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-lg">
                  4 of 5 Ready
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <label
                  onClick={() => toggleChecklist('vetting')}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 transition-all cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={checklist.vetting}
                    onChange={() => {}}
                    className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-amber-500 border-slate-300 dark:border-slate-700"
                  />
                  <div className="space-y-0.5 flex-1">
                    <span className={`font-semibold text-sm ${checklist.vetting ? 'text-slate-900 dark:text-white line-through opacity-80' : 'text-slate-900 dark:text-white'}`}>
                      Ordination Clearance & Screening (5/5 Approved)
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      All parish, district, provincial, and national screening requirements ratified.
                    </p>
                  </div>
                  <Link href="/dashboard/candidate?tab=clearance" className="text-amber-700 dark:text-amber-400 hover:underline font-bold text-[11px]">
                    Details →
                  </Link>
                </label>

                <label
                  onClick={() => toggleChecklist('levies')}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 transition-all cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={checklist.levies}
                    onChange={() => {}}
                    className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-amber-500 border-slate-300 dark:border-slate-700"
                  />
                  <div className="space-y-0.5 flex-1">
                    <span className={`font-semibold text-sm ${checklist.levies ? 'text-slate-900 dark:text-white line-through opacity-80' : 'text-slate-900 dark:text-white'}`}>
                      Statutory Levies & Ordination Dues (₦80,000 Cleared)
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Branch, district, province, and national ordination fees fully paid.
                    </p>
                  </div>
                  <Link href="/dashboard/candidate?tab=payments" className="text-amber-700 dark:text-amber-400 hover:underline font-bold text-[11px]">
                    Receipt →
                  </Link>
                </label>

                <label
                  onClick={() => toggleChecklist('pass')}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 transition-all cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={checklist.pass}
                    onChange={() => {}}
                    className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-amber-500 border-slate-300 dark:border-slate-700"
                  />
                  <div className="space-y-0.5 flex-1">
                    <span className={`font-semibold text-sm ${checklist.pass ? 'text-slate-900 dark:text-white line-through opacity-80' : 'text-slate-900 dark:text-white'}`}>
                      Digital Ceremony Pass with Gate 2 QR Code
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Pass contains your Gate 2 QR barcode required for chancel entry.
                    </p>
                  </div>
                  <Link href="/dashboard/candidate?tab=pass" className="text-amber-700 dark:text-amber-400 hover:underline font-bold text-[11px]">
                    View Pass →
                  </Link>
                </label>

                <label
                  onClick={() => toggleChecklist('vestment')}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 transition-all cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={checklist.vestment}
                    onChange={() => {}}
                    className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-amber-500 border-slate-300 dark:border-slate-700"
                  />
                  <div className="space-y-0.5 flex-1">
                    <span className={`font-semibold text-sm ${checklist.vestment ? 'text-slate-900 dark:text-white line-through opacity-80' : 'text-slate-900 dark:text-white'}`}>
                      Ordination Robes & Vestments Tailored to Standard
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Sacred cassock, stole, and liturgical cap ready for chancel inspection.
                    </p>
                  </div>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    {checklist.vestment ? 'Ready ✓' : 'Click to confirm'}
                  </span>
                </label>
              </div>
            </div>

            {/* Right 1 Col: Quick Links Card */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Quick Navigation</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <Link
                    href="/dashboard/candidate?tab=clearance"
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-amber-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckSquare className="w-4 h-4 text-emerald-500" />
                      <span className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400">Ordination Clearance Records</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    href="/dashboard/candidate?tab=payments"
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-amber-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Receipt className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400">Payment & Slip Breakdown</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    href="/dashboard/candidate?tab=pass"
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-amber-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <QrCode className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400">Ceremony Pass & Itinerary</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    href="/dashboard/candidate?tab=support"
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-amber-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 text-purple-500" />
                      <span className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400">Parish Priest Help Desk</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DEDICATED ORDINATION CLEARANCE PAGE                                */}
      {/* ========================================================================= */}
      {currentTab === 'clearance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Main Clearance Roadmap */}
          <div className="bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-white">
                    5-Tier Ordination Clearance Roadmap
                  </h2>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Detailed ecclesiastical vetting records, signing officers, and ratification seals.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  5 of 5 Ratified (100% Cleared) ✓
                </span>
              </div>
            </div>

            {/* Step-by-Step Interactive Cards */}
            <div className="space-y-3">
              {approvalSteps.map((step) => {
                const isExpanded = expandedStepId === step.id;
                return (
                  <div
                    key={step.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? 'border-amber-500/50 bg-amber-500/[0.03] dark:bg-amber-500/[0.04] ring-1 ring-amber-500/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-amber-700 dark:text-amber-400 font-mono font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-inner">
                          {step.stepNumber}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                              {step.title}
                            </h3>
                            <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {step.sealBadge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {step.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{step.statusLabel}</span>
                        </span>

                        <div className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-transform ${
                          isExpanded ? 'rotate-180 text-amber-500' : ''
                        }`}>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/40 text-xs space-y-4 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Vetting Authority</span>
                            <span className="font-semibold text-slate-900 dark:text-white text-xs">{step.authority}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Signing Officer</span>
                            <span className="font-semibold text-slate-900 dark:text-white text-xs">{step.officer}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Date Ratified</span>
                            <span className="font-mono font-semibold text-amber-700 dark:text-amber-400 text-xs">{step.date}</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-amber-800 dark:text-amber-300 mr-1.5">Official Vetting Remarks:</span>
                          {step.comments}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Doctrinal Exam Scorecard */}
          <div className="bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  CMC Doctrinal Screening & Exam Scorecard
                </h3>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                Grade: A (89% Passed)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Scripture & Theology</span>
                <span className="font-mono text-base font-bold text-slate-900 dark:text-white mt-1 block">92%</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Distinction</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Liturgy & Church Doctrine</span>
                <span className="font-mono text-base font-bold text-slate-900 dark:text-white mt-1 block">88%</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Passed</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Oral Examination</span>
                <span className="font-mono text-base font-bold text-slate-900 dark:text-white mt-1 block">87%</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Recommended</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Conduct & Rating</span>
                <span className="font-mono text-base font-bold text-purple-600 dark:text-purple-400 mt-1 block">Exemplary</span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Clear Record</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DEDICATED PAYMENT & FEE RECEIPTS PAGE                              */}
      {/* ========================================================================= */}
      {currentTab === 'payments' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-white">
                    Official Payment & Statutory Fee Receipts
                  </h2>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Itemized ordination statutory levies, payment references, and digital receipt generation.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowSlipModal(true)}
                  icon={<Printer className="w-4 h-4" />}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Print Official Payment Slip
                </Button>
              </div>
            </div>

            {/* Total Paid Header Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-50 to-emerald-500/5 dark:from-emerald-950/30 dark:via-slate-900 dark:to-emerald-950/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  All Statutory Ordination Levies Cleared
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 dark:text-white">
                  ₦80,000.00 Paid in Full
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Official Church Account &bull; Confirmed by Lagos Central Province Treasury
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 dark:sm:border-slate-800 sm:pl-6">
                <span className="text-[11px] font-mono text-slate-500 block">Official Receipt Number</span>
                <span className="text-sm font-mono font-bold text-amber-700 dark:text-amber-400 block mt-0.5">
                  {candidate.receiptNumber || 'REC-2026-ESOCS-7120'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Status: Cleared ✓
                </span>
              </div>
            </div>

            {/* Itemized Dues Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">Statutory Fee Description</th>
                    <th className="py-3 px-4">Beneficiary Level</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  <tr>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-semibold">
                      Branch Parish Administrative & Screening Dues
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{candidate.parish}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">₦15,000.00</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-[10px]">
                        Cleared ✓
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-semibold">
                      District Council Ministerial Vetting Fee
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{candidate.district}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">₦15,000.00</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-[10px]">
                        Cleared ✓
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-semibold">
                      Provincial Diocese Registry & Quota Levy
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{candidate.province}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">₦20,000.00</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-[10px]">
                        Cleared ✓
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-semibold">
                      National Holy Synod Consecration & Robing Levy
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">Holy Order General Conference</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">₦30,000.00</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-[10px]">
                        Cleared ✓
                      </span>
                    </td>
                  </tr>

                  <tr className="bg-slate-50 dark:bg-slate-900/80 font-bold text-sm">
                    <td colSpan={2} className="py-3.5 px-4 text-slate-900 dark:text-white">
                      Total Statutory Ordination Fees Settled
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-700 dark:text-amber-400 font-extrabold text-base">
                      ₦80,000.00
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                      Paid in Full ✓
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DEDICATED CEREMONY PASS & SEATING PAGE                             */}
      {/* ========================================================================= */}
      {currentTab === 'pass' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Digital Pass & Gate Directives */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-blue-500" />
                      <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-white">
                        Digital Ceremony Admission Pass
                      </h2>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Show this pass at Mount Zion Cathedral Gate 2 for candidate fast-track chancel entry.
                    </p>
                  </div>

                  <Button
                    variant="gold"
                    size="md"
                    onClick={() => setShowPassModal(true)}
                    icon={<QrCode className="w-4 h-4" />}
                    className="font-bold text-xs shadow-md"
                  >
                    Open Fullscreen Pass
                  </Button>
                </div>

                {/* Seating & Gate Info Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                      Chancel Pew Assignment
                    </span>
                    <div className="text-lg font-bold text-purple-950 dark:text-white">
                      Zone A &bull; Pew 14
                    </div>
                    <p className="text-xs text-purple-800/80 dark:text-purple-300/80">
                      Reserved candidate front section (Chancel East Wing).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                      Fast-Track Entry Gate
                    </span>
                    <div className="text-lg font-bold text-blue-950 dark:text-white">
                      Gate 2 &bull; East Portico
                    </div>
                    <p className="text-xs text-blue-800/80 dark:text-blue-300/80">
                      Candidate dedicated security portal with barcode scanner.
                    </p>
                  </div>
                </div>

                {/* Cathedral Location */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">Cathedral Headquarters Address:</span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Mount Zion Cathedral Headquarters, 11/13 Hughes Avenue, Alagomeji, Yaba, Lagos State.
                  </p>
                </div>

              </div>
            </div>

            {/* Right 1 Col: Ordination Day Itinerary */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    Ordination Day Itinerary
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400 shrink-0">07:30 AM</span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">Accreditation & Robing Check</span>
                      <span className="text-slate-500 text-[11px]">Chancel Vestry Gate 2</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-400 shrink-0">08:30 AM</span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">Processional Seating</span>
                      <span className="text-slate-500 text-[11px]">Zone A Pew 14 Entry</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-300 shrink-0">09:00 AM</span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">Consecration Service Begins</span>
                      <span className="text-slate-600 dark:text-slate-300 text-[11px]">Laying of Hands by Baba Aladura</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0">12:30 PM</span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">Gazette Photo & Certificate</span>
                      <span className="text-slate-500 text-[11px]">Cathedral East Portico</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DEDICATED SUPPORT & HELP DESK PAGE                                 */}
      {/* ========================================================================= */}
      {currentTab === 'support' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Live Message Thread with Priest */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-500" />
                      <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-white">
                        Parish Priest & Secretariat Help Desk
                      </h2>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Direct channel to {candidate.branchPriestName || 'your Parish Priest'} and the Synod Secretariat.
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    Active Channel
                  </span>
                </div>

                {/* Messages Thread Container */}
                <div className="h-64 sm:h-72 overflow-y-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                      <p>No messages in your thread. Type below to send a question to your priest.</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-2xl max-w-md ${
                          msg.senderRole === 'candidate'
                            ? 'ml-auto bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-sm'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-tl-none shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] opacity-75 mb-1">
                          <span className="font-bold">{msg.senderName}</span>
                          <span className="font-mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Send Form */}
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      placeholder="Type a message or inquiry for your branch priest..."
                      className="flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                    <Button
                      variant="primary"
                      size="md"
                      type="submit"
                      loading={isSendingMessage}
                      disabled={!newMessageText.trim()}
                      icon={<Send className="w-4 h-4" />}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 shrink-0"
                    >
                      Send
                    </Button>
                  </div>
                </form>

              </div>
            </div>

            {/* Right 1 Col: Frequently Asked Questions */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <HelpCircle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    Candidate FAQs
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">What time should I arrive?</span>
                    <p className="text-slate-500 text-[11px]">
                      Candidates must arrive at 07:30 AM sharp for vestry inspection and processional roll call.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">Can I bring family members?</span>
                    <p className="text-slate-500 text-[11px]">
                      Yes. Family seating is reserved in Zone C with overflow gallery access.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">Where do I collect my certificate?</span>
                    <p className="text-slate-500 text-[11px]">
                      Certificates are presented at the Chancel Altar immediately following the laying of hands.
                    </p>
                  </div>
                </div>
              </div>
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

      <CandidateLearnerTour
        isOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
      />

      <DemoAccountModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
      />

    </div>
  );
}
