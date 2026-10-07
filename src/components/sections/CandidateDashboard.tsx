'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CandidateProfile, InAppMessage, VettingTier } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/utils/formatters';
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
} from 'lucide-react';

interface CandidateDashboardProps {
  candidate: CandidateProfile;
  onUpdateCandidate?: (updated: CandidateProfile) => void;
}

type ActiveTab = 'overview' | 'schedule' | 'messages' | 'endorsements' | 'dossier';

export function CandidateDashboard({ candidate: initialCandidate, onUpdateCandidate }: CandidateDashboardProps) {
  const [candidate, setCandidate] = useState<CandidateProfile>(initialCandidate);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [showPassModal, setShowPassModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [copiedReg, setCopiedReg] = useState(false);

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

  useEffect(() => {
    setCandidate(initialCandidate);
    if (initialCandidate.passportPhotoUrl) {
      setPhotoPreview(initialCandidate.passportPhotoUrl);
    }
  }, [initialCandidate]);

  useEffect(() => {
    // Load in-app messages
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
  const balanceRemaining = Math.max(0, totalLevy - (candidate.duesAmountPaid || 0));

  const handleCopyReg = () => {
    navigator.clipboard.writeText(candidate.regNumber);
    setCopiedReg(true);
    setTimeout(() => setCopiedReg(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Photo Upload Handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 5MB)
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

  // Send Message Handler
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
    },
    {
      id: 'district',
      title: 'District Council',
      subtitle: 'Jurisdictional Vetting',
      isCompleted: candidate.tierApprovals?.district?.approved || currentTierIndex > 1 || isInvestitureReady,
      isCurrent: candidate.currentVettingTier === 'district' && !candidate.tierApprovals?.district?.approved,
      stamp: candidate.tierApprovals?.district,
    },
    {
      id: 'province',
      title: 'Provincial Diocese',
      subtitle: 'Credentials & Quota',
      isCompleted: candidate.tierApprovals?.province?.approved || currentTierIndex > 2 || isInvestitureReady,
      isCurrent: candidate.currentVettingTier === 'province' && !candidate.tierApprovals?.province?.approved,
      stamp: candidate.tierApprovals?.province,
    },
    {
      id: 'cmc',
      title: 'CMC Screening',
      subtitle: 'Theological Examination',
      isCompleted: candidate.tierApprovals?.cmc?.approved || currentTierIndex > 3 || isInvestitureReady,
      isCurrent: candidate.currentVettingTier === 'cmc' && !candidate.tierApprovals?.cmc?.approved,
      stamp: candidate.tierApprovals?.cmc,
    },
    {
      id: 'national',
      title: 'Holy Synod',
      subtitle: 'Investiture & Ratification',
      isCompleted: candidate.tierApprovals?.national?.approved || isInvestitureReady,
      isCurrent: candidate.currentVettingTier === 'national' && !isInvestitureReady,
      stamp: candidate.tierApprovals?.national,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Header Card with Passport Photo & Key Metadata */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Passport Photo Uploader & Display */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-800 border-2 border-amber-500/40 shadow-xl flex items-center justify-center relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={candidate.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <User className="w-10 h-10 text-slate-400" />
                    <span className="text-[10px] text-slate-400 mt-1">No Photo</span>
                  </div>
                )}

                {/* Hover overlay to change photo */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-amber-300 transition-all cursor-pointer"
                  title="Upload / Change Official Passport Photo"
                >
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {isUploadingPhoto ? 'Saving...' : 'Change Photo'}
                  </span>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-2.5 py-1 text-xs font-mono font-semibold bg-slate-800/90 text-amber-300 border border-slate-700/80 rounded-lg inline-flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition-colors"
                  onClick={handleCopyReg}
                  title="Click to copy registration ID"
                >
                  {candidate.regNumber}
                  <span className="text-[10px] text-slate-400">({copiedReg ? 'Copied!' : 'Copy'})</span>
                </span>

                <Badge
                  variant={isInvestitureReady ? 'success' : 'warning'}
                  size="sm"
                  className={
                    isInvestitureReady
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }
                >
                  {isInvestitureReady ? '✓ Approved for Investiture' : '⏳ Canonical Clearance in Progress'}
                </Badge>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {candidate.fullName}
                </h1>
                <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {candidate.parish}, {candidate.province}
                </p>
              </div>

              {/* Confirmed Rank Elevation Track */}
              <div className="inline-flex items-center gap-2 p-2 bg-slate-950/70 border border-slate-800/90 rounded-xl text-xs">
                <span className="text-slate-400">Current Rank:</span>
                <span className="font-semibold text-slate-200">{candidate.currentRank} ({candidate.currentRankYear})</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Target Elevation:</span>
                <span className="font-bold text-amber-300">{candidate.targetRankName}</span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isInvestitureReady && (
              <Button
                variant="gold"
                size="md"
                icon={<QrCode className="w-4 h-4" />}
                onClick={() => setShowPassModal(true)}
                className="shadow-lg shadow-amber-500/10 font-bold"
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
                className="bg-slate-800/60 border-slate-700 text-white hover:bg-slate-800"
              >
                QR Certificate
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
              className="bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              Print Clearance Slip
            </Button>
          </div>
        </div>
      </div>

      {/* 5-Tier Canonical Vetting Progress Stepper */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">5-Tier Canonical Approval Progression</h3>
            <p className="text-xs text-slate-400">Sequential clearance through ecclesiastical jurisdictions</p>
          </div>
          <span className="text-xs font-mono font-medium text-amber-400">
            Stage {Math.min(5, currentTierIndex + (candidate.tierApprovals?.[candidate.currentVettingTier]?.approved ? 1 : 1))} of 5
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {tierSteps.map((step, idx) => (
            <div
              key={step.id}
              className={`p-3 rounded-xl border transition-all ${
                step.isCompleted
                  ? 'bg-emerald-950/20 border-emerald-700/40 text-emerald-300'
                  : step.isCurrent
                  ? 'bg-amber-950/20 border-amber-500/50 text-amber-200 ring-1 ring-amber-500/20'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Step {idx + 1}</span>
                {step.isCompleted ? (
                  <span className="p-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                ) : step.isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>
              <p className="text-xs font-bold text-white">{step.title}</p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{step.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Overview & Directives
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'schedule'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Service Schedule & Venue
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'messages'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Messages & Support
          {messages.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full">
              {messages.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('endorsements')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'endorsements'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Endorsements Log
        </button>

        <button
          onClick={() => setActiveTab('dossier')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'dossier'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Canonical Dossier & Records
        </button>
      </div>

      {/* Tab 1: Overview & Directives */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seating & Investiture Instructions */}
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm pb-3 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Investiture Directives & Robing Details</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-[11px] block">Allocated Investiture Pew</span>
                <span className="text-sm font-bold text-white">{candidate.seatNumber || 'Zone A - Chancel Pew 14'}</span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-[11px] block">Presiding Robing Prelate</span>
                <span className="text-sm font-bold text-amber-300">{candidate.robingOfficer || 'Apostle General J. K. Coker'}</span>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-[11px] block">Official Conference Session</span>
                <span className="text-sm font-bold text-white">{candidate.investitureSession || 'Saturday Morning Session (09:00 AM)'}</span>
              </div>
            </div>
          </div>

          {/* Dues Clearance & Receipt */}
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Statutory Levies & Clearance</span>
              </div>
              <Badge
                variant={candidate.duesStatus === 'cleared' ? 'success' : 'warning'}
                size="sm"
                className={candidate.duesStatus === 'cleared' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'}
              >
                {candidate.duesStatus === 'cleared' ? '100% Cleared' : 'Payment Pending'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Total Statutory Dues</span>
                <span className="text-base font-bold text-white">{formatCurrency(totalLevy)}</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Amount Paid</span>
                <span className="text-base font-bold text-emerald-400">{formatCurrency(candidate.duesAmountPaid || 0)}</span>
              </div>
            </div>

            {candidate.receiptNumber && (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">Canonical Receipt:</span>
                <span className="font-mono font-bold text-amber-400">{candidate.receiptNumber}</span>
              </div>
            )}

            {/* 4-tier statutory split breakdown */}
            {candidate.levyBreakdown && (
              <div className="text-[11px] text-slate-400 space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span>Branch Parish Share:</span>
                  <span className="text-slate-200">{formatCurrency(candidate.levyBreakdown.branchLevy)}</span>
                </div>
                <div className="flex justify-between">
                  <span>District Council Share:</span>
                  <span className="text-slate-200">{formatCurrency(candidate.levyBreakdown.districtLevy)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Provincial Diocese Quota:</span>
                  <span className="text-slate-200">{formatCurrency(candidate.levyBreakdown.provincialLevy)}</span>
                </div>
                <div className="flex justify-between">
                  <span>National Ordination & Robing Fee:</span>
                  <span className="text-slate-200">{formatCurrency(candidate.levyBreakdown.nationalFee)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Theological Exam Scores (if available) */}
          {(candidate.theologyScore || candidate.interviewScore) && (
            <div className="md:col-span-2 bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span>CMC Theological Examination & Vetting Scores</span>
                </div>
                <Badge variant="success" size="sm" className="bg-purple-500/10 text-purple-300 border-purple-500/30">
                  Exam Passed (Distinction)
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Doctrinal Governance Exam</span>
                  <span className="text-lg font-bold text-white">{candidate.theologyScore || 92} / 100</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Oral Vetting Interview</span>
                  <span className="text-lg font-bold text-white">{candidate.interviewScore || 88} / 100</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Conduct & Attendance</span>
                  <span className="text-lg font-bold text-emerald-400">{candidate.attendanceRecordPercentage || 96}% (Exemplary)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Service Schedule & Venue */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {/* Main Service Banner Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-300 text-xs font-bold">
                <Calendar className="w-3.5 h-3.5" />
                <span>General Conference 2026 Solemn Investiture</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Official Ordination & Robing Service Schedule
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Service Date & Time</span>
                  <p className="text-base font-bold text-white">{candidate.ordinationDate || 'Saturday, November 14, 2026'}</p>
                  <p className="text-xs text-amber-400 font-semibold">{candidate.ordinationTime || '09:00 AM (West Africa Time)'}</p>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Investiture Cathedral Venue</span>
                  <p className="text-sm font-bold text-white leading-tight">
                    {candidate.ordinationVenue || 'Mount Zion Cathedral Worldwide Headquarters'}
                  </p>
                  <p className="text-xs text-slate-400">11/13 Hughes Avenue, Alagomeji, Yaba, Lagos</p>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Assigned Pew & Chancel Wing</span>
                  <p className="text-sm font-bold text-amber-300">{candidate.seatNumber || 'Zone A - Chancel Pew 14'}</p>
                  <p className="text-xs text-slate-400">Gate 2 • Main Apex Auditorium</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Dispatch Notice */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Official Email Dispatch Alert</span>
                <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded font-mono">
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

      {/* Tab 3: In-App Messaging & Secretariat Support */}
      {activeTab === 'messages' && (
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Canonical In-App Secretariat Desk</span>
              </h3>
              <p className="text-xs text-slate-400">Direct secure messaging channel with Branch Rector, CMC Screening Directorate & Holy Synod</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Topic:</span>
              <select
                value={messageCategory}
                onChange={(e) => setMessageCategory(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="general">General Inquiries</option>
                <option value="screening">Theological Screening & Exam</option>
                <option value="robing">Robing & Vestment Specs</option>
                <option value="secretariat">Central Secretariat Clearance</option>
              </select>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="space-y-4 max-h-[420px] overflow-y-auto p-2">
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
                      className={`p-3.5 rounded-2xl text-xs max-w-lg leading-relaxed shadow-sm ${
                        isMe
                          ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
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

          {/* Send Message Form */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-3 border-t border-slate-800">
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder={`Send message to Secretariat regarding ${messageCategory}...`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <Button
              type="submit"
              variant="gold"
              size="md"
              disabled={!newMessageText.trim() || isSendingMessage}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              {isSendingMessage ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </div>
      )}

      {/* Tab 4: Endorsements Log */}
      {activeTab === 'endorsements' && (
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Hierarchical Canonical Clearance Log</h3>
            <p className="text-xs text-slate-400">Formal endorsement stamps recorded from Branch through Holy Synod</p>
          </div>

          <div className="space-y-4">
            {tierSteps.map((step, idx) => (
              <div key={step.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${step.isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {step.isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{step.title} Endorsement</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {step.stamp?.approverName ? `Approved by ${step.stamp.approverName}` : 'Under Jurisdictional Review'}
                    </p>
                    {step.stamp?.comments && (
                      <p className="text-xs text-slate-300 italic mt-1 bg-slate-900/80 p-2 rounded border border-slate-800/80">
                        &quot;{step.stamp.comments}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-slate-400 block">{step.stamp?.date || 'Pending'}</span>
                  <Badge variant={step.isCompleted ? 'success' : 'warning'} size="sm" className="mt-1">
                    {step.isCompleted ? 'Cleared' : 'Pending'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Dossier & Verified Documents */}
      {activeTab === 'dossier' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">Ecclesiastical Dossier</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Full Name:</span>
                <span className="font-semibold text-white">{candidate.fullName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Canonical Email:</span>
                <span className="font-semibold text-white">{candidate.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Telephone:</span>
                <span className="font-semibold text-white">{candidate.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Baptism Date:</span>
                <span className="font-semibold text-white">{formatDate(candidate.baptismDate)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Tenure in Current Rank:</span>
                <span className="font-semibold text-emerald-400">{candidate.tenureYears || 4} Years (Eligible)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">Prerequisite Credentials Locker</h3>
            <div className="space-y-2.5">
              {[
                { title: 'Original Baptismal Certificate', desc: `Issued ${candidate.baptismDate}` },
                { title: 'Prior Ordination Scroll', desc: `Rank: ${candidate.currentRank} (${candidate.currentRankYear})` },
                { title: 'Holy Matrimony / Standing Attestation', desc: 'Certified Church Standing' },
                { title: 'Branch Rector Recommendation Letter', desc: `Attested by ${candidate.branchPriestName || 'Branch Priest'}` },
              ].map((doc, idx) => (
                <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-200">{doc.title}</p>
                    <p className="text-[11px] text-slate-400">{doc.desc}</p>
                  </div>
                  <Badge variant="success" size="sm" className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                    Verified ✓
                  </Badge>
                </div>
              ))}
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
    </div>
  );
}
