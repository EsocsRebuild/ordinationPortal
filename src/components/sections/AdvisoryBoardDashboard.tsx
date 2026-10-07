'use client';

import React, { useState } from 'react';
import { CandidateProfile, UserSession } from '@/types';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getStageMeta } from '@/utils/workflow';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Search,
  Check,
  Shield,
  Church,
  Scroll,
} from 'lucide-react';

interface AdvisoryBoardDashboardProps {
  session: UserSession;
  candidates: CandidateProfile[];
  onUpdateCandidate: (updated: CandidateProfile) => void;
  onBatchApprove: (ids: string[]) => void;
}

export function AdvisoryBoardDashboard({
  session,
  candidates,
  onUpdateCandidate,
  onBatchApprove,
}: AdvisoryBoardDashboardProps) {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Candidates awaiting Holy Synod / Advisory Board Ratification
  const pendingBoardReview = candidates.filter((c) => c.stage === 'theology_assessed');
  const alreadyApproved = candidates.filter((c) =>
    ['board_approved', 'clearance_completed', 'investiture_assigned', 'ordained'].includes(c.stage)
  );

  const toggleSelectCandidate = (id: string) => {
    if (selectedCandidates.includes(id)) {
      setSelectedCandidates(selectedCandidates.filter((i) => i !== id));
    } else {
      setSelectedCandidates([...selectedCandidates, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === pendingBoardReview.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(pendingBoardReview.map((c) => c.id));
    }
  };

  const handleApproveSingle = (candidate: CandidateProfile) => {
    const updated: CandidateProfile = {
      ...candidate,
      stage: 'board_approved',
      lastUpdated: new Date().toISOString().split('T')[0],
      screeningNotes: [
        ...(candidate.screeningNotes || []),
        `Ratified and sealed by Holy Order Advisory Board & Council of Elders on ${new Date().toLocaleDateString()}. Approved for investiture robing.`,
      ],
    };
    onUpdateCandidate(updated);
  };

  const handleBatchRatify = () => {
    if (selectedCandidates.length === 0) return;
    onBatchApprove(selectedCandidates);
    setSelectedCandidates([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-royal-950 via-church-900 to-royal-900 text-white rounded-2xl p-6 sm:p-8 shadow-elevated border border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <Badge variant="purple" size="sm" className="bg-purple-500/20 text-purple-200 border-purple-400/30">
            Advisory Board & Council of Elders
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Supreme Synod Elevation Ratification Deck
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/90">
            {session.jurisdiction} • Authority: <strong>Decree & Consecration Governance</strong>
          </p>
        </div>

        {selectedCandidates.length > 0 && (
          <Button
            variant="gold"
            size="md"
            icon={<Check className="w-4 h-4" />}
            onClick={handleBatchRatify}
          >
            Ratify Selected ({selectedCandidates.length})
          </Button>
        )}
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Awaiting Council Seal</span>
          <p className="text-2xl font-bold text-purple-600 mt-1">{pendingBoardReview.length}</p>
          <span className="text-[11px] text-purple-600">Passed exam & screening</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Council Ratified</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{alreadyApproved.length}</p>
          <span className="text-[11px] text-emerald-600">Forwarded to Secretariat</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Apostolic Orders</span>
          <p className="text-2xl font-bold text-church-800 dark:text-gold-400 mt-1">
            {candidates.filter((c) => c.targetRankName.includes('Apostle')).length}
          </p>
          <span className="text-[11px] text-slate-500">Apostolic elevations</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Matriarchal Orders</span>
          <p className="text-2xl font-bold text-church-800 dark:text-gold-400 mt-1">
            {candidates.filter((c) => c.targetRankName.includes('Mother')).length}
          </p>
          <span className="text-[11px] text-slate-500">Mothers in Israel</span>
        </div>
      </div>

      {/* Awaiting Ratification Table */}
      <Card variant="goldAccent">
        <CardHeader
          title="Candidates Awaiting Supreme Synodical Ratification"
          subtitle="Screening marks approved. Seal elevations for inclusion in the 2026 Consecration Gazette."
          action={
            pendingBoardReview.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {selectedCandidates.length === pendingBoardReview.length ? 'Deselect All' : 'Select All'}
              </Button>
            )
          }
        />
        <CardBody className="p-0 overflow-x-auto">
          {pendingBoardReview.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All screened candidates have been formally ratified by the Advisory Board.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.length === pendingBoardReview.length && pendingBoardReview.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-purple-600"
                    />
                  </th>
                  <th className="px-5 py-3">Ordinand</th>
                  <th className="px-5 py-3">Province</th>
                  <th className="px-5 py-3">Elevation Order</th>
                  <th className="px-5 py-3">Theology / Interview</th>
                  <th className="px-5 py-3 text-right">Ratification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {pendingBoardReview.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(c.id)}
                        onChange={() => toggleSelectCandidate(c.id)}
                        className="w-4 h-4 rounded text-purple-600"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{c.fullName}</p>
                      <p className="text-[11px] font-mono text-slate-500">{c.regNumber}</p>
                    </td>
                    <td className="px-5 py-3.5">{c.province}</td>
                    <td className="px-5 py-3.5 font-bold text-purple-800 dark:text-purple-300">{c.targetRankName}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Exam: {c.theologyScore}% • Oral: {c.interviewScore}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Check className="w-3.5 h-3.5" />}
                        onClick={() => handleApproveSingle(c)}
                        className="bg-purple-800 hover:bg-purple-900 border-purple-900"
                      >
                        Ratify & Decreed
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* Previously Ratified Roll Card */}
      <Card>
        <CardHeader
          title="Holy Synod Ratified Ministerial Roll"
          subtitle="Candidates decreed by the Council of Elders and advanced to Central Secretariat for clearance and investiture passes"
        />
        <CardBody className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Ordinand</th>
                <th className="px-5 py-3">Province</th>
                <th className="px-5 py-3">Ratified Holy Order</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Investiture Pew</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {alreadyApproved.map((c) => {
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
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${stageMeta.badgeBg} ${stageMeta.badgeText}`}>
                        {stageMeta.shortLabel}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                      {c.seatNumber || 'Pending Allocation'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

