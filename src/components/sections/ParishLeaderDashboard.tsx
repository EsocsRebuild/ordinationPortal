'use client';

import React, { useState } from 'react';
import { CandidateProfile, UserSession } from '@/types';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ESOCS_RANKS } from '@/lib/constants';
import { getEligibleNextRanks } from '@/utils/ranks';
import { getStageMeta } from '@/utils/workflow';
import {
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Search,
  Check,
  X,
  Clock,
  Send,
  Building,
} from 'lucide-react';

interface ParishLeaderDashboardProps {
  session: UserSession;
  candidates: CandidateProfile[];
  onUpdateCandidate: (updated: CandidateProfile) => void;
  onAddNewNomination: (newCand: Partial<CandidateProfile>) => void;
}

export function ParishLeaderDashboard({
  session,
  candidates,
  onUpdateCandidate,
  onAddNewNomination,
}: ParishLeaderDashboardProps) {
  const [showNominateModal, setShowNominateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // New nomination form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'male' as 'male' | 'female',
    dateOfBirth: '1985-05-15',
    baptismDate: '2000-01-10',
    currentRank: 'Pastor',
    currentRankYear: 2022,
    targetRankId: 'rank_evangelist',
    parishNotes: '',
  });

  const branchCandidates = candidates.filter((c) =>
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.currentRank.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingEndorsements = candidates.filter((c) => c.stage === 'nominated');

  const availableRanksForGender = ESOCS_RANKS.filter(
    (r) => r.genderEligibility === 'both' || r.genderEligibility === formData.gender
  );

  const targetRank = ESOCS_RANKS.find((r) => r.id === formData.targetRankId);

  const handleGenderChange = (gender: 'male' | 'female') => {
    if (gender === 'male') {
      setFormData({
        ...formData,
        gender,
        currentRank: 'Pastor',
        targetRankId: 'rank_evangelist',
      });
    } else {
      setFormData({
        ...formData,
        gender,
        currentRank: 'Lady Leader',
        targetRankId: 'rank_dorcas',
      });
    }
  };

  const handleEndorse = (cand: CandidateProfile) => {
    const updated: CandidateProfile = {
      ...cand,
      stage: 'branch_approved',
      currentVettingTier: 'district',
      tierApprovals: {
        ...(cand.tierApprovals || {}),
        branch: {
          approved: true,
          approverName: session.name,
          date: new Date().toISOString().split('T')[0],
          comments: `Branch Rector ${session.name} endorsed: Full compliance with spiritual disciplines and active tithe stewardship. Forwarded to District Overseer.`,
        },
      },
      lastUpdated: new Date().toISOString().split('T')[0],
      screeningNotes: [
        ...(cand.screeningNotes || []),
        `Endorsed by Branch Rector ${session.name} on ${new Date().toLocaleDateString()}: Full compliance with spiritual disciplines and active tithe stewardship. Forwarded to District Overseer.`,
      ],
    };
    onUpdateCandidate(updated);
  };

  const handleCreateNomination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRank) return;

    const newCandidate: Partial<CandidateProfile> = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      baptismDate: formData.baptismDate,
      currentRank: formData.currentRank,
      currentRankYear: Number(formData.currentRankYear),
      targetRankId: targetRank.id,
      targetRankName: targetRank.name,
      province: 'Lagos Central Province',
      district: 'Surulere District',
      parish: 'Mount Zion Cathedral Branch',
      branchPriestName: session.name,
      stage: 'nominated',
      submissionDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      attendanceRecordPercentage: 94,
      conductRating: 'exemplary',
      duesStatus: 'pending',
      duesAmountPaid: 0,
      screeningNotes: [formData.parishNotes || 'Nomination lodged by Parish Priest.'],
    };

    onAddNewNomination(newCandidate);
    setShowNominateModal(false);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      gender: 'male',
      dateOfBirth: '1985-05-15',
      baptismDate: '2000-01-10',
      currentRank: 'Pastor',
      currentRankYear: 2022,
      targetRankId: 'rank_evangelist',
      parishNotes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-church-900 via-indigo-950 to-church-900 text-white rounded-2xl p-6 sm:p-8 shadow-elevated border border-church-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <Badge variant="primary" size="sm" className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30">
            Parish Rector Directorate
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Branch Nominations & Endorsement Deck
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            {session.jurisdiction} • Parish Quota: <strong>6 / 10 Utilized</strong>
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowNominateModal(true)}
        >
          Initiate New Nomination
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Nominated</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{candidates.length}</p>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400">Branch candidates</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending Endorsement</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingEndorsements.length}</p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400">Requires signature</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Screened & Approved</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {candidates.filter((c) => ['theology_assessed', 'board_approved', 'investiture_assigned', 'ordained'].includes(c.stage)).length}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Board certified</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Branch Quota Capacity</span>
          <p className="text-2xl font-bold text-church-800 dark:text-gold-400 mt-1">60%</p>
          <span className="text-[11px] text-slate-500">4 Slots Remaining</span>
        </div>
      </div>

      {/* Pending Endorsement Action Box */}
      {pendingEndorsements.length > 0 && (
        <Card variant="goldAccent">
          <CardHeader
            title="Awaiting Your Pastoral Endorsement"
            subtitle="Verify spiritual character and forward candidate dossier to National Screening Directorate"
          />
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {pendingEndorsements.map((cand) => (
                <div key={cand.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{cand.fullName}</span>
                      <span className="text-xs font-mono text-slate-500">({cand.regNumber})</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Ascending from <strong>{cand.currentRank}</strong> to <strong className="text-church-800 dark:text-gold-300">{cand.targetRankName}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Baptism: {cand.baptismDate} • Attendance: {cand.attendanceRecordPercentage}% • Conduct: {cand.conductRating}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Check className="w-4 h-4" />}
                      onClick={() => handleEndorse(cand)}
                    >
                      Endorse & Forward
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Main Candidate Roster Table */}
      <Card>
        <CardHeader
          title="Parish Ordination Candidate Master Roster"
          subtitle="Real-time monitoring of all submitted candidates from your branch"
          action={
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidates or rank..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-church-500"
              />
            </div>
          }
        />
        <CardBody className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Ordinand</th>
                <th className="px-5 py-3">Current Rank</th>
                <th className="px-5 py-3">Target Elevation</th>
                <th className="px-5 py-3">Workflow Stage</th>
                <th className="px-5 py-3">Exam / Vetting</th>
                <th className="px-5 py-3">Dues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {branchCandidates.map((c) => {
                const stageMeta = getStageMeta(c.stage);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{c.fullName}</p>
                      <p className="text-[11px] font-mono text-slate-500">{c.regNumber}</p>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{c.currentRank}</td>
                    <td className="px-5 py-3.5 font-bold text-church-800 dark:text-gold-400">{c.targetRankName}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${stageMeta.badgeBg} ${stageMeta.badgeText}`}>
                        {stageMeta.shortLabel}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {c.theologyScore ? (
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {c.theologyScore}% (Passed)
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">In Review</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {c.duesStatus === 'cleared' ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">Pending</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Nomination Form Modal */}
      {showNominateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-8 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Initiate Ecclesiastical Nomination
                </h3>
                <p className="text-xs text-slate-500">
                  Submit candidate profile for National Screening & Advisory Board review
                </p>
              </div>
              <button
                onClick={() => setShowNominateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNomination} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Candidate Full Name (As on Baptismal Cert)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Bro. Joshua T. Martins"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Gender Order
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleGenderChange(e.target.value as 'male' | 'female')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
                  >
                    <option value="male">Brethren (Male Order)</option>
                    <option value="female">Sisters (Female Order)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="joshua@example.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 800 000 0000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Current Holy Order
                  </label>
                  <select
                    value={formData.currentRank}
                    onChange={(e) => setFormData({ ...formData, currentRank: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
                  >
                    {availableRanksForGender.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Year Conferred Current Order
                  </label>
                  <input
                    type="number"
                    min="1970"
                    max="2026"
                    value={formData.currentRankYear}
                    onChange={(e) => setFormData({ ...formData, currentRankYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              {/* Target Order Selection with Automatic Eligibility Validation */}
              <div className="pt-2">
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Proposed Elevation Holy Order
                </label>
                <select
                  value={formData.targetRankId}
                  onChange={(e) => setFormData({ ...formData, targetRankId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-church-800 dark:text-gold-300"
                >
                  {availableRanksForGender.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.liturgicalColor || r.robingCategory})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Parish Leader Confidential Testimonial & Character Reference
                </label>
                <textarea
                  rows={3}
                  value={formData.parishNotes}
                  onChange={(e) => setFormData({ ...formData, parishNotes: e.target.value })}
                  placeholder="Attest to candidate's spiritual maturity, financial integrity, attendance, and sanctuary devotion..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowNominateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" icon={<Send className="w-4 h-4" />}>
                  Submit Nomination to Directorate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

