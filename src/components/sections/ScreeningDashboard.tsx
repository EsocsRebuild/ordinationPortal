'use client';

import React, { useState } from 'react';
import { CandidateProfile, UserSession } from '@/types';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { calculateGrade, formatDate } from '@/utils/formatters';
import { getStageMeta } from '@/utils/workflow';
import {
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Award,
  Search,
  Check,
  X,
  Eye,
  BookOpen,
  Filter,
  UserCheck,
} from 'lucide-react';

interface ScreeningDashboardProps {
  session: UserSession;
  candidates: CandidateProfile[];
  onUpdateCandidate: (updated: CandidateProfile) => void;
}

export function ScreeningDashboard({
  session,
  candidates,
  onUpdateCandidate,
}: ScreeningDashboardProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [filterStage, setFilterStage] = useState<'all' | 'needs_vetting' | 'theology_passed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Assessment Form State
  const [theologyScore, setTheologyScore] = useState<number>(85);
  const [interviewScore, setInterviewScore] = useState<number>(88);
  const [committeeComments, setCommitteeComments] = useState('');
  const [docsVerified, setDocsVerified] = useState({
    baptismCert: true,
    priorOrdination: true,
    marriageLetter: true,
    parishStanding: true,
  });

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.province.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStage === 'needs_vetting') {
      return ['parish_endorsed', 'screening_in_progress'].includes(c.stage);
    }
    if (filterStage === 'theology_passed') {
      return ['theology_assessed', 'board_approved', 'investiture_assigned', 'ordained'].includes(c.stage);
    }
    return true;
  });

  const handleOpenAssessment = (cand: CandidateProfile) => {
    setSelectedCandidate(cand);
    setTheologyScore(cand.theologyScore || 85);
    setInterviewScore(cand.interviewScore || 85);
    setCommitteeComments(cand.screeningNotes?.join('\n') || '');
  };

  const handleSaveAssessment = (decision: 'recommend' | 'defer' | 'reject') => {
    if (!selectedCandidate) return;

    let nextStage: CandidateProfile['stage'] = 'theology_assessed';
    if (decision === 'defer') nextStage = 'deferred';
    if (decision === 'reject') nextStage = 'rejected';

    const updated: CandidateProfile = {
      ...selectedCandidate,
      theologyScore,
      interviewScore,
      stage: nextStage,
      lastUpdated: new Date().toISOString().split('T')[0],
      screeningNotes: [
        ...(selectedCandidate.screeningNotes || []),
        `[Screening Board by ${session.name} on ${new Date().toLocaleDateString()}]: Decision: ${decision.toUpperCase()}. Doctrinal Mark: ${theologyScore}%, Liturgical Defense: ${interviewScore}%. ${committeeComments}`,
      ],
    };

    onUpdateCandidate(updated);
    setSelectedCandidate(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-church-950 via-amber-950 to-church-900 text-white rounded-2xl p-6 sm:p-8 shadow-elevated border border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <Badge variant="warning" size="sm" className="bg-amber-500/20 text-amber-200 border-amber-400/30">
            Screening & Vetting Directorate
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            National Canonical Vetting & Theological Exam Deck
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/90">
            {session.jurisdiction} • Standard Cutoff: <strong>Theology ≥ 70% | Interview ≥ 75%</strong>
          </p>
        </div>
      </div>

      {/* Summary Stat Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Pending Vetting Queue</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {candidates.filter((c) => ['parish_endorsed', 'screening_in_progress'].includes(c.stage)).length}
          </p>
          <span className="text-[11px] text-amber-600">Awaiting score & doc verification</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Passed Theological Defense</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {candidates.filter((c) => ['theology_assessed', 'board_approved', 'investiture_assigned', 'ordained'].includes(c.stage)).length}
          </p>
          <span className="text-[11px] text-emerald-600">Eligible for Advisory Board</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Average Doctrinal Score</span>
          <p className="text-2xl font-bold text-church-800 dark:text-gold-400 mt-1">89.4%</p>
          <span className="text-[11px] text-slate-500">Cohort 2026 Index</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Flagged Discrepancies</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            {candidates.filter((c) => c.stage === 'deferred' || c.stage === 'rejected').length}
          </p>
          <span className="text-[11px] text-rose-600">Deferred / Supplemental check</span>
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader
          title="Candidate Vetting & Examination Roster"
          subtitle="Click any candidate to inspect credentials, enter doctrinal test marks, and record interview decisions"
          action={
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 text-xs">
                <button
                  onClick={() => setFilterStage('all')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterStage === 'all'
                      ? 'bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All ({candidates.length})
                </button>
                <button
                  onClick={() => setFilterStage('needs_vetting')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterStage === 'needs_vetting'
                      ? 'bg-white dark:bg-slate-900 font-bold text-amber-700 dark:text-amber-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Needs Vetting
                </button>
                <button
                  onClick={() => setFilterStage('theology_passed')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterStage === 'theology_passed'
                      ? 'bg-white dark:bg-slate-900 font-bold text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Exam Passed
                </button>
              </div>

              <div className="relative w-56">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search province or name..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          }
        />
        <CardBody className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Ordinand</th>
                <th className="px-5 py-3">Province</th>
                <th className="px-5 py-3">Target Elevation</th>
                <th className="px-5 py-3">Theology Exam</th>
                <th className="px-5 py-3">Interview</th>
                <th className="px-5 py-3">Current Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredCandidates.map((c) => {
                const stageMeta = getStageMeta(c.stage);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{c.fullName}</p>
                      <p className="text-[11px] font-mono text-slate-500">{c.regNumber}</p>
                    </td>
                    <td className="px-5 py-3.5">{c.province}</td>
                    <td className="px-5 py-3.5 font-bold text-church-800 dark:text-gold-400">{c.targetRankName}</td>
                    <td className="px-5 py-3.5">
                      {c.theologyScore !== undefined ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{c.theologyScore}%</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border ${calculateGrade(c.theologyScore).color}`}>
                            {calculateGrade(c.theologyScore).label.split(' ')[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-600 italic">Ungraded</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {c.interviewScore !== undefined ? (
                        <span className="font-bold text-slate-900 dark:text-slate-100">{c.interviewScore}%</span>
                      ) : (
                        <span className="text-amber-600 italic">Pending</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded text-[11px] font-semibold ${stageMeta.badgeBg} ${stageMeta.badgeText}`}>
                        {stageMeta.shortLabel}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<FileCheck className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenAssessment(c)}
                      >
                        Assess & Score
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Assessment Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden my-6 text-slate-900 dark:text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Record Theological Marks & Vetting Decision
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ordinand: <strong className="text-slate-900 dark:text-slate-200">{selectedCandidate.fullName}</strong> • {selectedCandidate.regNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[78vh] overflow-y-auto">
              {/* Ordinand Quick Overview */}
              <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Target Sacred Order</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{selectedCandidate.targetRankName}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Current Conferred Rank</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCandidate.currentRank}</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Jurisdiction</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCandidate.parish}</span>
                </div>
              </div>

              {/* Prerequisites Checklist */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Prerequisite Canonical Documents Verification
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer select-none hover:border-slate-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={docsVerified.baptismCert}
                      onChange={(e) => setDocsVerified({ ...docsVerified, baptismCert: e.target.checked })}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Original Holy Baptismal Certificate</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer select-none hover:border-slate-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={docsVerified.priorOrdination}
                      onChange={(e) => setDocsVerified({ ...docsVerified, priorOrdination: e.target.checked })}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Prior Holy Order Scroll</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer select-none hover:border-slate-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={docsVerified.marriageLetter}
                      onChange={(e) => setDocsVerified({ ...docsVerified, marriageLetter: e.target.checked })}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Holy Matrimony / Church Vow Attestation</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer select-none hover:border-slate-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={docsVerified.parishStanding}
                      onChange={(e) => setDocsVerified({ ...docsVerified, parishStanding: e.target.checked })}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Parish Priest Clean Standing Letter</span>
                  </label>
                </div>
              </div>

              {/* Scores Input Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Theological Exam (55%)
                    </label>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${calculateGrade(theologyScore).color}`}>
                      {calculateGrade(theologyScore).label}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={theologyScore}
                    onChange={(e) => setTheologyScore(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl font-mono text-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all"
                  />
                </div>

                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Oral Liturgy Defense (45%)
                    </label>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${calculateGrade(interviewScore).color}`}>
                      {calculateGrade(interviewScore).label}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={interviewScore}
                    onChange={(e) => setInterviewScore(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl font-mono text-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Committee Notes */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Screening Committee Confidential Review Remarks
                </label>
                <textarea
                  rows={3}
                  value={committeeComments}
                  onChange={(e) => setCommitteeComments(e.target.value)}
                  placeholder="Detail candidate's depth in holy scriptures, liturgical proficiency, and sanctuary demeanor..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all leading-relaxed"
                />
              </div>

              {/* Decision Trigger Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleSaveAssessment('defer')}
                  className="w-full sm:w-auto text-amber-700 dark:text-amber-400 border-amber-400/40 hover:bg-amber-500/10"
                >
                  Defer for Next Synod
                </Button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setSelectedCandidate(null)}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<UserCheck className="w-4 h-4" />}
                    onClick={() => handleSaveAssessment('recommend')}
                    className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-3.5"
                  >
                    Pass & Recommend to Advisory Board
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

