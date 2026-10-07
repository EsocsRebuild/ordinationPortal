'use client';

import React, { useState } from 'react';
import { CandidateProfile, UserSession, VettingTier } from '@/types';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { exportCandidatesToCSV } from '@/utils/export';
import { generateCertificateHash } from '@/utils/certificate';
import { formatCurrency, formatDate, calculateGrade } from '@/utils/formatters';
import { getStageMeta } from '@/utils/workflow';
import { validateRankProgression } from '@/utils/ranks';
import { CertificateModal } from '@/components/shared/CertificateModal';
import { DigitalPassModal } from '@/components/shared/DigitalPassModal';
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
} from 'lucide-react';

interface SuperAdminDashboardProps {
  session: UserSession;
  candidates: CandidateProfile[];
  onUpdateCandidate: (updated: CandidateProfile) => void;
  onBatchGenerateCerts: () => void;
}

type AdminTab = 'master' | 'branch_tier' | 'district_tier' | 'province_tier' | 'cmc_tier' | 'synod_tier';

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
  
  // Inspection Modal State
  const [inspectingCandidate, setInspectingCandidate] = useState<CandidateProfile | null>(null);
  const [activeModalCandidate, setActiveModalCandidate] = useState<CandidateProfile | null>(null);
  const [modalType, setModalType] = useState<'pass' | 'cert' | null>(null);

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.targetRankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.currentRank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.province.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvince = selectedProvince === 'all' || c.province === selectedProvince;
    const matchesTier =
      activeTab === 'master'
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

  const totalDuesCollected = candidates.reduce((sum, c) => sum + (c.duesAmountPaid || 0), 0);
  const clearedCount = candidates.filter((c) => c.duesStatus === 'cleared').length;
  const certsReadyCount = candidates.filter((c) => !!c.certificateNumber).length;
  const ordainedCount = candidates.filter((c) => c.stage === 'ordained').length;

  // Advance candidate through the 5 tiers
  const handleAdvanceTier = (cand: CandidateProfile, targetTier: VettingTier) => {
    const dateStr = new Date().toISOString().split('T')[0];
    const approver = session.name;

    let nextStage: CandidateProfile['stage'] = cand.stage;
    let nextTier: VettingTier = targetTier;

    if (targetTier === 'district') {
      nextStage = 'branch_approved';
    } else if (targetTier === 'province') {
      nextStage = 'district_approved';
    } else if (targetTier === 'cmc') {
      nextStage = 'province_approved';
    } else if (targetTier === 'national') {
      nextStage = 'cmc_approved';
    }

    const updatedApprovals = {
      ...(cand.tierApprovals || {}),
      [cand.currentVettingTier]: {
        approved: true,
        approverName: approver,
        date: dateStr,
        comments: `Approved and endorsed by Apex Directorate (${session.roleTitle}).`,
      },
    };

    const updated: CandidateProfile = {
      ...cand,
      stage: nextStage,
      currentVettingTier: nextTier,
      tierApprovals: updatedApprovals,
      lastUpdated: dateStr,
    };

    onUpdateCandidate(updated);
    if (inspectingCandidate?.id === cand.id) {
      setInspectingCandidate(updated);
    }
  };

  const handleToggleDues = (candidate: CandidateProfile) => {
    const isNowCleared = candidate.duesStatus !== 'cleared';
    const totalFee = candidate.levyBreakdown?.total || 85000;
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
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-church-950 text-white rounded-2xl p-6 sm:p-8 shadow-card border border-church-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="gold" size="sm" className="bg-gold-500/20 text-gold-300 border-gold-400/30">
              Admin Main Central Secretariat
            </Badge>
            <span className="text-xs font-mono text-church-300">5-Tier Canonical Vetting Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
            Apex Secretariat Master Management Portal
          </h1>
          <p className="text-xs sm:text-sm text-church-300">
            {session.jurisdiction} • Total Active Registrations: <strong>{candidates.length} Candidates</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={<FileSpreadsheet className="w-4 h-4" />}
            onClick={() => exportCandidatesToCSV(candidates)}
            className="text-white border-church-800 hover:bg-church-900"
          >
            Export Master CSV
          </Button>

          <Button
            variant="gold"
            size="sm"
            icon={<Award className="w-4 h-4" />}
            onClick={onBatchGenerateCerts}
          >
            Batch Generate QR Certificates
          </Button>
        </div>
      </div>

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Reconciled Levies</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{formatCurrency(totalDuesCollected)}</p>
          <span className="text-[11px] text-emerald-600 font-medium">{clearedCount} of {candidates.length} Cleared</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">QR Credentials Issued</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{certsReadyCount}</p>
          <span className="text-[11px] text-church-600 dark:text-gold-400">Cryptographically signed</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Seating & Pews Allocated</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {candidates.filter((c) => c.seatNumber).length}
          </p>
          <span className="text-[11px] text-slate-500">Chancel & Nave zones</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Conferred & Ordained</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{ordainedCount}</p>
          <span className="text-[11px] text-emerald-600">Holy Synod Gazetted</span>
        </div>
      </div>

      {/* 5-Tier Canonical Vetting Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('master')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'master'
              ? 'bg-church-900 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> All Tiers ({candidates.length})
        </button>

        <button
          onClick={() => setActiveTab('branch_tier')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'branch_tier'
              ? 'bg-church-900 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building className="w-3.5 h-3.5" /> Tier 1: Branch / Parish ({candidates.filter((c) => c.currentVettingTier === 'branch').length})
        </button>

        <button
          onClick={() => setActiveTab('district_tier')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'district_tier'
              ? 'bg-church-900 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Tier 2: District ({candidates.filter((c) => c.currentVettingTier === 'district').length})
        </button>

        <button
          onClick={() => setActiveTab('province_tier')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'province_tier'
              ? 'bg-church-900 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> Tier 3: Province ({candidates.filter((c) => c.currentVettingTier === 'province').length})
        </button>

        <button
          onClick={() => setActiveTab('cmc_tier')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'cmc_tier'
              ? 'bg-church-900 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" /> Tier 4: CMC Exam Screening ({candidates.filter((c) => c.currentVettingTier === 'cmc').length})
        </button>

        <button
          onClick={() => setActiveTab('synod_tier')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === 'synod_tier'
              ? 'bg-church-900 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Crown className="w-3.5 h-3.5" /> Tier 5: Holy Synod Ratified ({candidates.filter((c) => c.currentVettingTier === 'national').length})
        </button>
      </div>

      {/* Main Ledger Table */}
      <Card>
        <CardHeader
          title="Canonical Candidates Ledger & Vetting Cockpit"
          subtitle="Real-time multi-diocese tracking with strict sequential rank validation and financial audit"
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
                const rankVal = validateRankProgression(c.currentRank, c.targetRankName, c.gender, c.currentRankYear);

                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
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
                        {rankVal.isValid ? (
                          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded font-semibold">
                            Sequential
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded font-semibold">
                            Order Flag
                          </span>
                        )}
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

      {/* Comprehensive Candidate Multi-Tier Vetting & Financial Clearance Modal */}
      {inspectingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-premium overflow-hidden transition-all text-slate-900 dark:text-slate-100 my-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-church-900 text-gold-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-church-950 dark:text-white">
                    Canonical Dossier & 5-Tier Vetting Inspection
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {inspectingCandidate.fullName} • {inspectingCandidate.regNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingCandidate(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* 5-Tier Governance Visual Progression Track */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                  <Shield className="w-4 h-4 text-gold-500" />
                  5-Tier Ecclesiastical Approval Pipeline
                </span>

                <div className="grid grid-cols-5 gap-1.5 pt-2 text-center text-[10px]">
                  {/* Tier 1: Branch */}
                  <div className={`p-2 rounded-xl border ${inspectingCandidate.tierApprovals?.branch?.approved ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'}`}>
                    <span className="font-bold block">1. Branch</span>
                    <span>{inspectingCandidate.tierApprovals?.branch?.approved ? '✓ Approved' : 'Pending'}</span>
                  </div>

                  {/* Tier 2: District */}
                  <div className={`p-2 rounded-xl border ${inspectingCandidate.tierApprovals?.district?.approved ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'}`}>
                    <span className="font-bold block">2. District</span>
                    <span>{inspectingCandidate.tierApprovals?.district?.approved ? '✓ Approved' : 'Pending'}</span>
                  </div>

                  {/* Tier 3: Province */}
                  <div className={`p-2 rounded-xl border ${inspectingCandidate.tierApprovals?.province?.approved ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'}`}>
                    <span className="font-bold block">3. Province</span>
                    <span>{inspectingCandidate.tierApprovals?.province?.approved ? '✓ Approved' : 'Pending'}</span>
                  </div>

                  {/* Tier 4: CMC Exam */}
                  <div className={`p-2 rounded-xl border ${inspectingCandidate.theologyScore && inspectingCandidate.theologyScore >= 70 ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'}`}>
                    <span className="font-bold block">4. CMC Exam</span>
                    <span>{inspectingCandidate.theologyScore ? `${inspectingCandidate.theologyScore}% ✓` : 'Pending'}</span>
                  </div>

                  {/* Tier 5: Holy Synod */}
                  <div className={`p-2 rounded-xl border ${['cmc_approved', 'board_approved', 'investiture_assigned', 'ordained'].includes(inspectingCandidate.stage) ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 text-purple-800 dark:text-purple-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'}`}>
                    <span className="font-bold block">5. Synod</span>
                    <span>{inspectingCandidate.stage === 'ordained' ? 'Conferred' : inspectingCandidate.stage === 'board_approved' ? 'Ratified' : 'Awaiting'}</span>
                  </div>
                </div>
              </div>

              {/* Rank Progression & Tenure Breakdown */}
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

              {/* Financial Levies & 4-Part Structure */}
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

              {/* Tier Advancement Action Controls */}
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
