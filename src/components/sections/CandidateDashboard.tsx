'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CandidateProfile, InAppMessage, VettingTier } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { getRobingSpecifications } from '@/utils/ranks';
import { DigitalPassModal } from '@/components/shared/DigitalPassModal';
import { CertificateModal } from '@/components/shared/CertificateModal';
import { api } from '@/services/api';
import {
  Shield,
  Award,
  CheckCircle2,
  Clock,
  QrCode,
  CreditCard,
  Calendar,
  Layers,
  Printer,
  ChevronRight,
  FileCheck,
  Building,
  User,
  Sparkles,
  MapPin,
  Check,
  AlertCircle,
  BookOpen,
  Camera,
  Upload,
  MessageSquare,
  Send,
  Bell,
  Mail,
  HelpCircle,
  ExternalLink,
  Copy,
  Info,
  Compass,
  CheckCheck,
  Shirt,
  Download,
  Scroll,
  Receipt,
  FileText,
  BadgeCheck,
} from 'lucide-react';

interface CandidateDashboardProps {
  candidate: CandidateProfile;
  onUpdateCandidate?: (updated: CandidateProfile) => void;
}

type ActiveTab = 'overview' | 'financials' | 'schedule' | 'robing' | 'messages' | 'endorsements' | 'dossier';

export function CandidateDashboard({ candidate: initialCandidate, onUpdateCandidate }: CandidateDashboardProps) {
  const [candidate, setCandidate] = useState<CandidateProfile>(initialCandidate);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [showPassModal, setShowPassModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [copiedReg, setCopiedReg] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [copiedVenue, setCopiedVenue] = useState(false);

  // Photo upload state
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(candidate.passportPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // In-app messaging state
  const [messages, setMessages] = useState<InAppMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [messageCategory, setMessageCategory] = useState<'general' | 'screening' | 'robing' | 'secretariat'>('general');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 38, hours: 14, minutes: 22, seconds: 45 });

  useEffect(() => {
    const targetDate = new Date('2026-11-14T09:00:00+01:00').getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  useEffect(() => {
    if (activeTab === 'messages') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const isInvestitureReady = ['board_approved', 'investiture_assigned', 'ordained'].includes(candidate.stage);
  const isOrdained = candidate.stage === 'ordained';

  const totalLevy = candidate.levyBreakdown?.total || 80000;
  const duesPaid = candidate.duesAmountPaid || totalLevy;
  const balanceRemaining = Math.max(0, totalLevy - duesPaid);
  const paymentPercentage = Math.min(100, Math.round((duesPaid / totalLevy) * 100));

  const robingSpecs = getRobingSpecifications(candidate.targetRankId);

  const handleCopyReg = () => {
    navigator.clipboard.writeText(candidate.regNumber);
    setCopiedReg(true);
    setTimeout(() => setCopiedReg(false), 2000);
  };

  const handleCopyReceipt = () => {
    if (candidate.receiptNumber) {
      navigator.clipboard.writeText(candidate.receiptNumber);
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 2000);
    }
  };

  const handleCopyVenue = () => {
    const venueText = `${candidate.ordinationVenue || 'Mount Zion Cathedral Worldwide Headquarters'}, 11/13 Hughes Avenue, Alagomeji, Yaba, Lagos`;
    navigator.clipboard.writeText(venueText);
    setCopiedVenue(true);
    setTimeout(() => setCopiedVenue(false), 2000);
  };

  const handlePrint = () => {
    window.print();
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

  const sendQuickPrompt = (prompt: string, category: 'general' | 'screening' | 'robing' | 'secretariat') => {
    setNewMessageText(prompt);
    setMessageCategory(category);
    setActiveTab('messages');
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
        category: messageCategory,
      });

      setMessages((prev) => [...prev, sent]);
      setNewMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // 5-Tier Jurisdictional Steps
  const tierOrder: VettingTier[] = ['branch', 'district', 'province', 'cmc', 'national'];
  const currentTierIndex = tierOrder.indexOf(candidate.currentVettingTier);

  const tierSteps = [
    {
      id: 'branch',
      title: 'Branch Parish',
      subtitle: 'Parish Rector Endorsement',
      isCompleted: candidate.tierApprovals?.branch?.approved || currentTierIndex > 0 || isInvestitureReady,
      isCurrent: candidate.currentVettingTier === 'branch' && !candidate.tierApprovals?.branch?.approved,
      stamp: candidate.tierApprovals?.branch,
      jurisdiction: candidate.parish,
    },
    {
      id: 'district',
      title: 'District Council',
      subtitle: 'District Superintendent Vetting',
      isCompleted: candidate.tierApprovals?.district?.approved || currentTierIndex > 1 || isInvestitureReady,
      isCurrent: candidate.currentVettingTier === 'district' && !candidate.tierApprovals?.district?.approved,
      stamp: candidate.tierApprovals?.district,
      jurisdiction: candidate.district || 'Surulere District',
    },
    {
      id: 'province',
      title: 'Provincial Diocese',
      subtitle: 'Diocesan Quota & Credentials',
      isCompleted: candidate.tierApprovals?.province?.approved || currentTierIndex > 2 || isInvestitureReady,
      isCurrent: candidate.currentVettingTier === 'province' && !candidate.tierApprovals?.province?.approved,
      stamp: candidate.tierApprovals?.province,
      jurisdiction: candidate.province,
    },
    {
      id: 'cmc',
      title: 'CMC Screening',
      subtitle: 'Theological & Liturgical Board',
      isCompleted: candidate.tierApprovals?.cmc?.approved || currentTierIndex > 3 || isInvestitureReady,
      isCurrent: candidate.currentVettingTier === 'cmc' && !candidate.tierApprovals?.cmc?.approved,
      stamp: candidate.tierApprovals?.cmc,
      jurisdiction: 'Church Management Committee',
    },
    {
      id: 'national',
      title: 'Holy Synod Ratification',
      subtitle: 'Supreme Apex Consecration',
      isCompleted: candidate.tierApprovals?.national?.approved || isInvestitureReady,
      isCurrent: candidate.currentVettingTier === 'national' && !isInvestitureReady,
      stamp: candidate.tierApprovals?.national,
      jurisdiction: 'Holy Order Supreme Synod',
    },
  ];

  // Statutory Financial Breakdown Items
  const statutorySplit = [
    {
      authority: 'Branch Parish Share',
      purpose: 'Parish Liturgical Assessment & Welfare',
      amount: candidate.levyBreakdown?.branchLevy || 15000,
      cleared: true,
    },
    {
      authority: 'District Council Share',
      purpose: 'District Jurisdictional Administration',
      amount: candidate.levyBreakdown?.districtLevy || 15000,
      cleared: true,
    },
    {
      authority: 'Provincial Diocese Quota',
      purpose: 'Diocesan Examination & Secretariat Vetting',
      amount: candidate.levyBreakdown?.provincialLevy || 20000,
      cleared: true,
    },
    {
      authority: 'Holy Synod Apex Levies',
      purpose: 'Apex Consecration, Sacred Scroll & Robing Seal',
      amount: candidate.levyBreakdown?.nationalFee || 30000,
      cleared: true,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Canonical Elevation Master Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-church-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Avatar & Personal Metadata */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto">
            {/* Passport Photo */}
            <div className="relative group shrink-0 mx-auto sm:mx-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-800/90 border-2 border-amber-500/40 shadow-xl flex items-center justify-center relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={candidate.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <User className="w-10 h-10 text-slate-400" />
                    <span className="text-[10px] text-slate-400 mt-1">Upload Photo</span>
                  </div>
                )}

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-amber-300 transition-all cursor-pointer p-1 text-center"
                  title="Upload / Change Official Passport Photo"
                >
                  <Camera className="w-5 h-5 mb-1" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    {isUploadingPhoto ? 'Uploading...' : 'Update Photo'}
                  </span>
                </div>
              </div>

              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1 rounded-full border-2 border-slate-900 shadow-md">
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

            {/* Candidate Info */}
            <div className="space-y-2 flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  onClick={handleCopyReg}
                  className="px-2.5 py-1 text-xs font-mono font-semibold bg-slate-800/90 text-amber-300 border border-slate-700/80 rounded-lg inline-flex items-center gap-1.5 hover:bg-slate-700 transition-all shadow-sm"
                  title="Click to copy official registration number"
                >
                  <Copy className="w-3 h-3 text-amber-400" />
                  <span>{candidate.regNumber}</span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    ({copiedReg ? 'Copied!' : 'Copy'})
                  </span>
                </button>

                <Badge
                  variant={isInvestitureReady ? 'success' : 'warning'}
                  size="sm"
                  className={
                    isInvestitureReady
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }
                >
                  {isInvestitureReady ? '✓ Duly Approved for Investiture' : '⏳ Canonical Clearance in Progress'}
                </Badge>

                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-church-500/20 text-church-300 border border-church-500/30">
                  {candidate.gender === 'male' ? 'Brethren Order' : 'Sisters Order'}
                </span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight break-words">
                  {candidate.fullName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {candidate.houseOfPrayer && (
                    <>
                      <span className="text-amber-200/90 font-medium">{candidate.houseOfPrayer}</span>
                      <span className="text-slate-600">•</span>
                    </>
                  )}
                  <span>{candidate.parish}</span>
                  {candidate.district && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{candidate.district}</span>
                    </>
                  )}
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 font-medium">{candidate.province}</span>
                </p>
              </div>

              {/* Rank Progression Step Indicator */}
              <div className="inline-flex flex-wrap items-center gap-2 p-2 bg-slate-950/70 border border-slate-800/90 rounded-xl text-xs w-full sm:w-auto">
                <span className="text-slate-400">Current:</span>
                <span className="font-semibold text-slate-200">{candidate.currentRank} ({candidate.currentRankYear})</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Elevation:</span>
                <span className="font-bold text-amber-300">{candidate.targetRankName}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {candidate.tenureYears || 4} Yrs Served ✓
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
            {isInvestitureReady && (
              <Button
                variant="gold"
                size="md"
                icon={<QrCode className="w-4 h-4" />}
                onClick={() => setShowPassModal(true)}
                className="w-full sm:w-auto shadow-lg shadow-amber-500/10 font-bold justify-center"
              >
                Admission Pass
              </Button>
            )}

            {(isOrdained || isInvestitureReady) && (
              <Button
                variant="outline"
                size="md"
                icon={<Award className="w-4 h-4" />}
                onClick={() => setShowCertModal(true)}
                className="w-full sm:w-auto bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700 justify-center"
              >
                Certificate
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
              className="w-full sm:w-auto bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 justify-center"
            >
              Clearance Slip
            </Button>
          </div>
        </div>
      </div>

      {/* Live Consecration Countdown & Service Directive Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Countdown Card */}
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Solemn Investiture Countdown
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>

          <div className="grid grid-cols-4 gap-2 my-4 text-center">
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-white block">{timeLeft.days}</span>
              <span className="text-[10px] text-slate-400 uppercase">Days</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-white block">{timeLeft.hours}</span>
              <span className="text-[10px] text-slate-400 uppercase">Hours</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-white block">{timeLeft.minutes}</span>
              <span className="text-[10px] text-slate-400 uppercase">Mins</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400 block">{timeLeft.seconds}</span>
              <span className="text-[10px] text-slate-400 uppercase">Secs</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Saturday, November 14, 2026 • 09:00 AM WAT
          </p>
        </div>

        {/* Cathedral Venue Details */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Cathedral Venue
              </span>
              <button
                onClick={handleCopyVenue}
                className="text-[11px] text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
                title="Copy Cathedral Address"
              >
                <Copy className="w-3 h-3" />
                {copiedVenue ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="space-y-1.5 mt-3">
              <p className="text-sm font-bold text-white">
                {candidate.ordinationVenue || 'Mount Zion Cathedral Worldwide Headquarters'}
              </p>
              <p className="text-xs text-slate-400">
                11/13 Hughes Avenue, Alagomeji, Yaba, Lagos, Nigeria
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Gate Access:</span>
            <span className="font-semibold text-amber-300">Gate 2 • East Portico</span>
          </div>
        </div>

        {/* Pew & Robing Prelate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-purple-400" />
                Chancel & Prelate
              </span>
              <Badge variant="purple" size="sm" className="bg-purple-500/10 text-purple-300 border-purple-500/20">
                Confirmed
              </Badge>
            </div>

            <div className="space-y-2 mt-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Pew:</span>
                <span className="font-bold text-white">{candidate.seatNumber || 'Zone A - Chancel Pew 14'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Presiding Prelate:</span>
                <span className="font-bold text-amber-300">{candidate.robingOfficer || 'Apostle General J. K. Coker'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Robing Session:</span>
                <span className="text-slate-200">{candidate.investitureSession || 'Morning Investiture'}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Roll Call:</span>
            <span className="text-amber-300 font-semibold">07:30 AM Sharp</span>
          </div>
        </div>
      </div>

      {/* 5-Tier Canonical Vetting Progress Stepper (Responsive) */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              5-Tier Canonical Approval Progression
            </h3>
            <p className="text-xs text-slate-400">
              Sequential ecclesiastical clearance through Branch, District, Province, CMC & Holy Synod
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              Level {Math.min(5, currentTierIndex + (candidate.tierApprovals?.[candidate.currentVettingTier]?.approved ? 1 : 1))} of 5 Cleared
            </span>
          </div>
        </div>

        {/* Stepper Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {tierSteps.map((step, idx) => (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                step.isCompleted
                  ? 'bg-emerald-950/20 border-emerald-700/40 text-emerald-300'
                  : step.isCurrent
                  ? 'bg-amber-950/20 border-amber-500/50 text-amber-200 ring-1 ring-amber-500/20'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Tier 0{idx + 1}</span>
                  {step.isCompleted ? (
                    <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  ) : step.isCurrent ? (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
                <p className="text-xs font-bold text-white leading-tight">{step.title}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{step.subtitle}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                <span>{step.isCompleted ? 'Approved' : step.isCurrent ? 'Under Review' : 'Pending'}</span>
                {step.stamp?.date && (
                  <span className="font-mono text-slate-400">{step.stamp.date}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs (Fully Responsive with smooth horizontal scroll) */}
      <div className="border-b border-slate-800/80 -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 bg-slate-900/50 border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Overview & Status
          </button>

          <button
            onClick={() => setActiveTab('financials')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'financials'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 bg-slate-900/50 border border-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Canonical Levies & Receipt
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'schedule'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 bg-slate-900/50 border border-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Service Timetable
          </button>

          <button
            onClick={() => setActiveTab('robing')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'robing'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 bg-slate-900/50 border border-slate-800'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            Liturgical Vestments
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'messages'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 bg-slate-900/50 border border-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Secretariat Messages
            {messages.length > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${activeTab === 'messages' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'}`}>
                {messages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('endorsements')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'endorsements'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 bg-slate-900/50 border border-slate-800'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            Endorsements Log
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'dossier'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 bg-slate-900/50 border border-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Dossier & Credentials
          </button>
        </div>
      </div>

      {/* Tab 1: Clean Overview & Status */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consecration Admission Summary Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
                <BadgeCheck className="w-5 h-5 text-emerald-400" />
                <span>Investiture Readiness Status</span>
              </div>
              <Badge variant="success" size="sm" className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                Accreditation Approved
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs block">Elevation Order</span>
                  <span className="font-bold text-amber-300 text-base">{candidate.targetRankName}</span>
                </div>
                <span className="text-xs text-slate-400">Tenure: {candidate.tenureYears || 4} Yrs</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 text-[11px] block">Pew Allocation</span>
                  <span className="font-bold text-white">{candidate.seatNumber || 'Zone A - Pew 14'}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 text-[11px] block">Robing Prelate</span>
                  <span className="font-bold text-amber-300 truncate block">{candidate.robingOfficer || 'Apostle Gen. Coker'}</span>
                </div>
              </div>

              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-white">Cathedral Consecration Directives:</p>
                  <p className="leading-relaxed text-slate-300">
                    Arrive at <strong>07:30 AM</strong> via <strong>Gate 2 (East Portico)</strong>. Present your Digital Admission Pass QR code at the optical accreditation desk for entrance marshaling.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="gold"
                  size="md"
                  icon={<QrCode className="w-4 h-4" />}
                  onClick={() => setShowPassModal(true)}
                  className="w-full justify-center font-bold"
                >
                  View Digital Admission Pass (QR)
                </Button>
              </div>
            </div>
          </div>

          {/* Treasury Snapshot & Quick Clearance */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>Canonical Treasury Clearance</span>
                </div>
                <Badge variant="success" size="sm" className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                  {paymentPercentage}% Settled
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 my-3 text-xs sm:text-sm">
                <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 text-xs block">Total Levies</span>
                  <span className="text-lg font-bold text-white">{formatCurrency(totalLevy)}</span>
                </div>
                <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 text-xs block">Amount Cleared</span>
                  <span className="text-lg font-bold text-emerald-400">{formatCurrency(duesPaid)}</span>
                </div>
              </div>

              {candidate.receiptNumber && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-400">Canonical Receipt:</span>
                  <span className="font-mono font-bold text-amber-400">{candidate.receiptNumber}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setActiveTab('financials')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-amber-300 font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Receipt className="w-4 h-4" />
                View Itemized 4-Tier Canonical Ledger
              </button>
            </div>
          </div>

          {/* Theological Exam Scores (Linear Responsive Meters) */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>CMC Theological Examination & Liturgical Scores</span>
              </div>
              <Badge variant="purple" size="sm" className="bg-purple-500/15 text-purple-300 border-purple-500/30">
                Passed with Distinction
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Doctrinal Governance</span>
                  <span className="font-bold text-white">{candidate.theologyScore || 92}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full" style={{ width: `${candidate.theologyScore || 92}%` }} />
                </div>
                <p className="text-[11px] text-slate-400">Weighted: 55% • Distinction</p>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Oral Vetting & Liturgy</span>
                  <span className="font-bold text-white">{candidate.interviewScore || 88}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full" style={{ width: `${candidate.interviewScore || 88}%` }} />
                </div>
                <p className="text-[11px] text-slate-400">Weighted: 45% • Cleared</p>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Attendance & Conduct</span>
                  <span className="font-bold text-emerald-400">{candidate.attendanceRecordPercentage || 96}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${candidate.attendanceRecordPercentage || 96}%` }} />
                </div>
                <p className="text-[11px] text-slate-400">Spotless Parish Attestation</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Financial Ledger & Official Receipt */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          {/* Main Financial Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>Canonical Financial Clearance Ledger</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Statutory 4-tier ecclesiastical levies required for the order of <strong>{candidate.targetRankName}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {candidate.receiptNumber && (
                  <button
                    onClick={handleCopyReceipt}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono font-bold text-amber-300 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                    title="Copy Official Canonical Receipt"
                  >
                    <Receipt className="w-3.5 h-3.5 text-amber-400" />
                    <span>{candidate.receiptNumber}</span>
                    <span className="text-[10px] text-slate-400 font-sans">({copiedReceipt ? 'Copied!' : 'Copy'})</span>
                  </button>
                )}
                <Badge variant="success" size="sm" className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                  100% Cleared
                </Badge>
              </div>
            </div>

            {/* Financial Overview Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 block uppercase font-medium tracking-wider">Total Statutory Levies</span>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalLevy)}</p>
                <p className="text-[11px] text-slate-400">4-Tier Combined Assessment</p>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 block uppercase font-medium tracking-wider">Total Amount Cleared</span>
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(duesPaid)}</p>
                <p className="text-[11px] text-emerald-400 font-medium">Verified by Central Secretariat</p>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 block uppercase font-medium tracking-wider">Outstanding Balance</span>
                <p className="text-2xl font-bold text-slate-300">{formatCurrency(balanceRemaining)}</p>
                <p className="text-[11px] text-slate-400">Zero Outstanding Balance</p>
              </div>
            </div>

            {/* Itemized 4-Tier Statutory Ledger (Responsive Table/List) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Itemized Statutory Allocation Schedule:
              </h4>

              <div className="space-y-2.5">
                {statutorySplit.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-amber-300 shrink-0 mt-0.5 sm:mt-0">
                        0{idx + 1}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white">{item.authority}</p>
                        <p className="text-xs text-slate-400">{item.purpose}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                      <span className="text-sm sm:text-base font-mono font-bold text-white">{formatCurrency(item.amount)}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                        <Check className="w-3 h-3" /> Cleared
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Print Clearance Action */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Statutory Treasury Compliance Rule: Act 4, Section 12 ratified</span>
              </div>
              <Button
                variant="outline"
                size="md"
                icon={<Printer className="w-4 h-4" />}
                onClick={handlePrint}
                className="w-full sm:w-auto bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
              >
                Print Official Financial Clearance
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Service Schedule & Venue */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-300 text-xs font-bold">
                <Calendar className="w-3.5 h-3.5" />
                <span>General Conference 2026 Solemn Investiture</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Official Ordination & Consecration Service Schedule
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                By order of the Holy Synod of the Eternal Sacred Order of the Cherubim and Seraphim Worldwide, all qualified ordinands are hereby invited to the annual solemn consecration and investiture services.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Stage 01 • Spiritual Prep</span>
                  <h4 className="text-sm font-bold text-white">Pre-Ordination Fasting & Sanctification</h4>
                  <p className="text-xs text-slate-400">Nov 10 – 12, 2026</p>
                  <p className="text-[11px] text-slate-500">3-Day corporate prayers across all Diocesan cathedrals.</p>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Stage 02 • Physical Review</span>
                  <h4 className="text-sm font-bold text-white">Vestment & Robing Inspection</h4>
                  <p className="text-xs text-slate-400">Friday, Nov 13, 2026 • 4:00 PM</p>
                  <p className="text-[11px] text-slate-500">Physical verification of liturgical cassock, stole & cap.</p>
                </div>

                <div className="p-4 bg-amber-950/20 border border-amber-500/40 rounded-2xl space-y-1.5 ring-1 ring-amber-500/20">
                  <span className="text-[10px] font-mono font-bold text-amber-300 uppercase">Stage 03 • Consecration Day</span>
                  <h4 className="text-sm font-bold text-white">Holy Investiture Service</h4>
                  <p className="text-xs text-amber-300 font-bold">Saturday, Nov 14, 2026 • 09:00 AM</p>
                  <p className="text-[11px] text-slate-300">Supreme laying of hands & official scroll presentation.</p>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Stage 04 • Celebration</span>
                  <h4 className="text-sm font-bold text-white">Thanksgiving & Holy Communion</h4>
                  <p className="text-xs text-slate-400">Sunday, Nov 15, 2026 • 10:00 AM</p>
                  <p className="text-[11px] text-slate-500">Worldwide General Conference Thanksgiving Service.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-md">
            <div className="p-3.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm sm:text-base font-bold text-white flex flex-wrap items-center gap-2">
                <span>Official Email Dispatch Alert</span>
                <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded font-mono font-bold">
                  {candidate.emailDispatchDate || 'Friday, November 6, 2026'}
                </span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your official printable PDF Admission Pass, Liturgical Robing Color Chart, and Cathedral Access Barcode will be automatically dispatched to <strong className="text-white font-mono">{candidate.email}</strong> on {candidate.emailDispatchDate || 'Friday, November 6, 2026'}. Please verify your inbox and check spam/promotions folders.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Robing & Vestments Guide */}
      {activeTab === 'robing' && (
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Shirt className="w-5 h-5 text-amber-400" />
                <span>Canonical Robing & Vestment Specifications</span>
              </h3>
              <p className="text-xs text-slate-400">
                Official statutory vestment requirements for <strong>{candidate.targetRankName}</strong>
              </p>
            </div>
            <Badge variant="gold" size="sm">
              Constitutionally Mandated
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Sacred Robe / Cassock</span>
              <p className="text-sm font-semibold text-white">{robingSpecs.vestmentColor}</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Must be tailored according to canonical length, reaching the ankles with tailored liturgical cuffs.
              </p>
            </div>

            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Liturgical Stole & Band</span>
              <p className="text-sm font-semibold text-white">{robingSpecs.stoleType}</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Worn across both shoulders for apostolic orders or diagonal for ministerial orders.
              </p>
            </div>

            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Headwear / Mitre / Cap</span>
              <p className="text-sm font-semibold text-white">{robingSpecs.capOrCrown}</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sanctified liturgical headgear bearing the holy cross of Zion.
              </p>
            </div>

            <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Insignia & Holy Staff</span>
              <p className="text-sm font-semibold text-white">{robingSpecs.insigniaNotes}</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Official liturgical regalia presented during the sacred ordination ceremony.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: In-App Secretariat Desk */}
      {activeTab === 'messages' && (
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Canonical In-App Secretariat Desk</span>
              </h3>
              <p className="text-xs text-slate-400">
                Direct encrypted channel with Branch Rector, CMC Screening Directorate & Holy Synod Secretariat
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Channel:</span>
              <select
                value={messageCategory}
                onChange={(e) => setMessageCategory(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="general">General Inquiries</option>
                <option value="screening">Theological Screening & Exam</option>
                <option value="robing">Robing & Vestment Specs</option>
                <option value="secretariat">Central Secretariat Clearance</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Suggested Quick Inquiries:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => sendQuickPrompt('When is the physical vestment inspection scheduled for my province?', 'robing')}
                className="px-2.5 py-1 text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors text-left"
              >
                🪡 Vestment inspection timing?
              </button>
              <button
                onClick={() => sendQuickPrompt('How do I confirm my allocated pew seating in Zone A?', 'general')}
                className="px-2.5 py-1 text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors text-left"
              >
                🪑 Seating & Pew confirmation
              </button>
              <button
                onClick={() => sendQuickPrompt('Request assistance regarding my CMC theological exam score certificate.', 'screening')}
                className="px-2.5 py-1 text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors text-left"
              >
                📖 Theological certificate copy
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[440px] overflow-y-auto p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                No messages in this channel yet. Type below to ask a question to the Secretariat.
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderRole === 'candidate';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                      <span className="font-semibold text-slate-300">{msg.senderName}</span>
                      <span className="text-slate-500">•</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm max-w-lg leading-relaxed shadow-sm ${
                        isMe
                          ? 'bg-amber-500 text-slate-950 font-semibold rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder={`Send message to Secretariat regarding ${messageCategory}...`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <Button
              type="submit"
              variant="gold"
              size="md"
              disabled={!newMessageText.trim() || isSendingMessage}
              icon={<Send className="w-4 h-4" />}
              className="py-3"
            >
              {isSendingMessage ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </div>
      )}

      {/* Tab 6: Endorsements Log */}
      {activeTab === 'endorsements' && (
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Scroll className="w-4 h-4 text-amber-400" />
              Hierarchical Canonical Clearance Log
            </h3>
            <p className="text-xs text-slate-400">
              Formal endorsement stamps recorded sequentially from Branch through Holy Synod
            </p>
          </div>

          <div className="space-y-3">
            {tierSteps.map((step, idx) => (
              <div
                key={step.id}
                className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      step.isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {step.isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : `0${idx + 1}`}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{step.title} Endorsement</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {step.stamp?.approverName ? `Approved by ${step.stamp.approverName}` : 'Under Jurisdictional Review'}
                    </p>
                    {step.stamp?.comments && (
                      <p className="text-xs text-slate-300 italic mt-1.5 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                        &quot;{step.stamp.comments}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xs font-mono text-slate-400 block">{step.stamp?.date || 'Pending'}</span>
                  <Badge variant={step.isCompleted ? 'success' : 'warning'} size="sm" className="mt-1">
                    {step.isCompleted ? '✓ Cleared' : '⏳ Pending'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Dossier & Verified Documents */}
      {activeTab === 'dossier' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              Ecclesiastical Registry Dossier
            </h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Full Canonical Name:</span>
                <span className="font-semibold text-white">{candidate.fullName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Canonical Email:</span>
                <span className="font-semibold text-white">{candidate.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Telephone Number:</span>
                <span className="font-semibold text-white">{candidate.phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Church Baptism Date:</span>
                <span className="font-semibold text-white">{formatDate(candidate.baptismDate)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Marital Status:</span>
                <span className="font-semibold text-white capitalize">{candidate.maritalStatus || 'Married'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Current Rank Tenure:</span>
                <span className="font-semibold text-emerald-400">{candidate.tenureYears || 4} Years (Statutory Minimum Satisfied)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Mandatory Canonical Credentials Locker
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Original Baptismal Certificate', desc: `Issued ${candidate.baptismDate}` },
                { title: 'Prior Ordination Scroll', desc: `Rank: ${candidate.currentRank} (${candidate.currentRankYear})` },
                { title: 'Holy Matrimony / Standing Attestation', desc: 'Certified Church Standing' },
                { title: 'Branch Rector Clean Standing Letter', desc: `Attested by ${candidate.branchPriestName || 'Branch Priest'}` },
              ].map((doc, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <p className="font-bold text-slate-200">{doc.title}</p>
                    <p className="text-xs text-slate-400">{doc.desc}</p>
                  </div>
                  <Badge variant="success" size="sm" className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shrink-0">
                    Verified ✓
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
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
    </div>
  );
}
