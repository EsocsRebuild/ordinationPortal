'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CandidateProfile, InAppMessage, VettingTier } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { getRobingSpecifications } from '@/utils/ranks';
import { DigitalPassModal } from '@/components/shared/DigitalPassModal';
import { CertificateModal } from '@/components/shared/CertificateModal';
import { Tooltip } from '@/components/ui/Tooltip';
import { api } from '@/services/api';
import {
  Shield,
  Award,
  CheckCircle2,
  Clock,
  QrCode,
  Calendar,
  Layers,
  Printer,
  ChevronRight,
  User,
  MapPin,
  Check,
  AlertCircle,
  Camera,
  Copy,
  Receipt,
  FileText,
  BadgeCheck,
  Send,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface CandidateDashboardProps {
  candidate: CandidateProfile;
  onUpdateCandidate?: (updated: CandidateProfile) => void;
}

type ActiveTab = 'vetting' | 'robing' | 'financials' | 'messages';

export function CandidateDashboard({ candidate: initialCandidate, onUpdateCandidate }: CandidateDashboardProps) {
  const [candidate, setCandidate] = useState<CandidateProfile>(initialCandidate);
  const [activeTab, setActiveTab] = useState<ActiveTab>('vetting');
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
  const totalLevy = candidate.levyBreakdown?.total || 80000;
  const robingSpecs = getRobingSpecifications(candidate.targetRankId);

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

  // 5-Tier Jurisdictional Steps
  const tierOrder: VettingTier[] = ['branch', 'district', 'province', 'cmc', 'national'];
  const currentTierIndex = tierOrder.indexOf(candidate.currentVettingTier);

  const tierSteps = [
    {
      id: 'branch',
      title: 'Branch Parish',
      authority: 'Parish Rector',
      isCompleted: candidate.tierApprovals?.branch?.approved || currentTierIndex > 0 || isInvestitureReady,
      jurisdiction: candidate.parish,
    },
    {
      id: 'district',
      title: 'District Council',
      authority: 'Superintendent',
      isCompleted: candidate.tierApprovals?.district?.approved || currentTierIndex > 1 || isInvestitureReady,
      jurisdiction: candidate.district || 'Surulere District',
    },
    {
      id: 'province',
      title: 'Provincial Diocese',
      authority: 'Diocesan Secretary',
      isCompleted: candidate.tierApprovals?.province?.approved || currentTierIndex > 2 || isInvestitureReady,
      jurisdiction: candidate.province,
    },
    {
      id: 'cmc',
      title: 'CMC Screening',
      authority: 'Theological Board',
      isCompleted: candidate.tierApprovals?.cmc?.approved || currentTierIndex > 3 || isInvestitureReady,
      jurisdiction: 'Church Management Committee',
    },
    {
      id: 'national',
      title: 'Holy Synod Ratification',
      authority: 'Supreme Council',
      isCompleted: candidate.tierApprovals?.national?.approved || isInvestitureReady,
      jurisdiction: 'Holy Order Supreme Synod',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* ========================================================================= */}
      {/* 1. MAIN CANDIDATE PROFILE & ACTIONS CARD                                  */}
      {/* ========================================================================= */}
      <div className="bg-[#0b1021] border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Avatar & Personal Data */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 w-full lg:w-auto">
            
            {/* Passport Photo */}
            <div className="relative group shrink-0 mx-auto sm:mx-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-800 border-2 border-amber-500/40 shadow-md flex items-center justify-center relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={candidate.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <User className="w-8 h-8 text-slate-400" />
                    <span className="text-[9px] text-slate-400 mt-0.5">Photo</span>
                  </div>
                )}

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-amber-300 transition-all cursor-pointer p-1 text-center"
                  title="Upload / Change Official Passport Photo"
                >
                  <Camera className="w-4 h-4 mb-0.5" />
                  <span className="text-[9px] font-bold uppercase">
                    {isUploadingPhoto ? 'Uploading...' : 'Update'}
                  </span>
                </div>
              </div>

              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-0.5 rounded-full border-2 border-slate-900 shadow">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>

            {/* Candidate Identifiers */}
            <div className="space-y-1.5 flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Tooltip content="Official Canonical Reference ID">
                  <button
                    onClick={handleCopyReg}
                    className="px-2.5 py-0.5 text-xs font-mono font-semibold bg-slate-900 text-amber-300 border border-slate-700 rounded-lg inline-flex items-center gap-1.5 hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <Copy className="w-3 h-3 text-amber-400" />
                    <span>{candidate.regNumber}</span>
                    <span className="text-[10px] text-slate-400">
                      ({copiedReg ? 'Copied!' : 'Copy'})
                    </span>
                  </button>
                </Tooltip>

                <Badge
                  variant={isInvestitureReady ? 'success' : 'warning'}
                  size="sm"
                  className={
                    isInvestitureReady
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }
                >
                  {isInvestitureReady ? '✓ Duly Approved for Investiture' : '⏳ Clearance in Progress'}
                </Badge>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {candidate.fullName}
              </h1>

              <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{candidate.parish}</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-slate-300 font-medium">{candidate.province}</span>
              </p>

              {/* Rank Elevation Pathway */}
              <div className="pt-1 inline-flex items-center gap-2 text-xs">
                <span className="text-slate-400">{candidate.currentRank}</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-amber-300">{candidate.targetRankName}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-mono">
                  {candidate.tenureYears || 4} Yrs Served ✓
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            {isInvestitureReady && (
              <Button
                variant="gold"
                size="md"
                icon={<QrCode className="w-4 h-4" />}
                onClick={() => setShowPassModal(true)}
                className="w-full sm:w-auto shadow-md font-bold justify-center"
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
                className="w-full sm:w-auto bg-slate-900 border-slate-700 text-white hover:bg-slate-800 justify-center"
              >
                Certificate
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              icon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
              className="w-full sm:w-auto bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 justify-center"
            >
              Clearance Slip
            </Button>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THREE COMPACT SUMMARY KPI CARDS                                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Status Clearance Card */}
        <div className="bg-[#0b1021] border border-slate-800 rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Vetting Progress
            </span>
            <span className="text-sm font-bold text-white">
              5 of 5 Tiers Ratified
            </span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">
              Holy Synod Ratification Complete
            </span>
          </div>
        </div>

        {/* Venue & Ceremony Date */}
        <div className="bg-[#0b1021] border border-slate-800 rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Investiture Date & Venue
            </span>
            <span className="text-sm font-bold text-white">
              Saturday, Nov 14, 2026
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Mount Zion Cathedral, Yaba
            </span>
          </div>
        </div>

        {/* Pew & Robe Specification */}
        <div className="bg-[#0b1021] border border-slate-800 rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Robing & Pew Assignment
            </span>
            <span className="text-sm font-bold text-white">
              Zone A &bull; Pew 14 (Chancel)
            </span>
            <span className="text-[11px] text-blue-400 block mt-0.5">
              {candidate.targetRankName}
            </span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. STRUCTURED TABS NAVIGATION (Uncluttered & Focused)                     */}
      {/* ========================================================================= */}
      <div className="bg-[#0b1021] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        
        {/* Tab Headers */}
        <div className="flex border-b border-slate-800 bg-[#080d1a] overflow-x-auto">
          <button
            onClick={() => setActiveTab('vetting')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'vetting'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Canonical Vetting & Clearance</span>
          </button>

          <button
            onClick={() => setActiveTab('robing')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'robing'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Liturgical Robing & Specs</span>
          </button>

          <button
            onClick={() => setActiveTab('financials')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'financials'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Financial Levies & Receipt</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'messages'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Secretariat Inquiries</span>
            {messages.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-amber-400">
                {messages.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          
          {/* TAB 1: Vetting & Timeline */}
          {activeTab === 'vetting' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  5-Tier Canonical Progression
                </h3>
                <p className="text-xs text-slate-400">
                  Sequential clearance records through all canonical jurisdictions
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {tierSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`rounded-xl p-3.5 border transition-all ${
                      step.isCompleted
                        ? 'bg-slate-900/90 border-emerald-500/30'
                        : 'bg-slate-900/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-amber-400">
                        TIER 0{idx + 1}
                      </span>
                      {step.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>
                    <p className="text-xs font-bold text-white mb-0.5">{step.title}</p>
                    <p className="text-[10px] text-slate-400">{step.authority}</p>
                    <span className="inline-block mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {step.isCompleted ? 'Cleared ✓' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dossier Summary Details */}
              <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Candidate Email</span>
                  <span className="font-medium text-white">{candidate.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone Number</span>
                  <span className="font-medium text-white">{candidate.phone || '+234 803 000 0000'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ordination Roll Year</span>
                  <span className="font-medium text-amber-300 font-mono">2026 Session</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Investiture Clearance</span>
                  <span className="font-medium text-emerald-400">Approved & Sealed</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Robing Specifications */}
          {activeTab === 'robing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Liturgical Robing & Vestment Specifications
                </h3>
                <p className="text-xs text-slate-400">
                  Approved ecclesiastical dress code for {candidate.targetRankName} investiture
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Primary Vestment Requirements
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cassock Color: <strong>Pure Liturgical White</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sash / Stole: <strong>{robingSpecs?.stoleType || 'Liturgical Royal Blue & Gold'}</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cap / Headwear: <strong>Canonical White & Gold Trim Cap</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Staff / Rod: <strong>Ecclesiastical Council Standard</strong></span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Investiture Service Directives
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>Roll Call & Accreditation: <strong>07:30 AM Sharp</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>Solemn Consecration Commences: <strong>09:00 AM</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      <span>Gate Entry: <strong>East Portico &bull; Gate 2</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Financial Clearance */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    Canonical Levies & Receipt Clearance
                  </h3>
                  <p className="text-xs text-slate-400">
                    Statutory assessment records across ecclesiastical levels
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                  <Check className="w-3.5 h-3.5" />
                  <span>TOTAL ₦80,000 FULLY PAID</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
                  <span className="text-slate-500 block">Branch Parish</span>
                  <span className="font-bold text-white text-sm">₦15,000</span>
                  <span className="text-emerald-400 text-[10px] block mt-1">Cleared ✓</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
                  <span className="text-slate-500 block">District Council</span>
                  <span className="font-bold text-white text-sm">₦15,000</span>
                  <span className="text-emerald-400 text-[10px] block mt-1">Cleared ✓</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
                  <span className="text-slate-500 block">Provincial Diocese</span>
                  <span className="font-bold text-white text-sm">₦20,000</span>
                  <span className="text-emerald-400 text-[10px] block mt-1">Cleared ✓</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
                  <span className="text-slate-500 block">Holy Synod Apex</span>
                  <span className="font-bold text-white text-sm">₦30,000</span>
                  <span className="text-emerald-400 text-[10px] block mt-1">Cleared ✓</span>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Official Clearance Receipt:</span>
                  <span className="font-mono text-amber-300 font-bold ml-2">
                    {candidate.receiptNumber || 'ESOCS-REC-2026-8481'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Printer className="w-3.5 h-3.5" />}
                  onClick={() => window.print()}
                >
                  Print Receipt
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: Secretariat Messaging */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Secretariat Communications & Inquiries
                </h3>
                <p className="text-xs text-slate-400">
                  Direct encrypted line to Central Secretariat Advisory & Screening Officers
                </p>
              </div>

              {/* Chat Thread */}
              <div className="h-64 overflow-y-auto bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                    <MessageSquare className="w-6 h-6 mb-1 text-slate-600" />
                    <span>No active inquiry thread. Send a message below.</span>
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
                        className={`max-w-md px-3.5 py-2.5 rounded-xl text-xs ${
                          m.senderRole === 'candidate'
                            ? 'bg-amber-500 text-slate-950 font-medium'
                            : 'bg-slate-800 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <p>{m.content}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {m.senderName} &bull; {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type an inquiry to the Secretariat..."
                  className="flex-1 bg-[#080d1a] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
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
          )}

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

    </div>
  );
}
