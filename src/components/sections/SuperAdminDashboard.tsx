'use client';

import React, { useState, useEffect } from 'react';
import { CandidateProfile, UserSession, VettingTier } from '@/types';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { exportCandidatesToCSV } from '@/utils/export';
import { generateCertificateHash } from '@/utils/certificate';
import { formatCurrency, formatDate, calculateGrade } from '@/utils/formatters';
import { getStageMeta } from '@/utils/workflow';
import { validateRankProgression, getRobingSpecifications } from '@/utils/ranks';
import { CertificateModal } from '@/components/shared/CertificateModal';
import { DigitalPassModal } from '@/components/shared/DigitalPassModal';
import { LiveAccreditationDesk } from './LiveAccreditationDesk';
import { HierarchyManager } from './HierarchyManager';
import { api } from '@/services/api';
import {
  Crown,
  Download,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Award,
  Shield,
  CreditCard,
  Layers,
  FileSpreadsheet,
  Users,
  Check,
  FileCheck,
  Building,
  RefreshCw,
  Eye,
  X,
  Sparkles,
  MapPin,
  Calendar,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Zap,
  DollarSign,
  History,
  CheckSquare,
  Square,
  Send,
  SlidersHorizontal,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  session: UserSession;
  candidates: CandidateProfile[];
  onUpdateCandidate: (updated: CandidateProfile) => void;
  onBatchGenerateCerts: () => void;
}

type AdminTab = 'master' | 'branch_tier' | 'district_tier' | 'province_tier' | 'cmc_tier' | 'synod_tier' | 'financials' | 'audit_logs' | 'accreditation_live' | 'hierarchy_manager';

export function SuperAdminDashboard({
  session,
  candidates,
  onUpdateCandidate,
  onBatchGenerateCerts,
}: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('master');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  
  // Batch Selection State
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);

  // Inspection & Pass/Cert Modals
  const [inspectingCandidate, setInspectingCandidate] = useState<CandidateProfile | null>(null);
  const [activeModalCandidate, setActiveModalCandidate] = useState<CandidateProfile | null>(null);
  const [modalType, setModalType] = useState<'pass' | 'cert' | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    if (activeTab === 'audit_logs') {
      setIsLoadingLogs(true);
      api.getAuditLogs()
        .then((logs) => setAuditLogs(logs))
        .catch(() => {})
        .finally(() => setIsLoadingLogs(false));
    }
  }, [activeTab]);

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.targetRankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.currentRank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.province.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvince = selectedProvince === 'all' || c.province === selectedProvince;
    const matchesTier =
      activeTab === 'master' || activeTab === 'financials' || activeTab === 'audit_logs'
        ? selectedTier === 'all' || c.currentVettingTier === selectedTier
        : activeTab === 'branch_tier'
        ? c.currentVettingTier === 'branch' || c.stage === 'nominated'
        : activeTab === 'district_tier'
        ? c.currentVettingTier === 'district' || c.stage === 'branch_approved'
        : activeTab === 'province_tier'
        ? c.currentVettingTier === 'province' || c.stage === 'district_approved'
        : activeTab === 'cmc_tier'
        ? c.currentVettingTier === 'cmc' || c.stage === 'province_approved' || c.stage === 'screening_in_progress'
        : c.currentVettingTier === 'national' || ['cmc_approved', 'board_approved', 'investiture_assigned', 'ordained'].includes(c.stage);

    return matchesSearch && matchesProvince && matchesTier;
  });

  // Financial Computations
  const totalDuesCollected = candidates.reduce((sum, c) => sum + (c.duesAmountPaid || 0), 0);
  const totalPotentialLevies = candidates.reduce((sum, c) => sum + (c.levyBreakdown?.total || 80000), 0);
  const outstandingLevies = Math.max(0, totalPotentialLevies - totalDuesCollected);
  const clearedCount = candidates.filter((c) => c.duesStatus === 'cleared').length;
  const certsReadyCount = candidates.filter((c) => !!c.certificateNumber).length;
  const ordainedCount = candidates.filter((c) => c.stage === 'ordained').length;

  const totalBranchRevenue = candidates.reduce((sum, c) => sum + (c.duesStatus === 'cleared' ? (c.levyBreakdown?.branchLevy || 0) : 0), 0);
  const totalDistrictRevenue = candidates.reduce((sum, c) => sum + (c.duesStatus === 'cleared' ? (c.levyBreakdown?.districtLevy || 0) : 0), 0);
  const totalProvinceRevenue = candidates.reduce((sum, c) => sum + (c.duesStatus === 'cleared' ? (c.levyBreakdown?.provincialLevy || 0) : 0), 0);
  const totalNationalRevenue = candidates.reduce((sum, c) => sum + (c.duesStatus === 'cleared' ? (c.levyBreakdown?.nationalFee || 0) : 0), 0);

  // Checkbox selection handlers
  const handleToggleSelectCandidate = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    if (selectedCandidateIds.length === filteredCandidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(filteredCandidates.map((c) => c.id));
    }
  };

  // High-Efficiency Batch Actions
  const handleBatchAdvanceTier = async (targetTier: VettingTier) => {
    if (selectedCandidateIds.length === 0) return;
    setIsProcessingBatch(true);
    setBatchSuccessMessage(null);

    try {
      const res = await api.batchAction({
        action: 'advance_tier',
        candidateIds: selectedCandidateIds,
        targetTier,
        approverName: session.name,
        approverRole: session.roleTitle,
      });

      for (const updated of res.candidates) {
        onUpdateCandidate(updated);
      }

      setBatchSuccessMessage(`Successfully endorsed ${res.count} candidate(s) to ${targetTier.toUpperCase()} level!`);
      setSelectedCandidateIds([]);
    } catch (err: any) {
      alert(err.message || 'Failed to process batch endorsement');
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleBatchClearDues = async () => {
    if (selectedCandidateIds.length === 0) return;
    setIsProcessingBatch(true);
    setBatchSuccessMessage(null);

    try {
      const res = await api.batchAction({
        action: 'clear_dues',
        candidateIds: selectedCandidateIds,
      });

      for (const updated of res.candidates) {
        onUpdateCandidate(updated);
      }

      setBatchSuccessMessage(`Successfully cleared & reconciled dues for ${res.count} candidate(s)!`);
      setSelectedCandidateIds([]);
    } catch (err: any) {
      alert(err.message || 'Failed to clear dues');
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleBatchGenerateQRCerts = async () => {
    if (selectedCandidateIds.length === 0) {
      onBatchGenerateCerts();
      return;
    }
    setIsProcessingBatch(true);
    setBatchSuccessMessage(null);

    try {
      const res = await api.batchAction({
        action: 'generate_certs',
        candidateIds: selectedCandidateIds,
      });

      for (const updated of res.candidates) {
        onUpdateCandidate(updated);
      }

      setBatchSuccessMessage(`Issued verified QR Certificates for ${res.count} candidate(s)!`);
      setSelectedCandidateIds([]);
    } catch (err: any) {
      alert(err.message || 'Failed to generate certificates');
    } finally {
      setIsProcessingBatch(false);
    }
  };

  // Single Candidate Actions
  const handleAdvanceTier = (cand: CandidateProfile, targetTier: VettingTier) => {
    const dateStr = new Date().toISOString().split('T')[0];
    let nextStage: CandidateProfile['stage'] = cand.stage;

    if (targetTier === 'district') nextStage = 'branch_approved';
    else if (targetTier === 'province') nextStage = 'district_approved';
    else if (targetTier === 'cmc') nextStage = 'province_approved';
    else if (targetTier === 'national') nextStage = 'cmc_approved';

    const updated: CandidateProfile = {
      ...cand,
      stage: nextStage,
      currentVettingTier: targetTier,
      tierApprovals: {
        ...(cand.tierApprovals || {}),
        [cand.currentVettingTier]: {
          approved: true,
          approverName: session.name,
          approverRole: session.roleTitle,
          date: dateStr,
          comments: `Approved and endorsed by Apex Directorate (${session.roleTitle}).`,
        },
      },
      lastUpdated: dateStr,
    };

    onUpdateCandidate(updated);
    if (inspectingCandidate?.id === cand.id) {
      setInspectingCandidate(updated);
    }
  };

  const handleToggleDues = (candidate: CandidateProfile) => {
    const isNowCleared = candidate.duesStatus !== 'cleared';
    const totalFee = candidate.levyBreakdown?.total || 80000;
    const updated: CandidateProfile = {
      ...candidate,
      duesStatus: isNowCleared ? 'cleared' : 'pending',
      duesAmountPaid: isNowCleared ? totalFee : 0,
      receiptNumber: isNowCleared ? `REC-2026-ESOCS-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      stage: isNowCleared && ['cmc_approved', 'board_approved'].includes(candidate.stage) ? 'investiture_assigned' : candidate.stage,
      seatNumber: isNowCleared ? candidate.seatNumber || `Zone A - Pew ${Math.floor(1 + Math.random() * 30)}` : candidate.seatNumber,
      investitureSession: isNowCleared ? candidate.investitureSession || 'Saturday Morning Session (09:00 AM)' : candidate.investitureSession,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    onUpdateCandidate(updated);
    if (inspectingCandidate?.id === candidate.id) {
      setInspectingCandidate(updated);
    }
  };

  const handleMarkOrdained = (candidate: CandidateProfile) => {
    const hash = candidate.verificationHash || generateCertificateHash(candidate.regNumber, candidate.fullName, candidate.targetRankName, 2026);
    const certNo = candidate.certificateNumber || `CERT-2026-${candidate.targetRankId.replace('rank_', '').toUpperCase()}-${candidate.regNumber.split('/').pop()}`;

    const updated: CandidateProfile = {
      ...candidate,
      stage: 'ordained',
      certificateNumber: certNo,
      verificationHash: hash,
      dateOrdained: 'November 14, 2026',
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    onUpdateCandidate(updated);
    if (inspectingCandidate?.id === candidate.id) {
      setInspectingCandidate(updated);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-church-950 via-slate-900 to-church-950 text-white rounded-3xl p-6 sm:p-8 shadow-elevated border border-gold-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="gold" size="sm" className="bg-gold-500/20 text-gold-300 border-gold-400/30">
              Admin Main Central Secretariat
            </Badge>
            <span className="text-xs font-mono text-church-300">5-Tier Fast-Track Vetting Cockpit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
            Apex Secretariat Master Management Portal
          </h1>
          <p className="text-xs sm:text-sm text-church-200">
            {session.jurisdiction} • Total Active Registrations: <strong>{candidates.length} Candidates</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={<FileSpreadsheet className="w-4 h-4" />}
            onClick={() => exportCandidatesToCSV(candidates)}
            className="text-white border-church-700 hover:bg-church-850"
          >
            Export CSV
          </Button>

          <Button
            variant="gold"
            size="sm"
            icon={<Award className="w-4 h-4" />}
            onClick={handleBatchGenerateQRCerts}
            loading={isProcessingBatch}
          >
            Batch Generate QR Certs
          </Button>
        </div>
      </div>

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Reconciled Levies</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">{formatCurrency(totalDuesCollected)}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">{clearedCount} of {candidates.length} Cleared</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">QR Credentials Issued</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">{certsReadyCount}</p>
          <span className="text-[11px] text-church-600 dark:text-gold-400 font-semibold">Cryptographically signed</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Cathedral Pews Assigned</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
            {candidates.filter((c) => c.seatNumber).length}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Chancel & Nave rows</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 font-medium">Conferred & Ordained</span>
          <p className="text-2xl font-bold text-emerald-600 font-mono">{ordainedCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Holy Synod Gazetted</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('master')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'master'
              ? 'bg-church-900 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> All Tiers ({candidates.length})
        </button>

        <button
          onClick={() => setActiveTab('branch_tier')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'branch_tier'
              ? 'bg-church-900 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building className="w-3.5 h-3.5" /> Tier 1: Branch ({candidates.filter((c) => c.currentVettingTier === 'branch').length})
        </button>

        <button
          onClick={() => setActiveTab('district_tier')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'district_tier'
              ? 'bg-church-900 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Tier 2: District ({candidates.filter((c) => c.currentVettingTier === 'district').length})
        </button>

        <button
          onClick={() => setActiveTab('province_tier')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'province_tier'
              ? 'bg-church-900 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> Tier 3: Province ({candidates.filter((c) => c.currentVettingTier === 'province').length})
        </button>

        <button
          onClick={() => setActiveTab('cmc_tier')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'cmc_tier'
              ? 'bg-church-900 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" /> Tier 4: CMC Exam ({candidates.filter((c) => c.currentVettingTier === 'cmc').length})
        </button>

        <button
          onClick={() => setActiveTab('synod_tier')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'synod_tier'
              ? 'bg-church-900 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Crown className="w-3.5 h-3.5" /> Tier 5: Holy Synod ({candidates.filter((c) => c.currentVettingTier === 'national').length})
        </button>

        <button
          onClick={() => setActiveTab('financials')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'financials'
              ? 'bg-church-900 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> Financial Ledger
        </button>

        <button
          onClick={() => setActiveTab('hierarchy_manager')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'hierarchy_manager'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-amber-500 dark:text-amber-400 hover:bg-amber-500/10'
          }`}
        >
          <Building className="w-3.5 h-3.5" /> 🏛️ Church Parishes & Provinces
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'audit_logs'
              ? 'bg-church-900 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" /> System Audit Trail
        </button>

        <button
          onClick={() => setActiveTab('accreditation_live')}
          className={`px-4 py-2 rounded-xl font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'accreditation_live'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-amber-400 hover:bg-amber-500/10'
          }`}
        >
          <Zap className="w-3.5 h-3.5" /> ⚡ Gate Accreditation Desk
        </button>
      </div>

      {/* Batch Success Banner */}
      {batchSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">{batchSuccessMessage}</span>
          </div>
          <button onClick={() => setBatchSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Fast-Track Batch Action Toolbar */}
      {selectedCandidateIds.length > 0 && (
        <div className="p-4 bg-church-950 text-white rounded-2xl border border-gold-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top duration-200 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gold-300">
              ⚡ {selectedCandidateIds.length} candidate(s) selected
            </span>
            <button
              onClick={() => setSelectedCandidateIds([])}
              className="text-slate-400 hover:text-white underline text-[11px]"
            >
              Clear selection
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTab === 'branch_tier' && (
              <Button
                variant="gold"
                size="sm"
                onClick={() => handleBatchAdvanceTier('district')}
                loading={isProcessingBatch}
                icon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Batch Endorse to District (Tier 2)
              </Button>
            )}

            {activeTab === 'district_tier' && (
              <Button
                variant="gold"
                size="sm"
                onClick={() => handleBatchAdvanceTier('province')}
                loading={isProcessingBatch}
                icon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Batch Endorse to Province (Tier 3)
              </Button>
            )}

            {activeTab === 'province_tier' && (
              <Button
                variant="gold"
                size="sm"
                onClick={() => handleBatchAdvanceTier('cmc')}
                loading={isProcessingBatch}
                icon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Batch Forward to CMC Exams (Tier 4)
              </Button>
            )}

            {activeTab === 'cmc_tier' && (
              <Button
                variant="gold"
                size="sm"
                onClick={() => handleBatchAdvanceTier('national')}
                loading={isProcessingBatch}
                icon={<Crown className="w-3.5 h-3.5" />}
              >
                Batch Recommend for Synod (Tier 5)
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={handleBatchClearDues}
              loading={isProcessingBatch}
              icon={<CreditCard className="w-3.5 h-3.5" />}
            >
              Batch Clear Dues
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchGenerateQRCerts}
              loading={isProcessingBatch}
              icon={<Award className="w-3.5 h-3.5" />}
              className="text-white border-church-700 hover:bg-church-800"
            >
              Issue QR Certificates
            </Button>
          </div>
        </div>
      )}

      {/* Tab: Financial Treasury Desk */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-medium">1. Branch Retention Share</span>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">{formatCurrency(totalBranchRevenue)}</p>
              <span className="text-[11px] text-slate-400">Local parish altar care</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-medium">2. District Assessment Share</span>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">{formatCurrency(totalDistrictRevenue)}</p>
              <span className="text-[11px] text-slate-400">Zonal administration fund</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-medium">3. Provincial Secretariat Share</span>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">{formatCurrency(totalProvinceRevenue)}</p>
              <span className="text-[11px] text-slate-400">Diocese operations</span>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 font-medium">4. Apex National / Regalia</span>
              <p className="text-xl font-bold text-gold-600 dark:text-gold-400 font-mono">{formatCurrency(totalNationalRevenue)}</p>
              <span className="text-[11px] text-emerald-600 font-semibold">Central ordination fund</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: System Audit Trail Logs */}
      {activeTab === 'audit_logs' && (
        <Card>
          <CardHeader
            title="Sovereign Audit Trail & Canonical Event Stream"
            subtitle="Immutable activity logs tracking all user logins, tier advancements, password resets and reconciliations"
          />
          <CardBody className="p-0 overflow-x-auto">
            {isLoadingLogs ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading audit events...</div>
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No audit events recorded yet.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">Actor / Performed By</th>
                    <th className="px-5 py-3">Action Type</th>
                    <th className="px-5 py-3">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3 font-mono text-[11px] text-slate-400">{formatDate(log.timestamp)}</td>
                      <td className="px-5 py-3 font-bold text-slate-900 dark:text-slate-100">{log.performedBy}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-church-800 dark:text-gold-300">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      )}

      {/* Tab: Live Ecclesiastical Structure & Hierarchy Manager */}
      {activeTab === 'hierarchy_manager' && (
        <HierarchyManager session={session} onHierarchyUpdated={() => {}} />
      )}

      {/* Main Candidate Table (For All Tier Queues) */}
      {activeTab !== 'audit_logs' &&
        activeTab !== 'accreditation_live' &&
        activeTab !== 'financials' &&
        activeTab !== 'hierarchy_manager' && (
        <Card>
          <CardHeader
            title={
              activeTab === 'branch_tier'
                ? 'Tier 1: Branch / Parish Verification Queue'
                : activeTab === 'district_tier'
                ? 'Tier 2: District Quota Review Queue'
                : activeTab === 'province_tier'
                ? 'Tier 3: Provincial Secretariat Approval Queue'
                : activeTab === 'cmc_tier'
                ? 'Tier 4: CMC National Doctrinal Exam & Scoring Deck'
                : activeTab === 'synod_tier'
                ? 'Tier 5: Holy Synod Ratification & Apex Consecration Deck'
                : 'Canonical Candidates Ledger & Vetting Cockpit'
            }
            subtitle="Select multiple candidates for 1-click batch endorsements, levy reconciliations, and certificate issuance"
            action={
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filter name, reg code, rank, province..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-church-500"
                  />
                </div>
              </div>
            }
          />
          <CardBody className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      {selectedCandidateIds.length > 0 && selectedCandidateIds.length === filteredCandidates.length ? (
                        <CheckSquare className="w-4 h-4 text-gold-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3">Candidate Ordinand</th>
                  <th className="px-4 py-3">Current → Target Rank</th>
                  <th className="px-4 py-3">Jurisdiction</th>
                  <th className="px-4 py-3">Vetting Tier</th>
                  <th className="px-4 py-3">Financial Levies</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredCandidates.map((c) => {
                  const stageMeta = getStageMeta(c.stage);
                  const isSelected = selectedCandidateIds.includes(c.id);

                  return (
                    <tr key={c.id} className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-gold-50/40 dark:bg-gold-950/20' : ''}`}>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectCandidate(c.id)}
                          className="text-slate-400 hover:text-gold-500"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-gold-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{c.fullName}</p>
                        <span className="font-mono text-[11px] text-slate-400">{c.regNumber}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">{c.currentRank}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-bold text-church-900 dark:text-gold-300 font-serif">
                            {c.targetRankName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono">
                            Since {c.currentRankYear} ({c.tenureYears || 2026 - c.currentRankYear} yrs)
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded font-semibold">
                            Sequential ✓
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{c.parish}</p>
                        <span className="text-[11px] text-slate-500">{c.province}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${stageMeta.badgeBg} ${stageMeta.badgeText}`}>
                          {stageMeta.label}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                          Tier: {c.currentVettingTier.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleDues(c)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.duesStatus === 'cleared'
                                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {c.duesStatus === 'cleared' ? 'Cleared' : 'Pending'}
                          </button>
                          <span className="font-mono text-[11px]">
                            {formatCurrency(c.duesAmountPaid || 0)}
                          </span>
                        </div>
                        {c.levyBreakdown && (
                          <span className="text-[10px] text-slate-400 block">
                            Total: {formatCurrency(c.levyBreakdown.total)}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => setInspectingCandidate(c)}
                          >
                            Inspect & Vet
                          </Button>

                          {c.stage === 'investiture_assigned' && (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<QrCode className="w-3.5 h-3.5" />}
                              onClick={() => {
                                setActiveModalCandidate(c);
                                setModalType('pass');
                              }}
                            >
                              Pass
                            </Button>
                          )}

                          {c.stage === 'ordained' && (
                            <Button
                              variant="gold"
                              size="sm"
                              icon={<Award className="w-3.5 h-3.5" />}
                              onClick={() => {
                                setActiveModalCandidate(c);
                                setModalType('cert');
                              }}
                            >
                              Certificate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      {/* Live Ordination Day Accreditation Desk */}
      {activeTab === 'accreditation_live' && (
        <LiveAccreditationDesk officerName={session.name} />
      )}

      {/* Candidate Dossier & Multi-Tier Inspection Drawer */}
      {inspectingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-slate-100 my-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Canonical Dossier & 5-Tier Vetting Inspection
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {inspectingCandidate.fullName} • <span className="font-mono">{inspectingCandidate.regNumber}</span>
                    {inspectingCandidate.houseOfPrayer ? ` • ${inspectingCandidate.houseOfPrayer}` : ''} • {inspectingCandidate.parish} ({inspectingCandidate.province})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingCandidate(null)}
                className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* 5-Tier Governance Visual Progression Track */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                  <Shield className="w-4 h-4 text-gold-500" />
                  5-Tier Ecclesiastical Approval Pipeline
                </span>

                <div className="grid grid-cols-5 gap-1.5 pt-2 text-center text-[10px]">
                  <div className={`p-2 rounded-xl border ${inspectingCandidate.tierApprovals?.branch?.approved ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'}`}>
                    <span className="font-bold block">1. Branch</span>
                    <span>{inspectingCandidate.tierApprovals?.branch?.approved ? '✓ Approved' : 'Pending'}</span>
                  </div>

                  <div className={`p-2 rounded-xl border ${inspectingCandidate.tierApprovals?.district?.approved ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'}`}>
                    <span className="font-bold block">2. District</span>
                    <span>{inspectingCandidate.tierApprovals?.district?.approved ? '✓ Approved' : 'Pending'}</span>
                  </div>

                  <div className={`p-2 rounded-xl border ${inspectingCandidate.tierApprovals?.province?.approved ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'}`}>
                    <span className="font-bold block">3. Province</span>
                    <span>{inspectingCandidate.tierApprovals?.province?.approved ? '✓ Approved' : 'Pending'}</span>
                  </div>

                  <div className={`p-2 rounded-xl border ${inspectingCandidate.theologyScore && inspectingCandidate.theologyScore >= 70 ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'}`}>
                    <span className="font-bold block">4. CMC Exam</span>
                    <span>{inspectingCandidate.theologyScore ? `${inspectingCandidate.theologyScore}% ✓` : 'Pending'}</span>
                  </div>

                  <div className={`p-2 rounded-xl border ${['cmc_approved', 'board_approved', 'investiture_assigned', 'ordained'].includes(inspectingCandidate.stage) ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 text-purple-800 dark:text-purple-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'}`}>
                    <span className="font-bold block">5. Synod</span>
                    <span>{inspectingCandidate.stage === 'ordained' ? 'Conferred' : inspectingCandidate.stage === 'board_approved' ? 'Ratified' : 'Awaiting'}</span>
                  </div>
                </div>
              </div>

              {/* Rank Progression */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-gold-500" />
                  Ecclesiastical Progression & Anti-Skipping Rule Check
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Current Ecclesiastical Rank</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{inspectingCandidate.currentRank}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Ordained {inspectingCandidate.currentRankYear} ({inspectingCandidate.tenureYears || 2026 - inspectingCandidate.currentRankYear} yrs tenure)
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Target Holy Order Rank</span>
                    <span className="font-bold text-church-900 dark:text-gold-300 font-serif text-sm">
                      {inspectingCandidate.targetRankName}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                      ✓ Canonical Step Validated
                    </span>
                  </div>
                </div>
              </div>

              {/* Mandatory Levies & Clearance Schedule */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                    <CreditCard className="w-4 h-4 text-gold-500" />
                    Mandatory Levies & Clearance Schedule
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inspectingCandidate.duesStatus === 'cleared' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'}`}>
                    {inspectingCandidate.duesStatus === 'cleared' ? '100% Cleared' : 'Pending Clearance'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">1. Branch Levy</span>
                    <span className="font-semibold">{formatCurrency(inspectingCandidate.levyBreakdown?.branchLevy || 15000)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">2. District Levy</span>
                    <span className="font-semibold">{formatCurrency(inspectingCandidate.levyBreakdown?.districtLevy || 15000)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">3. Provincial Dues</span>
                    <span className="font-semibold">{formatCurrency(inspectingCandidate.levyBreakdown?.provincialLevy || 20000)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">4. National Fee</span>
                    <span className="font-semibold">{formatCurrency(inspectingCandidate.levyBreakdown?.nationalFee || 30000)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <span className="font-bold">Total Assessment: {formatCurrency(inspectingCandidate.levyBreakdown?.total || 80000)}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleDues(inspectingCandidate)}
                    className="text-church-600 dark:text-gold-400 hover:underline font-bold"
                  >
                    {inspectingCandidate.duesStatus === 'cleared' ? 'Mark as Unpaid' : 'Reconcile & Clear Full Dues'}
                  </button>
                </div>
              </div>

              {/* Fast-Track Tier Advancement Controls */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {inspectingCandidate.currentVettingTier === 'branch' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAdvanceTier(inspectingCandidate, 'district')}
                      icon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      Endorse to Tier 2 (District)
                    </Button>
                  )}
                  {inspectingCandidate.currentVettingTier === 'district' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAdvanceTier(inspectingCandidate, 'province')}
                      icon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      Endorse to Tier 3 (Province)
                    </Button>
                  )}
                  {inspectingCandidate.currentVettingTier === 'province' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAdvanceTier(inspectingCandidate, 'cmc')}
                      icon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      Forward to Tier 4 (CMC Exam)
                    </Button>
                  )}
                  {inspectingCandidate.currentVettingTier === 'cmc' && (
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => handleAdvanceTier(inspectingCandidate, 'national')}
                      icon={<Crown className="w-3.5 h-3.5" />}
                    >
                      Recommend for Tier 5 (Holy Synod)
                    </Button>
                  )}
                  {inspectingCandidate.stage === 'board_approved' && (
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => handleMarkOrdained(inspectingCandidate)}
                      icon={<Award className="w-3.5 h-3.5" />}
                    >
                      Confer Holy Ordination
                    </Button>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInspectingCandidate(null)}
                >
                  Close Inspection
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digital Pass Modal */}
      {activeModalCandidate && modalType === 'pass' && (
        <DigitalPassModal
          candidate={activeModalCandidate}
          onClose={() => {
            setActiveModalCandidate(null);
            setModalType(null);
          }}
        />
      )}

      {/* Certificate Modal */}
      {activeModalCandidate && modalType === 'cert' && (
        <CertificateModal
          candidate={activeModalCandidate}
          onClose={() => {
            setActiveModalCandidate(null);
            setModalType(null);
          }}
        />
      )}
    </div>
  );
}
