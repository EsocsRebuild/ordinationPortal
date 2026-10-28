'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CandidateProfile, InAppMessage, VettingTier } from '@/types';
import { Button } from '@/components/ui/Button';
import { DigitalPassModal } from '@/components/shared/DigitalPassModal';
import { CertificateModal } from '@/components/shared/CertificateModal';
import { PaymentClearanceSlipModal } from '@/components/shared/PaymentClearanceSlipModal';
import { CandidateLearnerTour } from '@/components/shared/CandidateLearnerTour';
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
  Crown,
  AlertCircle,
  ArrowRight,
  DollarSign,
  LayoutDashboard,
  Lock,
  RefreshCw,
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
  const [messages, setMessages] = useRealtimeMessages(initialCandidate.id);
  const [currentTab, setCurrentTab] = useState<'overview' | 'clearance' | 'payments' | 'pass' | 'support'>(activeTab);
  
  // Modals
  const [showPassModal, setShowPassModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [copiedReg, setCopiedReg] = useState(false);

  // Selected / Expanded clearance step in clearance view
  const [expandedStepId, setExpandedStepId] = useState<string | null>('branch');

  // Interactive Checklist State (candidate-confirmed liturgical preparation)
  const [checklist, setChecklist] = useState({
    vestment: false,
  });

  // Payment proof reference input state
  const [paymentRefInput, setPaymentRefInput] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentSubmittedSuccess, setPaymentSubmittedSuccess] = useState(false);

  // Photo upload state
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(candidate?.passportPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // In-app messaging state
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Live real-time update banner notification
  const [liveUpdateAlert, setLiveUpdateAlert] = useState<{
    title: string;
    description: string;
    timestamp: string;
  } | null>(null);

  // Automated Secretariat Engine States
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');
  const [isAdvancingTier, setIsAdvancingTier] = useState(false);
  const [showPrecheckModal, setShowPrecheckModal] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const fresh = await api.getCandidateById(candidate.id);
      if (fresh) {
        setCandidate(fresh);
        onUpdateCandidate?.(fresh);
        setLastSyncedTime(new Date().toLocaleTimeString());
        setLiveUpdateAlert({
          title: 'Secretariat Synchronization Complete',
          description: 'Your candidate records are fully up to date with the Central Secretariat.',
          timestamp: new Date().toLocaleTimeString(),
        });
        setTimeout(() => setLiveUpdateAlert(null), 5000);
      }
    } catch (err) {
      console.error('Failed to sync candidate record:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAdvanceStageDemo = async () => {
    setIsAdvancingTier(true);
    try {
      const tierOrder: VettingTier[] = ['branch', 'district', 'province', 'cmc', 'national'];
      const nextTier = tierOrder.find(
        (t) => !candidate.tierApprovals?.[t]?.approved
      );

      const approverTitles: Record<VettingTier, string> = {
        branch: 'Branch Level Leadership & Secretariat',
        district: 'District Level Council & Secretariat',
        province: 'Provincial Level Secretariat',
        cmc: 'National Level (CMC) Committee',
        national: 'National Level (Holy Synod & General Conference)',
      };

      const comments: Record<VettingTier, string> = {
        branch: 'Branch Level records, baptismal status, and local membership cleared.',
        district: 'District Level tenure and moral standing verified in good order.',
        province: 'Provincial Level allocation and diocesan records officially ratified.',
        cmc: 'National Level (CMC) ministerial credentials vetted and confirmed.',
        national: 'National Level (Holy Synod) final ratification granted. Rostered for ordination.',
      };

      if (nextTier) {
        const updatedApprovals = {
          ...(candidate.tierApprovals || {}),
          [nextTier]: {
            approved: true,
            approverName: approverTitles[nextTier],
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            comments: comments[nextTier],
          },
        };

        const updated = await api.updateCandidate(
          candidate.id,
          { tierApprovals: updatedApprovals },
          approverTitles[nextTier]
        );

        if (updated) {
          setCandidate(updated);
          onUpdateCandidate?.(updated);
          realtimeClient.broadcastLocal({
            id: `evt_${Date.now()}`,
            type: 'TIER_APPROVED',
            timestamp: new Date().toISOString(),
            payload: {
              candidateId: candidate.id,
              tier: nextTier,
              approver: approverTitles[nextTier],
            },
            actor: approverTitles[nextTier],
            candidateId: candidate.id,
          });
          setLiveUpdateAlert({
            title: `Automated Milestone Cleared: ${approverTitles[nextTier]}`,
            description: `Stage ${applicantStages.find((s) => s.id === nextTier)?.step || 1} approved! Advancing to the next clearance level.`,
            timestamp: new Date().toLocaleTimeString(),
          });
          setTimeout(() => setLiveUpdateAlert(null), 6000);
        }
      } else if (candidate.duesStatus !== 'cleared') {
        const updated = await api.updateCandidate(
          candidate.id,
          {
            duesStatus: 'cleared',
            duesAmountPaid: totalLevy,
            receiptNumber: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          },
          'Automated Treasury Reconciliation'
        );
        if (updated) {
          setCandidate(updated);
          onUpdateCandidate?.(updated);
          setLiveUpdateAlert({
            title: 'Automated Treasury Clearance',
            description: 'All statutory ordination levies reconciled. Digital Ceremony Pass is now unlocked!',
            timestamp: new Date().toLocaleTimeString(),
          });
          setTimeout(() => setLiveUpdateAlert(null), 6000);
        }
      } else if (candidate.stage !== 'ordained') {
        const updated = await api.updateCandidate(
          candidate.id,
          {
            stage: 'ordained',
            ordinationDate: new Date().toISOString(),
          },
          'Holy Synod Apostolic Decree'
        );
        if (updated) {
          setCandidate(updated);
          onUpdateCandidate?.(updated);
          setLiveUpdateAlert({
            title: 'Sacred Consecration Conferred',
            description: 'Congratulations! Your sacred investiture is complete and Certificate of Ordination is ready.',
            timestamp: new Date().toLocaleTimeString(),
          });
          setTimeout(() => setLiveUpdateAlert(null), 6000);
        }
      }
    } catch (err) {
      console.error('Failed to advance stage automatically:', err);
    } finally {
      setIsAdvancingTier(false);
    }
  };

  useEffect(() => {
    return realtimeClient.subscribe((event) => {
      if (
        (event.type === 'TIER_APPROVED' || event.type === 'CANDIDATE_UPDATED') &&
        event.payload &&
        (event.payload.id === candidate.id || event.payload.candidateId === candidate.id)
      ) {
        setLiveUpdateAlert({
          title: 'Ordination Record Updated in Real-Time',
          description: event.payload.status
            ? `Your status changed to: ${String(event.payload.status).replace(/_/g, ' ')}`
            : 'A review stage clearance was just ratified by the secretariat.',
          timestamp: new Date().toLocaleTimeString(),
        });
        setTimeout(() => setLiveUpdateAlert(null), 8000);
      }
    });
  }, [candidate.id]);

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

  const currentCandidate = candidate || initialCandidate;

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
  const branchApproved = Boolean(candidate.tierApprovals?.branch?.approved);
  const districtApproved = Boolean(candidate.tierApprovals?.district?.approved);
  const provinceApproved = Boolean(candidate.tierApprovals?.province?.approved);
  const cmcApproved = Boolean(candidate.tierApprovals?.cmc?.approved);
  const nationalApproved = Boolean(candidate.tierApprovals?.national?.approved);

  const approvalSteps = [
    {
      id: 'branch',
      stepNumber: '01',
      title: 'Branch Level Clearance & Attestation',
      authority: 'Branch Leadership & Secretariat',
      officer: candidate.tierApprovals?.branch?.approverName || candidate.branchPriestName || 'Branch Attesting Officer',
      date: candidate.tierApprovals?.branch?.date || (branchApproved ? candidate.submissionDate : 'In Review'),
      desc: 'Verification of active church membership, local branch records, and canonical good standing.',
      isCompleted: branchApproved,
      isCurrent: !branchApproved,
      statusLabel: branchApproved ? 'Approved ✓' : 'In Review ⏳',
      sealBadge: branchApproved ? 'Branch Level Cleared' : 'Awaiting Branch Review',
      comments: candidate.tierApprovals?.branch?.comments || (branchApproved ? 'Nomination verified and approved at Branch Level.' : 'Under active review by Branch Level Secretariat.'),
    },
    {
      id: 'district',
      stepNumber: '02',
      title: 'District Level Review & Clearance',
      authority: 'District Council & Secretariat',
      officer: candidate.tierApprovals?.district?.approverName || 'District Review Officer',
      date: candidate.tierApprovals?.district?.date || (districtApproved ? 'Ratified' : branchApproved ? 'In Review' : 'Queued'),
      desc: 'District verification of service tenure, good character, and church records.',
      isCompleted: districtApproved,
      isCurrent: branchApproved && !districtApproved,
      statusLabel: districtApproved ? 'Approved ✓' : branchApproved ? 'In Review ⏳' : 'Pending Step 1 🔒',
      sealBadge: districtApproved ? 'District Level Cleared' : branchApproved ? 'District Review in Progress' : 'Locked',
      comments: candidate.tierApprovals?.district?.comments || (districtApproved ? 'Service verified with good standing at District Level.' : branchApproved ? 'Under review at District Level.' : 'Awaiting Branch Level clearance.'),
    },
    {
      id: 'province',
      stepNumber: '03',
      title: 'Provincial Level Clearance',
      authority: `${candidate.province} Provincial Secretariat`,
      officer: candidate.tierApprovals?.province?.approverName || 'Provincial Clearance Officer',
      date: candidate.tierApprovals?.province?.date || (provinceApproved ? 'Cleared' : districtApproved ? 'In Review' : 'Queued'),
      desc: 'Provincial verification and clearance for National Level (CMC) vetting.',
      isCompleted: provinceApproved,
      isCurrent: districtApproved && !provinceApproved,
      statusLabel: provinceApproved ? 'Approved ✓' : districtApproved ? 'In Review ⏳' : 'Pending Step 2 🔒',
      sealBadge: provinceApproved ? 'Provincial Level Cleared' : districtApproved ? 'Clearance in Progress' : 'Locked',
      comments: candidate.tierApprovals?.province?.comments || (provinceApproved ? 'Candidate allocation verified and ratified at Provincial Level.' : districtApproved ? 'Awaiting Provincial Level credential check.' : 'Awaiting District Level clearance.'),
    },
    {
      id: 'cmc',
      stepNumber: '04',
      title: 'National Level Vetting (CMC)',
      authority: 'Central Ministerial Committee (National Level)',
      officer: candidate.tierApprovals?.cmc?.approverName || 'National Ministerial Vetting Officer',
      date: candidate.tierApprovals?.cmc?.date || (cmcApproved ? 'Vetting Cleared' : provinceApproved ? 'Under Review' : 'Queued'),
      desc: 'Credential verification, ministerial interview, and ecclesiastical standing review at National Level.',
      isCompleted: cmcApproved,
      isCurrent: provinceApproved && !cmcApproved,
      statusLabel: cmcApproved ? 'Approved ✓' : provinceApproved ? 'In Review ⏳' : 'Pending Step 3 🔒',
      sealBadge: cmcApproved ? 'National (CMC) Cleared' : provinceApproved ? 'Awaiting CMC Review' : 'Locked',
      comments: candidate.tierApprovals?.cmc?.comments || (cmcApproved ? 'Ministerial vetting approved and verified in good standing at National Level.' : provinceApproved ? 'Queued for National Level (CMC) screening.' : 'Awaiting Provincial Level clearance.'),
    },
    {
      id: 'national',
      stepNumber: '05',
      title: 'National Level Ratification (Synod)',
      authority: 'Holy Synod & General Conference (National Level)',
      officer: candidate.tierApprovals?.national?.approverName || 'National Secretariat',
      date: candidate.tierApprovals?.national?.date || (nationalApproved ? 'Approved' : cmcApproved ? 'Under Review' : 'Queued'),
      desc: 'Final confirmation of candidate roster and preparation for ordination ceremony.',
      isCompleted: nationalApproved,
      isCurrent: cmcApproved && !nationalApproved,
      statusLabel: nationalApproved ? 'Approved & Confirmed ✓' : cmcApproved ? 'Under Final Review ⏳' : 'Pending Step 4 🔒',
      sealBadge: nationalApproved ? 'National Level Ratified' : cmcApproved ? 'Awaiting Synod Ratification' : 'Locked',
      comments: candidate.tierApprovals?.national?.comments || (nationalApproved ? 'Approved and ratified for official ordination at National Level.' : cmcApproved ? 'Screening results submitted to National Council for final confirmation.' : 'Awaiting National Level (CMC) clearance.'),
    },
  ];

  const completedCount = approvalSteps.filter((s) => s.isCompleted).length;
  const progressPercent = Math.round((completedCount / approvalSteps.length) * 100);

  const isVettingCleared = completedCount === 5 || ['board_approved', 'investiture_assigned', 'ordained'].includes(candidate.stage);
  const isLeviesCleared = candidate.duesStatus === 'cleared';
  const isCeremonyReady = isVettingCleared && isLeviesCleared;
  const isPassReady = Boolean(isCeremonyReady && candidate.seatNumber);
  const isPewReady = Boolean(isCeremonyReady && candidate.seatNumber);
  const isOrdained = candidate.stage === 'ordained';

  // 6-Stage Church Ordination Progression Stepper
  const applicantStages = [
    {
      step: 1,
      id: 'branch',
      title: '1. Branch Level',
      subtitle: 'Branch Clearance',
      isCompleted: branchApproved,
      isActive: !branchApproved,
    },
    {
      step: 2,
      id: 'district',
      title: '2. District Level',
      subtitle: 'District Clearance',
      isCompleted: districtApproved,
      isActive: branchApproved && !districtApproved,
    },
    {
      step: 3,
      id: 'province',
      title: '3. Provincial Level',
      subtitle: 'Provincial Clearance',
      isCompleted: provinceApproved,
      isActive: districtApproved && !provinceApproved,
    },
    {
      step: 4,
      id: 'cmc',
      title: '4. National Level (CMC)',
      subtitle: 'Ministerial Vetting',
      isCompleted: cmcApproved,
      isActive: provinceApproved && !cmcApproved,
    },
    {
      step: 5,
      id: 'synod',
      title: '5. National Level (Synod)',
      subtitle: 'Final Ratification',
      isCompleted: nationalApproved,
      isActive: cmcApproved && !nationalApproved,
    },
    {
      step: 6,
      id: 'consecration',
      title: '6. Ordination Day',
      subtitle: 'Ceremony & Pass',
      isCompleted: isOrdained,
      isActive: nationalApproved && !isOrdained,
    },
  ];

  const currentStageIndex = isOrdained
    ? 6
    : nationalApproved
    ? 6
    : cmcApproved
    ? 5
    : provinceApproved
    ? 4
    : districtApproved
    ? 3
    : branchApproved
    ? 2
    : 1;

  const currentStageInfo = applicantStages[Math.min(currentStageIndex - 1, 5)];

  const stageGuidance: Record<number, { heading: string; desc: string; actionText?: string; actionTab?: string }> = {
    1: {
      heading: 'Branch Level Clearance In Progress',
      desc: 'Your nomination is registered and undergoing review at the Branch Level. Ensure your local branch attendance, membership records, and canonical good standing are confirmed.',
      actionText: 'View Branch Level Status',
      actionTab: 'clearance',
    },
    2: {
      heading: 'District Level Review Underway',
      desc: 'Branch Level clearance is confirmed. Your application is now with the District Level for verification and endorsement.',
      actionText: 'View District Level Progress',
      actionTab: 'clearance',
    },
    3: {
      heading: 'Provincial Level Clearance',
      desc: 'District Level review is confirmed. The Provincial Level Secretariat is reviewing your records and confirming your diocesan quota.',
      actionText: 'View Provincial Level Status',
      actionTab: 'clearance',
    },
    4: {
      heading: 'National Level (CMC) Vetting Underway',
      desc: 'Provincial Level clearance is complete! Your file is under active review at the National Level by the Central Ministerial Committee (CMC).',
      actionText: 'View National Vetting Progress',
      actionTab: 'clearance',
    },
    5: {
      heading: isLeviesCleared ? 'National Level Final Ratification' : 'Ordination Fee Payment Required',
      desc: isLeviesCleared
        ? 'National Level (CMC) vetting ratified! Your file is queued for final ratification by the Holy Synod and ceremony seating.'
        : 'National Level vetting completed! Please complete your ordination fee payment to generate your digital ceremony pass.',
      actionText: isLeviesCleared ? 'View National Ratification' : 'Pay Ordination Fees',
      actionTab: isLeviesCleared ? 'clearance' : 'payments',
    },
    6: {
      heading: isOrdained ? 'Ordination Concluded' : 'Ready for Ordination Day',
      desc: isOrdained
        ? 'You have been officially ordained. Your Certificate of Ordination is ready for download.'
        : 'All canonical review levels (Branch, District, Provincial, National) are approved and statutory dues settled! Attend the sacred ceremony at the Cathedral on ordination day.',
      actionText: isOrdained ? 'Download Certificate' : 'Open Ceremony Pass',
      actionTab: isOrdained ? 'overview' : 'pass',
    },
  };

  const readyCount =
    (isVettingCleared ? 1 : 0) +
    (isLeviesCleared ? 1 : 0) +
    (isPassReady ? 1 : 0) +
    (checklist.vestment ? 1 : 0) +
    (isPewReady ? 1 : 0);

  const totalLevy = candidate.levyBreakdown?.total || 0;
  const branchLevy = candidate.levyBreakdown?.branchLevy || 0;
  const districtLevy = candidate.levyBreakdown?.districtLevy || 0;
  const provincialLevy = candidate.levyBreakdown?.provincialLevy || 0;
  const nationalFee = candidate.levyBreakdown?.nationalFee || 0;
  const amountPaid = candidate.duesAmountPaid || 0;
  const outstandingLevy = Math.max(0, totalLevy - amountPaid);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentRefInput.trim()) return;
    setIsSubmittingPayment(true);
    try {
      const generatedReceipt = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const updated = await api.updateCandidate(
        candidate.id,
        {
          duesStatus: 'cleared',
          duesAmountPaid: totalLevy,
          receiptNumber: candidate.receiptNumber || generatedReceipt,
        },
        candidate.fullName
      );
      if (updated) {
        setCandidate(updated);
        onUpdateCandidate?.(updated);
        setPaymentSubmittedSuccess(true);
        setPaymentRefInput('');
        realtimeClient.broadcastLocal({
          id: `evt_${Date.now()}`,
          type: 'CANDIDATE_UPDATED',
          timestamp: new Date().toISOString(),
          payload: { candidateId: candidate.id, status: 'cleared', amount: totalLevy, receipt: updated.receiptNumber },
          actor: candidate.fullName,
          candidateId: candidate.id,
        });
      }
    } catch (err) {
      console.error('Failed to submit payment reference:', err);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const [isProcessingOnlinePay, setIsProcessingOnlinePay] = useState(false);

  const handleInstantOnlinePayment = async () => {
    setIsProcessingOnlinePay(true);
    try {
      const generatedReceipt = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const updated = await api.updateCandidate(
        candidate.id,
        {
          duesStatus: 'cleared',
          duesAmountPaid: totalLevy,
          receiptNumber: candidate.receiptNumber || generatedReceipt,
        },
        candidate.fullName
      );
      if (updated) {
        setCandidate(updated);
        onUpdateCandidate?.(updated);
        setPaymentSubmittedSuccess(true);
        realtimeClient.broadcastLocal({
          id: `evt_${Date.now()}`,
          type: 'CANDIDATE_UPDATED',
          timestamp: new Date().toISOString(),
          payload: { candidateId: candidate.id, status: 'cleared', amount: totalLevy, receipt: updated.receiptNumber },
          actor: candidate.fullName,
          candidateId: candidate.id,
        });
      }
    } catch (err) {
      console.error('Failed to process online payment:', err);
    } finally {
      setIsProcessingOnlinePay(false);
    }
  };

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Real-time automated update notification banner */}
      {liveUpdateAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-amber-500/10 to-transparent border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-4 shadow-lg backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Live Real-Time Update</span>
                <span className="text-[10px] text-slate-500 font-mono">{liveUpdateAlert.timestamp}</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate mt-0.5">{liveUpdateAlert.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLiveUpdateAlert(null)}
            className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Consecrated Minister Active Banner */}
      {isOrdained && onSwitchToConsecratedView && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-purple-500/15 border-2 border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Holy Ordination Conferred ✓
              </span>
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                You are an Ordained Minister ({candidate.targetRankName}) of the Holy Order
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Your Consecrated Clergy Dashboard, official certificate, altar duties, and synod circulars are fully active.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSwitchToConsecratedView}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <span>Launch Clergy Dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

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

            <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold inline-flex items-center gap-1 ${
              completedCount === 5
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {completedCount === 5 ? 'All 5 Approvals Cleared' : `${completedCount}/5 Approvals Cleared`}
              </span>
              <span className="sm:hidden">{completedCount}/5 Cleared</span>
            </span>
          </div>

          {/* Right: Quick actions (Tour, Clergy View when ordained) */}
          <div className="flex items-center gap-1.5">
            {isOrdained && onSwitchToConsecratedView && (
              <Tooltip content="View post-ordination Consecrated Clergy records and official gazette">
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
            <div className="space-y-1.5 flex-1 text-center sm:text-left min-w-0 max-w-full overflow-hidden">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight leading-snug break-words">
                {candidate.fullName}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">{candidate.parish}</span>
                <span className="text-slate-400">&bull;</span>
                <span className="text-slate-600 dark:text-slate-400 truncate max-w-[150px] sm:max-w-xs">{candidate.province}</span>
              </div>

              {/* Rank Progression Path */}
              <div className="pt-1 max-w-full">
                <div className="inline-flex flex-wrap items-center justify-center sm:justify-start gap-1.5 p-1.5 sm:p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs max-w-full">
                  <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium shadow-xs break-words">
                    Current: <strong className="text-slate-900 dark:text-white ml-0.5">{candidate.currentRank}</strong>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30 shadow-xs break-words">
                    Target: {candidate.targetRankName}
                  </span>
                  <span className="hidden md:inline-flex text-[11px] text-emerald-700 dark:text-emerald-400 font-mono px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                    {candidate.tenureYears || 5} Yrs Ministry ✓
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Right: Key Action Buttons (Clean Grid on Mobile, Column on Desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-col gap-2.5 w-full lg:w-64 xl:w-72 shrink-0 pt-2 lg:pt-0">
            {isPassReady ? (
              <Tooltip content="Open your digital accreditation pass with QR verification" position="left" className="w-full">
                <Button
                  variant="gold"
                  size="md"
                  icon={<QrCode className="w-4 h-4 shrink-0" />}
                  onClick={() => setShowPassModal(true)}
                  className="w-full justify-center shadow-md font-bold text-xs min-h-[44px] py-2.5 px-3 leading-tight"
                >
                  <span className="truncate">Digital Ceremony Pass</span>
                </Button>
              </Tooltip>
            ) : (
              <Tooltip content="Digital Ceremony Pass is locked until all 5 vetting clearances and statutory levies are verified" position="left" className="w-full">
                <Button
                  variant="outline"
                  size="md"
                  icon={<Lock className="w-4 h-4 text-amber-500 shrink-0" />}
                  onClick={() => setShowPassModal(true)}
                  className="w-full justify-center bg-slate-100 dark:bg-slate-900 border-dashed border-amber-400 dark:border-amber-600/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs min-h-[44px] py-2.5 px-3 leading-tight"
                >
                  <span className="truncate">Pass Restricted ({completedCount}/5 Cleared)</span>
                </Button>
              </Tooltip>
            )}

            {isOrdained ? (
              <Tooltip content="View and print your official certificate of ordination" position="left" className="w-full">
                <Button
                  variant="outline"
                  size="md"
                  icon={<Award className="w-4 h-4 text-amber-500 shrink-0" />}
                  onClick={() => setShowCertModal(true)}
                  className="w-full justify-center bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 text-xs min-h-[44px] py-2.5 px-3 leading-tight"
                >
                  <span className="truncate">Ordination Certificate</span>
                </Button>
              </Tooltip>
            ) : (
              <Tooltip content="Conferred at the Holy Altar by His Most Eminence upon sacred investiture" position="left" className="w-full">
                <Button
                  variant="outline"
                  size="md"
                  icon={<Award className="w-4 h-4 text-slate-400 shrink-0" />}
                  onClick={() => setShowCertModal(true)}
                  className="w-full justify-center bg-slate-100/60 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs min-h-[44px] py-2.5 px-3 leading-tight"
                >
                  <span className="truncate">Certificate (Post-Ordination) 🔒</span>
                </Button>
              </Tooltip>
            )}

            <Tooltip content="Open and print your official itemized payment and clearance receipt" position="left" className="w-full">
              <Button
                variant="outline"
                size="md"
                icon={<Receipt className="w-4 h-4 text-emerald-500 shrink-0" />}
                onClick={() => setShowSlipModal(true)}
                className="w-full justify-center bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs min-h-[44px] py-2.5 px-3 leading-tight"
              >
                <span className="truncate">Official Payment Slip</span>
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
          <span>Ordination Clearance ({completedCount}/5)</span>
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
          {!isPassReady && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
              🔒 Locked
            </span>
          )}
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

          {/* ========================================================================= */}
          {/* APPLICANT ORDINATION PROGRESSION STAGE TRACKER (6-STAGE STEPPER)          */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold">
                    Official Candidate Progression Pipeline
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-white">
                  Stage {currentStageIndex} of 6: {currentStageInfo?.title || 'Screening Review'}
                </h2>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-mono text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 text-amber-500 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Sync Record</span>
                </button>
                <span className={`px-3 py-1 rounded-xl font-mono text-xs font-bold border ${
                  isOrdained
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                    : isCeremonyReady
                    ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                }`}>
                  {isOrdained
                    ? 'Sacred Investiture Conferred ✓'
                    : isCeremonyReady
                    ? 'Ceremony Pass & Pew Ready ✓'
                    : `Active Stage (${completedCount}/5 Cleared)`}
                </span>
              </div>
            </div>

            {/* Top Interactive Progress Timeline */}
            <div className="py-2">
              <div className="relative flex items-center justify-between mb-3">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full z-0">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(8, (completedCount / 5) * 100))}%` }}
                  />
                </div>

                {/* 6 Step Nodes */}
                {applicantStages.map((stage) => {
                  const isDone = stage.isCompleted;
                  const isCurrent = currentStageIndex === stage.step && !isDone;
                  return (
                    <div key={stage.id} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all shadow-sm ${
                          isDone
                            ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                            : isCurrent
                            ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/30 scale-110 animate-pulse'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : stage.step}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-1.5 hidden md:block text-center whitespace-nowrap">
                        {stage.title.split('. ')[1] || stage.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Responsive Milestone Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 pt-1">
              {applicantStages.map((stage) => {
                const isDone = stage.isCompleted;
                const isCurrent = currentStageIndex === stage.step && !isDone;
                return (
                  <div
                    key={stage.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between items-center text-center min-w-0 min-h-[140px] ${
                      isDone
                        ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                        : isCurrent
                        ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/50 text-amber-900 dark:text-amber-200 shadow-sm ring-2 ring-amber-500/20'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <div className="flex flex-col items-center w-full">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs mb-2 transition-transform shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : isCurrent
                          ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isDone ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : isCurrent ? (
                          <span>0{stage.step}</span>
                        ) : (
                          <Lock className="w-3 h-3 opacity-60" />
                        )}
                      </div>
                      <h4 className="font-bold text-xs sm:text-[13px] leading-snug text-slate-900 dark:text-white break-words w-full">
                        {stage.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight break-words w-full">
                        {stage.subtitle}
                      </p>
                    </div>

                    <div className="pt-2 w-full">
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md border w-full truncate ${
                        isDone
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : isCurrent
                          ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40'
                          : 'bg-slate-200/60 dark:bg-slate-800 text-slate-400 border-slate-300/40 dark:border-slate-700/50'
                      }`}>
                        {isDone ? 'Approved ✓' : isCurrent ? 'In Review ⏳' : 'Upcoming 🔒'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Contextual Active Stage Guidance & Automated Actions Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-50 to-transparent dark:from-amber-500/10 dark:via-slate-900/80 dark:to-slate-900/40 border border-amber-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs overflow-hidden">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5 border border-amber-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {stageGuidance[currentStageIndex]?.heading || 'Clearance Progress'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30">
                      Active Action Stage
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-3xl">
                    {stageGuidance[currentStageIndex]?.desc}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPrecheckModal(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Pre-Check</span>
                </button>

                {stageGuidance[currentStageIndex]?.actionText && (
                  <button
                    type="button"
                    onClick={() => setCurrentTab((stageGuidance[currentStageIndex]?.actionTab as any) || 'clearance')}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shrink-0 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{stageGuidance[currentStageIndex]?.actionText}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Link href="/dashboard/candidate?tab=clearance" className="group block">
              <div className="w-full bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-sm group-hover:border-emerald-500/60 transition-all cursor-pointer">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                  isVettingCleared
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400'
                }`}>
                  <CheckCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Clearance Standing</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {completedCount} of 5 Approved
                  </p>
                  <p className={`text-[11px] font-medium ${isVettingCleared ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {progressPercent}% Cleared →
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/candidate?tab=payments" className="group block">
              <div className="w-full bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-sm group-hover:border-amber-500/60 transition-all cursor-pointer">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                  isLeviesCleared
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400'
                }`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Statutory Levies</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    ₦{amountPaid.toLocaleString()} Paid
                  </p>
                  <p className={`text-[11px] font-mono ${isLeviesCleared ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {isLeviesCleared ? 'All Levies Settled ✓' : `₦${outstandingLevy.toLocaleString()} Due →`}
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/candidate?tab=pass" className="group block">
              <div className="w-full bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-sm group-hover:border-blue-500/60 transition-all cursor-pointer">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Ceremony Schedule</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Nov 14, 2026
                  </p>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400">
                    General Conference Session →
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/candidate?tab=pass" className="group block">
              <div className="w-full bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-sm group-hover:border-purple-500/60 transition-all cursor-pointer">
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Accreditation Pass</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {isPassReady ? (candidate.seatNumber || 'Pass Ready') : 'Gated & Restricted'}
                  </p>
                  <p className="text-[11px] text-purple-600 dark:text-purple-400">
                    {isPassReady ? 'Gate 2 Pew Ready →' : `${5 - completedCount} Approvals Required →`}
                  </p>
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
                <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg ${
                  readyCount === 5
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                    : 'text-amber-700 dark:text-amber-400 bg-amber-500/10'
                }`}>
                  {readyCount} of 5 Ready
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={isVettingCleared}
                    readOnly
                    className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-amber-500 border-slate-300 dark:border-slate-700 cursor-not-allowed"
                  />
                  <div className="space-y-0.5 flex-1">
                    <span className={`font-semibold text-sm ${isVettingCleared ? 'text-slate-900 dark:text-white line-through opacity-80' : 'text-slate-900 dark:text-white'}`}>
                      Ordination Clearance & Screening ({completedCount}/5 Approved)
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {isVettingCleared
                        ? 'All parish, district, provincial, ministerial vetting, and national council approvals ratified.'
                        : `Currently at Stage ${completedCount + 1}: ${approvalSteps[completedCount]?.title || 'Screening in review'}.`}
                    </p>
                  </div>
                  <Link href="/dashboard/candidate?tab=clearance" className="text-amber-700 dark:text-amber-400 hover:underline font-bold text-[11px]">
                    Details →
                  </Link>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={isLeviesCleared}
                    readOnly
                    className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-amber-500 border-slate-300 dark:border-slate-700 cursor-not-allowed"
                  />
                  <div className="space-y-0.5 flex-1">
                    <span className={`font-semibold text-sm ${isLeviesCleared ? 'text-slate-900 dark:text-white line-through opacity-80' : 'text-slate-900 dark:text-white'}`}>
                      Statutory Levies & Ordination Dues ({isLeviesCleared ? 'Cleared' : `₦${outstandingLevy.toLocaleString()} Due`})
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {isLeviesCleared
                        ? `All ₦${totalLevy.toLocaleString()} statutory administrative and robing dues cleared.`
                        : `₦${amountPaid.toLocaleString()} paid of ₦${totalLevy.toLocaleString()} total statutory assessment.`}
                    </p>
                  </div>
                  <Link href="/dashboard/candidate?tab=payments" className="text-amber-700 dark:text-amber-400 hover:underline font-bold text-[11px]">
                    {isLeviesCleared ? 'Receipt →' : 'Pay Dues →'}
                  </Link>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={isPassReady}
                    readOnly
                    className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-amber-500 border-slate-300 dark:border-slate-700 cursor-not-allowed"
                  />
                  <div className="space-y-0.5 flex-1">
                    <span className={`font-semibold text-sm ${isPassReady ? 'text-slate-900 dark:text-white line-through opacity-80' : 'text-slate-900 dark:text-white'}`}>
                      Digital Ceremony Pass with Gate 2 QR Code
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {isPassReady
                        ? 'Pass issued and verified with Gate 2 QR barcode.'
                        : 'Pass unlocks automatically once Stage 5 Holy Synod approval is ratified.'}
                    </p>
                  </div>
                  <Link href="/dashboard/candidate?tab=pass" className="text-amber-700 dark:text-amber-400 hover:underline font-bold text-[11px]">
                    {isPassReady ? 'View Pass →' : 'View Status →'}
                  </Link>
                </div>

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

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={isPewReady}
                    readOnly
                    className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-amber-500 border-slate-300 dark:border-slate-700 cursor-not-allowed"
                  />
                  <div className="space-y-0.5 flex-1">
                    <span className={`font-semibold text-sm ${isPewReady ? 'text-slate-900 dark:text-white line-through opacity-80' : 'text-slate-900 dark:text-white'}`}>
                      Chancel Pew Reservation ({isPewReady ? candidate.seatNumber : 'Pending Allocation'})
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {isPewReady
                        ? `Reserved chancel seating assigned: ${candidate.seatNumber}.`
                        : 'Pew assignment assigned in the candidate front chancel wing upon clearance.'}
                    </p>
                  </div>
                  <Link href="/dashboard/candidate?tab=pass" className="text-amber-700 dark:text-amber-400 hover:underline font-bold text-[11px]">
                    Seating →
                  </Link>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Automated Secretariat Intelligence & Actions Hub */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Secretariat Engine</span>
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    Live E-Portal
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Database Sync:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px] inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Connected ({lastSyncedTime})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Pre-Check Verification:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">100% Eligible ✓</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setShowPrecheckModal(true)}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Run Canonical Pre-Check</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="w-full py-2 px-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-500' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Live Secretariat Record'}</span>
                  </button>
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
                  Detailed review records, signing officers, and official confirmation seals.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-xl text-xs font-bold border shrink-0 ${
                  completedCount === 5
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                }`}>
                  {completedCount} of 5 Ratified ({progressPercent}% Cleared) {completedCount === 5 ? '✓' : '⏳'}
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
                      className="w-full p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-left cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1 overflow-hidden">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-amber-700 dark:text-amber-400 font-mono font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-inner">
                          {step.stepNumber}
                        </div>

                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white break-words">
                              {step.title}
                            </h3>
                            <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                              {step.sealBadge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 break-words mt-0.5 line-clamp-2 sm:line-clamp-1">
                            {step.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-1.5 shrink-0 ${
                          step.isCompleted
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                            : step.isCurrent
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                          {step.isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : step.isCurrent ? (
                            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                          ) : (
                            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{step.statusLabel}</span>
                        </span>

                        <div className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-transform shrink-0 ${
                          isExpanded ? 'rotate-180 text-amber-500' : ''
                        }`}>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/40 text-xs space-y-4 animate-in fade-in duration-200 overflow-hidden">
                        {!step.isCompleted && !step.isCurrent ? (
                          <div className="p-4 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-3.5 my-1">
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                              <Lock className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Review Stage Sequential Lock</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                This review tier is queued and will automatically unlock as soon as the preceding authority completes their endorsement.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Reviewing Board</span>
                                <span className="font-semibold text-slate-900 dark:text-white text-xs break-words">{step.authority}</span>
                              </div>
                              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Signing Officer</span>
                                <span className="font-semibold text-slate-900 dark:text-white text-xs break-words">{step.officer}</span>
                              </div>
                              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Date Confirmed</span>
                                <span className="font-mono font-semibold text-amber-700 dark:text-amber-400 text-xs break-words">{step.date}</span>
                              </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-slate-700 dark:text-slate-300 break-words leading-relaxed overflow-hidden">
                              <span className="font-bold text-amber-800 dark:text-amber-300 mr-1.5">Official Review Remarks:</span>
                              {step.comments}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ecclesiastical Canonical Standing & Vetting Dossier */}
          <div className="bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Ecclesiastical Canonical Standing & Secretariat Dossier
                </h3>
              </div>
              <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
                cmcApproved
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
              }`}>
                {cmcApproved ? 'Vetting Cleared ✓' : 'Stage 4 In Verification ⏳'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Canonical Jurisdiction</span>
                <span className="text-slate-900 dark:text-white font-semibold text-xs mt-1 block truncate">
                  {candidate.parish}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  {candidate.province}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Elevation Target</span>
                <span className="text-slate-900 dark:text-white font-semibold text-xs mt-1 block truncate">
                  {candidate.currentRank} → {candidate.targetRankName}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Tenure Criterion Satisfied ✓
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Secretariat Registry Status</span>
                <span className="text-slate-900 dark:text-white font-semibold text-xs mt-1 block truncate">
                  {candidate.regNumber}
                </span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                  Active Ordination Dossier
                </span>
              </div>
            </div>

            {candidate.tierApprovals?.cmc?.comments && (
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300">
                <span className="font-bold block mb-1">Central Ministerial Committee Seal Notes:</span>
                {candidate.tierApprovals.cmc.comments}
              </div>
            )}
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
            <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isLeviesCleared
                ? 'bg-gradient-to-r from-emerald-500/10 via-slate-50 to-emerald-500/5 dark:from-emerald-950/30 dark:via-slate-900 dark:to-emerald-950/10 border-emerald-500/30'
                : 'bg-gradient-to-r from-amber-500/10 via-slate-50 to-amber-500/5 dark:from-amber-950/30 dark:via-slate-900 dark:to-amber-950/10 border-amber-500/30'
            }`}>
              <div className="space-y-1">
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isLeviesCleared ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                }`}>
                  {isLeviesCleared ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      All Statutory Ordination Levies Cleared
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                      Statutory Ordination Levies Settlement Pending
                    </>
                  )}
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 dark:text-white">
                  ₦{amountPaid.toLocaleString()}.00 {isLeviesCleared ? 'Paid in Full' : `of ₦${totalLevy.toLocaleString()}.00 Settled`}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isLeviesCleared
                    ? 'Official Church Treasury &bull; Confirmed and Ratified'
                    : `Outstanding Balance: ₦${outstandingLevy.toLocaleString()}.00 &bull; Remit to Official Church Account`}
                </p>
              </div>

              <div className="text-left sm:text-right sm:border-l sm:border-slate-200 dark:sm:border-slate-800 sm:pl-6 shrink-0 min-w-0 max-w-full">
                <span className="text-[11px] font-mono text-slate-500 block truncate">Official Receipt Number</span>
                <span className="text-sm font-mono font-bold text-amber-700 dark:text-amber-400 block mt-0.5 break-all">
                  {candidate.receiptNumber || (isLeviesCleared ? `REC-${new Date().getFullYear()}-${candidate.id.toUpperCase()}` : 'Pending Remittance')}
                </span>
                <span className={`text-[10px] font-bold block truncate ${isLeviesCleared ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {isLeviesCleared ? 'Status: Cleared ✓' : 'Status: Awaiting Verification ⏳'}
                </span>
              </div>
            </div>

            {/* Dual Payment Options: Instant Online Gateway & Direct Bank Remittance */}
            {!isLeviesCleared && (
              <div className="space-y-4">
                
                {paymentSubmittedSuccess ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>Payment confirmed and verified successfully! Your official receipt number has been generated.</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSlipModal(true)}
                      className="bg-white dark:bg-slate-900 text-xs font-bold shrink-0"
                    >
                      View Receipt Slip
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Method 1: Instant Online Gateway */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-white dark:via-[#0b1021] to-amber-500/5 border border-amber-500/30 flex flex-col justify-between gap-4 min-w-0 overflow-hidden">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase font-bold text-amber-700 dark:text-amber-400 truncate">
                            Option 1: Instant Clearance
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 shrink-0">
                            Fastest
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white break-words">
                          Online Debit Card / USSD Payment
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                          Settle your statutory levies instantly via secured card, bank app transfer, or USSD code. Your clearance updates in real-time immediately.
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 font-medium">
                          <span className="text-slate-700 dark:text-slate-300 truncate">Total Statutory Dues:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-sm shrink-0">
                            ₦{outstandingLevy.toLocaleString()}.00
                          </span>
                        </div>

                        <Button
                          variant="gold"
                          size="md"
                          onClick={handleInstantOnlinePayment}
                          loading={isProcessingOnlinePay}
                          icon={<CreditCard className="w-4 h-4" />}
                          className="w-full justify-center font-bold text-xs shadow-md h-11"
                        >
                          Pay ₦{outstandingLevy.toLocaleString()} Instantly Online
                        </Button>
                        <p className="text-[10px] text-center text-slate-400 truncate">
                          Secured via Zenith Bank Payment Gateway &bull; Instant Receipt Generation
                        </p>
                      </div>
                    </div>

                    {/* Method 2: Direct Bank Transfer Remittance */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4 min-w-0 overflow-hidden">
                      <div className="space-y-2">
                        <span className="text-[11px] font-mono uppercase font-bold text-slate-500 block truncate">
                          Option 2: Direct Bank Remittance
                        </span>
                        <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white break-words">
                          Official Church Bank Transfer
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                          Remit directly into the official church revenue account and submit your transfer transaction reference below for confirmation:
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 min-w-0">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block truncate">Designated Bank</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate block">Zenith Bank Plc</span>
                        </div>
                        <div className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 min-w-0">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block truncate">Account Number</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white truncate block">1014892019</span>
                        </div>
                        <div className="col-span-2 p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between min-w-0 gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block truncate">Payment Narration</span>
                            <span className="font-mono font-bold text-amber-700 dark:text-amber-400 break-all">{candidate.regNumber}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">Required</span>
                        </div>
                      </div>

                      <form onSubmit={handlePaymentSubmit} className="space-y-2 pt-1">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={paymentRefInput}
                            onChange={(e) => setPaymentRefInput(e.target.value)}
                            placeholder="e.g. ZEN-TXN-902184"
                            className="flex-1 p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono"
                            required
                          />
                          <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            loading={isSubmittingPayment}
                            disabled={!paymentRefInput.trim()}
                            className="font-bold text-xs shrink-0 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white"
                          >
                            Submit Ref
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Itemized Dues Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-xs text-left">
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
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ₦{branchLevy.toLocaleString()}.00
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                        isLeviesCleared
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      }`}>
                        {isLeviesCleared ? 'Cleared ✓' : 'Pending'}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-semibold">
                      District Council Ministerial Vetting Fee
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{candidate.district}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ₦{districtLevy.toLocaleString()}.00
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                        isLeviesCleared
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      }`}>
                        {isLeviesCleared ? 'Cleared ✓' : 'Pending'}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-semibold">
                      Provincial Diocese Registry & Quota Levy
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{candidate.province}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ₦{provincialLevy.toLocaleString()}.00
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                        isLeviesCleared
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      }`}>
                        {isLeviesCleared ? 'Cleared ✓' : 'Pending'}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-semibold">
                      National Holy Synod Consecration & Robing Levy
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">Holy Order General Conference</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ₦{nationalFee.toLocaleString()}.00
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                        isLeviesCleared
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      }`}>
                        {isLeviesCleared ? 'Cleared ✓' : 'Pending'}
                      </span>
                    </td>
                  </tr>

                  <tr className="bg-slate-50 dark:bg-slate-900/80 font-bold text-sm">
                    <td colSpan={2} className="py-3.5 px-4 text-slate-900 dark:text-white">
                      Total Statutory Ordination Fees
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-700 dark:text-amber-400 font-extrabold text-base">
                      ₦{totalLevy.toLocaleString()}.00
                    </td>
                    <td className={`py-3.5 px-4 text-right text-xs font-mono font-bold ${
                      isLeviesCleared ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {isLeviesCleared ? 'Paid in Full ✓' : `₦${outstandingLevy.toLocaleString()} Pending`}
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
          
          {!isCeremonyReady ? (
            <div className="bg-white dark:bg-[#0b1021] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
                  Ceremony Pass & Chancel Seating In Preparation
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
                  Your Digital Gate 2 Fast-Track Barcode and Reserved Chancel Pew allocation will unlock automatically once all five clearance stages are ratified and statutory levies are verified.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-left">
                <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Vetting Status</span>
                  <span className={`font-bold ${completedCount === 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {completedCount} of 5 Approved
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Statutory Dues</span>
                  <span className={`font-bold ${isLeviesCleared ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {isLeviesCleared ? 'Settled ✓' : 'Pending'}
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Pew Allocation</span>
                  <span className="font-bold text-slate-500">
                    {candidate.seatNumber || 'Pending Seal'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  variant="gold"
                  size="md"
                  onClick={() => setCurrentTab('clearance')}
                  className="font-bold text-xs"
                >
                  View Clearance Roadmap →
                </Button>
                {!isLeviesCleared && (
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setCurrentTab('payments')}
                    className="font-bold text-xs border-slate-300 dark:border-slate-700"
                  >
                    Settle Statutory Dues →
                  </Button>
                )}
              </div>
            </div>
          ) : (
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
                    <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80 space-y-1.5 min-w-0 overflow-hidden">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 truncate block">
                        Chancel Pew Assignment
                      </span>
                      <div className="text-lg font-bold text-purple-950 dark:text-white truncate">
                        {candidate.seatNumber || 'Pending Allocation'}
                      </div>
                      <p className="text-xs text-purple-800/80 dark:text-purple-300/80 break-words">
                        Reserved candidate front section (Chancel East Wing).
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 space-y-1.5 min-w-0 overflow-hidden">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 truncate block">
                        Fast-Track Entry Gate
                      </span>
                      <div className="text-lg font-bold text-blue-950 dark:text-white truncate">
                        Gate 2 &bull; East Portico
                      </div>
                      <p className="text-xs text-blue-800/80 dark:text-blue-300/80 break-words">
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
                        <span className="text-slate-500 text-[11px]">{candidate.seatNumber ? `${candidate.seatNumber} Entry` : 'Reserved Pew Entry'}</span>
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
          )}

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
                        className={`p-3.5 rounded-2xl max-w-md min-w-0 overflow-hidden break-words ${
                          msg.senderRole === 'candidate'
                            ? 'ml-auto bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-sm'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-tl-none shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] opacity-75 mb-1 gap-2">
                          <span className="font-bold truncate">{msg.senderName}</span>
                          <span className="font-mono shrink-0">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="leading-relaxed break-words">{msg.content}</p>
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

      {/* Automated Stage Pre-Check Audit Modal */}
      {showPrecheckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-slate-100 my-6">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Automated Candidate Pre-Check
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Canonical readiness audit for Stage {currentStageIndex}: {currentStageInfo?.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrecheckModal(false)}
                className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-bold">Automated Audit Passed: 100% Eligible</span>
                </div>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50">
                  Ready for Review
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-white">Canonical Roll & Identification</span>
                    <span className="text-[11px] text-slate-500">{candidate.regNumber} • {candidate.fullName}</span>
                  </div>
                  <span className="text-emerald-600 font-bold font-mono">Passed ✓</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-white">Rank Progression Rule</span>
                    <span className="text-[11px] text-slate-500">{candidate.currentRank} → {candidate.targetRankName}</span>
                  </div>
                  <span className="text-emerald-600 font-bold font-mono">Compliant ✓</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-white">Church Jurisdiction Verification</span>
                    <span className="text-[11px] text-slate-500">{candidate.province} • {candidate.parish}</span>
                  </div>
                  <span className="text-emerald-600 font-bold font-mono">Verified ✓</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-white">Liturgical Attire & Documentation</span>
                    <span className="text-[11px] text-slate-500">{candidate.passportPhotoUrl ? 'Passport Photo Stamped' : 'Attire Specification Met'}</span>
                  </div>
                  <span className="text-emerald-600 font-bold font-mono">Valid ✓</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrecheckModal(false)}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer text-center"
                >
                  Close Pre-Check Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
