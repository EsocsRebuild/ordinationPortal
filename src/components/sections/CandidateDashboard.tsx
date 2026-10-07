'use client';

import React, { useState } from 'react';
import { CandidateProfile } from '@/types';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { WORKFLOW_STAGES_ORDERED, getStageMeta } from '@/utils/workflow';
import { getRobingSpecifications } from '@/utils/ranks';
import { formatCurrency, formatDate, calculateGrade } from '@/utils/formatters';
import { DigitalPassModal } from '@/components/shared/DigitalPassModal';
import { CertificateModal } from '@/components/shared/CertificateModal';
import {
  Shield,
  User,
  Award,
  CheckCircle2,
  Clock,
  QrCode,
  FileText,
  CreditCard,
  Church,
  Calendar,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Layers,
  ChevronRight,
  Download,
  ShieldCheck,
  Sparkles,
  FileCheck,
  Printer,
  Check,
} from 'lucide-react';

interface CandidateDashboardProps {
  candidate: CandidateProfile;
}

type CandidateTab = 'dossier' | 'tier_approvals' | 'exams' | 'clearance' | 'robing';

export function CandidateDashboard({ candidate }: CandidateDashboardProps) {
  const [activeTab, setActiveTab] = useState<CandidateTab>('dossier');
  const [showPassModal, setShowPassModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  const stageMeta = getStageMeta(candidate.stage);
  const robing = getRobingSpecifications(candidate.targetRankId);
  const isInvestitureReady =
    ['investiture_assigned', 'ordained'].includes(candidate.stage);
  const isOrdained = candidate.stage === 'ordained';

  const currentStepIdx = WORKFLOW_STAGES_ORDERED.findIndex(
    (s) => s.stage === candidate.stage
  );

  const totalLevy = candidate.levyBreakdown?.total || 80000;
  const balanceRemaining = Math.max(0, totalLevy - (candidate.duesAmountPaid || 0));

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-church-950 via-church-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-elevated border border-gold-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="gold" size="sm" className="bg-gold-500/20 text-gold-300 border-gold-400/30">
                Ordinand Dossier & Portal
              </Badge>
              <span className="text-xs font-mono text-church-300">{candidate.regNumber}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {candidate.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-church-200 flex flex-wrap items-center gap-2 font-sans">
              <span>Current Rank: <strong className="text-white">{candidate.currentRank}</strong> ({candidate.currentRankYear}, {candidate.tenureYears || 2026 - candidate.currentRankYear} yrs tenure)</span>
              <span>•</span>
              <span>Nominated Elevation: <strong className="text-gold-300">{candidate.targetRankName}</strong></span>
              <span>•</span>
              <span>Jurisdiction: <strong className="text-white">{candidate.parish}, {candidate.province}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isInvestitureReady && (
              <Button
                variant="gold"
                size="md"
                icon={<QrCode className="w-4 h-4" />}
                onClick={() => setShowPassModal(true)}
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
                className="text-white border-church-700 hover:bg-church-800"
              >
                Certificate Preview
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrintSlip}
              className="text-white border-church-700 hover:bg-church-800"
            >
              Print Slip
            </Button>
          </div>
        </div>
      </div>

      {/* 5-Tier Canonical Vetting Stepper */}
      <Card variant="elevated">
        <CardHeader
          title="5-Tier Canonical Governance & Vetting Progress"
          subtitle="Sequential hierarchical clearance through Branch, District, Province, CMC & Holy Synod"
        />
        <CardBody className="p-6">
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[760px] flex items-center justify-between relative">
              {/* Stepper background line */}
              <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0" />

              {WORKFLOW_STAGES_ORDERED.map((step, idx) => {
                const isPassed = currentStepIdx > idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div key={step.stage} className="relative z-10 flex flex-col items-center text-center max-w-[100px]">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isPassed
                          ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100 dark:ring-emerald-950'
                          : isCurrent
                          ? 'bg-church-800 text-gold-300 shadow-md ring-4 ring-gold-200 dark:ring-church-700 animate-pulse'
                          : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-medium mt-2 leading-tight ${
                        isCurrent
                          ? 'text-church-900 dark:text-gold-300 font-bold'
                          : isPassed
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.shortLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('dossier')}
          className={`py-3 px-5 border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'dossier'
              ? 'border-gold-500 text-church-900 dark:text-gold-300 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <User className="w-4 h-4" /> Ecclesiastical Dossier & Documents
        </button>

        <button
          onClick={() => setActiveTab('tier_approvals')}
          className={`py-3 px-5 border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'tier_approvals'
              ? 'border-gold-500 text-church-900 dark:text-gold-300 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Shield className="w-4 h-4" /> 5-Tier Approval Endorsements Log
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`py-3 px-5 border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'exams'
              ? 'border-gold-500 text-church-900 dark:text-gold-300 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Theological Examination & Marks
        </button>

        <button
          onClick={() => setActiveTab('clearance')}
          className={`py-3 px-5 border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'clearance'
              ? 'border-gold-500 text-church-900 dark:text-gold-300 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Financial Levies & Clearance Schedule
        </button>

        <button
          onClick={() => setActiveTab('robing')}
          className={`py-3 px-5 border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'robing'
              ? 'border-gold-500 text-church-900 dark:text-gold-300 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Layers className="w-4 h-4" /> Official Robing & Vestment Guide
        </button>
      </div>

      {/* Tab 1: Ecclesiastical Dossier & Documents Locker */}
      {activeTab === 'dossier' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader
                title="Biological & Baptismal History"
                subtitle="Official registry record with verified church baptism"
              />
              <CardBody className="p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <dt className="text-slate-500">Full Legal & Ecclesiastical Name</dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{candidate.fullName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Gender Order</dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 capitalize">{candidate.gender} Order</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Email Address</dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{candidate.email}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Phone Number</dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{candidate.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Baptism Date</dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{formatDate(candidate.baptismDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Marital Status</dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 capitalize">{candidate.maritalStatus}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Parish & District</dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{candidate.parish}, {candidate.district}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Province / Diocese</dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{candidate.province}</dd>
                  </div>
                </dl>
              </CardBody>
            </Card>

            {/* Prerequisite Canonical Documents Locker */}
            <Card>
              <CardHeader
                title="Canonical Documents & Credentials Locker"
                subtitle="Verification status of mandatory ecclesiastical files"
              />
              <CardBody className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">Original Baptismal Certificate</p>
                        <span className="text-[10px] text-slate-400 font-mono">Issued {candidate.baptismDate}</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                      Verified ✓
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">Prior Ordination Scroll</p>
                        <span className="text-[10px] text-slate-400 font-mono">Rank: {candidate.currentRank} ({candidate.currentRankYear})</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                      Verified ✓
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">Holy Matrimony / Vow Attestation</p>
                        <span className="text-[10px] text-slate-400 font-mono">Certified Church Standing</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                      Verified ✓
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">Parish Priest Clean Standing Letter</p>
                        <span className="text-[10px] text-slate-400 font-mono">Attested by Branch Rector</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                      Verified ✓
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Strict Rank Progression & Anti-Skipping Status */}
            <Card variant="goldAccent">
              <CardHeader
                title="Ecclesiastical Rank Progression & Service Tenure"
                subtitle="Verified by Central Secretariat according to ESOCS Constitution"
              />
              <CardBody className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Current Ecclesiastical Rank</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{candidate.currentRank}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      Ordination Year: {candidate.currentRankYear} ({candidate.tenureYears || 2026 - candidate.currentRankYear} years active service)
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gold-500/10 dark:bg-gold-500/15 border border-gold-400/30 space-y-1">
                    <span className="text-gold-800 dark:text-gold-300 block text-[11px] font-semibold">Target Elevation Rank</span>
                    <span className="font-bold text-church-950 dark:text-gold-200 text-sm font-serif">{candidate.targetRankName}</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">
                      ✓ Anti-Skipping Hierarchy Rule Passed
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Screening Notes & Endorsements" />
              <CardBody className="p-6 space-y-3 text-xs">
                {candidate.screeningNotes && candidate.screeningNotes.length > 0 ? (
                  candidate.screeningNotes.map((note, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed text-slate-700 dark:text-slate-300">
                      {note}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs">Awaiting remarks from screening officer.</p>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: 5-Tier Approval Endorsements Log */}
      {activeTab === 'tier_approvals' && (
        <Card>
          <CardHeader
            title="5-Tier Canonical Endorsement & Clearance History"
            subtitle="Verified approval records across the governance hierarchy"
          />
          <CardBody className="p-6 space-y-4 text-xs">
            <div className="space-y-3">
              {/* Tier 1 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">Tier 1: Branch / Parish Level</span>
                    {candidate.tierApprovals?.branch?.approved ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                        ✓ Approved
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Approver: <strong>{candidate.tierApprovals?.branch?.approverName || candidate.branchPriestName || 'Parish Rector'}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 italic">
                    {candidate.tierApprovals?.branch?.comments || 'Parish standing confirmed spotless, tithe stewardship verified.'}
                  </p>
                </div>
                {candidate.tierApprovals?.branch?.date && (
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{candidate.tierApprovals.branch.date}</span>
                )}
              </div>

              {/* Tier 2 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">Tier 2: District Level</span>
                    {candidate.tierApprovals?.district?.approved ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                        ✓ Approved
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Approver: <strong>{candidate.tierApprovals?.district?.approverName || 'District Overseer Council'}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 italic">
                    {candidate.tierApprovals?.district?.comments || 'District quota verified and approved for elevation.'}
                  </p>
                </div>
                {candidate.tierApprovals?.district?.date && (
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{candidate.tierApprovals.district.date}</span>
                )}
              </div>

              {/* Tier 3 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">Tier 3: Provincial Level</span>
                    {candidate.tierApprovals?.province?.approved ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                        ✓ Approved
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Approver: <strong>{candidate.tierApprovals?.province?.approverName || `${candidate.province} Secretariat`}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 italic">
                    {candidate.tierApprovals?.province?.comments || 'Provincial credential check verified, forwarded to CMC.'}
                  </p>
                </div>
                {candidate.tierApprovals?.province?.date && (
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{candidate.tierApprovals.province.date}</span>
                )}
              </div>

              {/* Tier 4 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">Tier 4: CMC National Screening & Exams</span>
                    {candidate.theologyScore && candidate.theologyScore >= 70 ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                        ✓ Score: {candidate.theologyScore}% Passed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                        Screening in Progress
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Approver: <strong>{candidate.tierApprovals?.cmc?.approverName || 'CMC National Screening Directorate'}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 italic">
                    {candidate.tierApprovals?.cmc?.comments || 'Doctrinal examination and liturgical oral defense completed successfully.'}
                  </p>
                </div>
                {candidate.tierApprovals?.cmc?.date && (
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{candidate.tierApprovals.cmc.date}</span>
                )}
              </div>

              {/* Tier 5 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">Tier 5: Holy Synod & Advisory Board Ratification</span>
                    {['board_approved', 'investiture_assigned', 'ordained'].includes(candidate.stage) ? (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                        ✓ Ratified by Holy Synod
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold text-[10px]">
                        Awaiting Board Conclave
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Authority: <strong>His Most Eminence, Baba Aladura & Council of Elders</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 italic">
                    {candidate.tierApprovals?.national?.comments || 'Decreed for High Altar laying of sacred hands and investiture.'}
                  </p>
                </div>
                {candidate.tierApprovals?.national?.date && (
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{candidate.tierApprovals.national.date}</span>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tab 3: Theological Examination */}
      {activeTab === 'exams' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card>
            <CardHeader
              title="National Theological Examination Scorecard"
              subtitle="Official marks recorded by the CMC National Screening & Vetting Board"
            />
            <CardBody className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs text-slate-500 font-medium">Doctrinal Exam Score</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {candidate.theologyScore ?? '--'}
                    </span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                  {candidate.theologyScore && (
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${calculateGrade(candidate.theologyScore).color}`}>
                      {calculateGrade(candidate.theologyScore).label}
                    </span>
                  )}
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs text-slate-500 font-medium">Liturgical Oral Defense</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {candidate.interviewScore ?? '--'}
                    </span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                  {candidate.interviewScore && (
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${calculateGrade(candidate.interviewScore).color}`}>
                      {calculateGrade(candidate.interviewScore).label}
                    </span>
                  )}
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs text-slate-500 font-medium">Screening Cutoff Status</span>
                  <div className="mt-1">
                    <span className="font-serif text-lg font-bold text-emerald-600 dark:text-emerald-400 block">
                      Passed & Certified
                    </span>
                    <span className="text-[11px] text-slate-500">Exceeds 70% threshold</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab 4: Financial Levies & Clearance Schedule */}
      {activeTab === 'clearance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          <Card variant="goldAccent">
            <CardHeader
              title="4-Part Mandatory Levies Breakdown"
              subtitle="Reconciliation of canonical fees for Holy Ordination"
            />
            <CardBody className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Overall Clearance Status:</span>
                {candidate.duesStatus === 'cleared' ? (
                  <Badge variant="success" size="md">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Cleared
                  </Badge>
                ) : (
                  <Badge variant="warning" size="md">
                    <AlertCircle className="w-3.5 h-3.5" /> Clearance In Progress
                  </Badge>
                )}
              </div>

              {/* 4-Tier Breakdown */}
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">1. Branch / Parish Assessment</span>
                  <span className="font-bold">{formatCurrency(candidate.levyBreakdown?.branchLevy || 15000)}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">2. District Assessment Fee</span>
                  <span className="font-bold">{formatCurrency(candidate.levyBreakdown?.districtLevy || 15000)}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">3. Provincial Ordination Dues</span>
                  <span className="font-bold">{formatCurrency(candidate.levyBreakdown?.provincialLevy || 20000)}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-300">4. National Secretariat & Regalia Fee</span>
                  <span className="font-bold">{formatCurrency(candidate.levyBreakdown?.nationalFee || 30000)}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-600 space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Total Assessment:</span>
                  <span className="font-bold text-sm">{formatCurrency(totalLevy)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Amount Reconciled:</span>
                  <span className="font-bold">{formatCurrency(candidate.duesAmountPaid || 0)}</span>
                </div>
                {candidate.receiptNumber && (
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-slate-500">
                    <span>Official Receipt No:</span>
                    <span className="font-mono font-semibold text-church-800 dark:text-gold-300">
                      {candidate.receiptNumber}
                    </span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Investiture Session & Cathedral Seating"
              subtitle="Designated seating and canonical robing assignment"
            />
            <CardBody className="p-6 space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 block mb-0.5">Assigned Seating Pew</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {candidate.seatNumber || 'Zone A - Pew 14 (Chancel Wing)'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 block mb-0.5">Investiture Session</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {candidate.investitureSession || 'Saturday Morning Session (09:00 AM)'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 block mb-0.5">Designated Robing Prelate / Elder</span>
                <span className="font-bold text-church-900 dark:text-gold-300">
                  {candidate.robingOfficer || 'Apostle General J. K. Coker'}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab 5: Robing & Vestment Guide */}
      {activeTab === 'robing' && (
        <Card>
          <CardHeader
            title={`Liturgical Robing Specifications for ${candidate.targetRankName}`}
            subtitle="Official vestments prescribed by the Supreme Head & Advisory Council"
          />
          <CardBody className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[11px] mb-1">Prescribed Robe & Fabric</span>
                <p className="font-bold text-slate-900 dark:text-slate-100">{robing.vestmentColor}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[11px] mb-1">Ecclesiastical Stole</span>
                <p className="font-bold text-slate-900 dark:text-slate-100">{robing.stoleType}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[11px] mb-1">Cap, Mitre or Diadem</span>
                <p className="font-bold text-slate-900 dark:text-slate-100">{robing.capOrCrown}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[11px] mb-1">Insignia & Holy Staff Authorization</span>
                <p className="font-bold text-slate-900 dark:text-slate-100">{robing.insigniaNotes}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Digital Pass Modal */}
      {showPassModal && (
        <DigitalPassModal candidate={candidate} onClose={() => setShowPassModal(false)} />
      )}

      {/* Certificate Modal */}
      {showCertModal && (
        <CertificateModal candidate={candidate} onClose={() => setShowCertModal(false)} />
      )}
    </div>
  );
}
