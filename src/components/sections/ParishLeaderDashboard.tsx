'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CandidateProfile, UserSession, ProvinceHierarchy, EcclesiasticalRank } from '@/types';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { InternationalPhoneInput } from '@/components/ui/InternationalPhoneInput';
import { PhoneValidationResult } from '@/utils/phoneValidation';
import { api } from '@/services/api';
import {
  ESOCS_RANKS,
  ESOCS_HIERARCHY,
  getDistrictsForProvince,
  getAllBranchesForProvince,
  getBranchesForDistrict,
  getHousesOfPrayerForBranch,
} from '@/lib/constants';
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
  Shield,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  UserCheck,
  MapPin,
  Church,
  Layers,
  User,
  Mail,
  Phone,
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
  const [nominateStep, setNominateStep] = useState<1 | 2>(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Live dynamic hierarchy and ranks
  const [hierarchyData, setHierarchyData] = useState<ProvinceHierarchy[]>(ESOCS_HIERARCHY);
  const [ranksData, setRanksData] = useState<EcclesiasticalRank[]>(ESOCS_RANKS);

  useEffect(() => {
    api.getHierarchy()
      .then((res) => {
        if (res && Array.isArray(res.hierarchy) && res.hierarchy.length > 0) {
          setHierarchyData(res.hierarchy);
        }
      })
      .catch((err) => console.error('Failed to fetch dynamic hierarchy', err));

    api.getRanks()
      .then((res) => {
        if (res && Array.isArray(res.ranks) && res.ranks.length > 0) {
          setRanksData(res.ranks);
        }
      })
      .catch((err) => console.error('Failed to fetch dynamic ranks', err));
  }, []);

  // Hierarchy state for nomination
  const [province, setProvince] = useState<string>(ESOCS_HIERARCHY[0].name);
  const [district, setDistrict] = useState<string>(() => {
    const districts = getDistrictsForProvince(ESOCS_HIERARCHY[0].name);
    return districts[0]?.name || '';
  });
  const [parish, setParish] = useState<string>(() => {
    const branches = getAllBranchesForProvince(ESOCS_HIERARCHY[0].name);
    return branches[0]?.name || '';
  });
  const [houseOfPrayer, setHouseOfPrayer] = useState<string>(() => {
    const branches = getAllBranchesForProvince(ESOCS_HIERARCHY[0].name);
    return branches[0]?.housesOfPrayer?.[0] || 'Main House of Prayer';
  });
  const [customHouseOfPrayer, setCustomHouseOfPrayer] = useState('');
  const [isCustomHouse, setIsCustomHouse] = useState(false);

  // New nomination form state with structured names
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    preferredName: '',
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

  const [phoneValidation, setPhoneValidation] = useState<PhoneValidationResult | null>(null);

  const computedNomineeFullName = useMemo(() => {
    const parts = [formData.firstName.trim(), formData.middleName.trim(), formData.lastName.trim()].filter(Boolean);
    return parts.join(' ');
  }, [formData.firstName, formData.middleName, formData.lastName]);

  const branchCandidates = candidates.filter((c) =>
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.currentRank.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingEndorsements = candidates.filter((c) => c.stage === 'nominated');

  const availableRanksForGender = useMemo(() => {
    return ranksData.filter(
      (r) => r.genderEligibility === 'both' || r.genderEligibility === formData.gender
    );
  }, [ranksData, formData.gender]);

  const targetRank = useMemo(() => {
    return ranksData.find((r) => r.id === formData.targetRankId);
  }, [ranksData, formData.targetRankId]);

  // Searchable options
  const provinceOptions = useMemo(() => {
    return hierarchyData.map((prov) => ({
      value: prov.name,
      label: prov.name,
      subLabel: prov.shortCode,
      badge: `${prov.districts.length} Districts`,
    }));
  }, [hierarchyData]);

  const provinceBranches = useMemo(() => {
    const prov = hierarchyData.find((p) => p.name === province);
    if (!prov) return [];
    const list: Array<{ id: string; name: string; districtName: string; housesOfPrayer: string[] }> = [];
    for (const d of prov.districts) {
      for (const b of d.branches) {
        list.push({
          id: b.id,
          name: b.name,
          districtName: d.name,
          housesOfPrayer: b.housesOfPrayer || [],
        });
      }
    }
    return list;
  }, [hierarchyData, province]);

  const branchOptions = useMemo(() => {
    return provinceBranches.map((br) => ({
      value: br.name,
      label: br.name,
      subLabel: br.districtName,
      badge: 'Parish Branch',
    }));
  }, [provinceBranches]);

  const availableHousesOfPrayer = useMemo(() => {
    const found = provinceBranches.find((b) => b.name === parish);
    return found?.housesOfPrayer || ['Main House of Prayer', 'Sanctuary of Grace'];
  }, [provinceBranches, parish]);

  const houseOptions = useMemo(() => {
    return availableHousesOfPrayer.map((h) => ({
      value: h,
      label: h,
      subLabel: 'Sanctuary of Prayer',
    }));
  }, [availableHousesOfPrayer]);

  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    const branches = getAllBranchesForProvince(newProvince);
    const firstBranch = branches[0];
    if (firstBranch) {
      setDistrict(firstBranch.districtName);
      setParish(firstBranch.name);
      setHouseOfPrayer(firstBranch.housesOfPrayer[0] || 'Main House of Prayer');
    } else {
      setDistrict('');
      setParish('');
      setHouseOfPrayer('Main House of Prayer');
    }
    setIsCustomHouse(false);
    setCustomHouseOfPrayer('');
  };

  const handleBranchChange = (newBranchName: string) => {
    setParish(newBranchName);
    const found = provinceBranches.find((b) => b.name === newBranchName);
    if (found) {
      setDistrict(found.districtName);
      setHouseOfPrayer(found.housesOfPrayer[0] || 'Main House of Prayer');
    }
    setIsCustomHouse(false);
    setCustomHouseOfPrayer('');
  };

  const handleHouseChange = (newHouse: string) => {
    if (newHouse === '__custom__') {
      setIsCustomHouse(true);
      setHouseOfPrayer('__custom__');
    } else {
      setIsCustomHouse(false);
      setHouseOfPrayer(newHouse);
    }
  };

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

    const resolvedHouseOfPrayer = isCustomHouse ? customHouseOfPrayer.trim() : houseOfPrayer;

    const newCandidate: Partial<CandidateProfile> = {
      fullName: computedNomineeFullName,
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim() || undefined,
      lastName: formData.lastName.trim(),
      preferredName: formData.preferredName.trim() || undefined,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      baptismDate: formData.baptismDate,
      currentRank: formData.currentRank,
      currentRankYear: Number(formData.currentRankYear),
      targetRankId: targetRank.id,
      targetRankName: targetRank.name,
      province,
      district,
      parish,
      houseOfPrayer: resolvedHouseOfPrayer,
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
      firstName: '',
      middleName: '',
      lastName: '',
      preferredName: '',
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
            subtitle="Verify spiritual character and forward candidate profile to National Screening Directorate"
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/60 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/80 flex flex-col max-h-[94vh] sm:max-h-[90vh] overflow-hidden text-slate-100">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-7 border-b border-slate-800 bg-slate-950/80 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      Initiate Ecclesiastical Nomination
                    </h3>
                    <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                      Parish Rector Directorate • Canonical Vetting Intake
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowNominateModal(false);
                    setNominateStep(1);
                  }}
                  className="p-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-slate-700/40"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step Tracker */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  { num: 1, title: 'Identity & Territorial Lineage' },
                  { num: 2, title: 'Canonical Order & Attestation' },
                ].map((step) => {
                  const isCompleted = nominateStep > step.num;
                  const isCurrent = nominateStep === step.num;
                  return (
                    <div key={step.num} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                            isCompleted
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                              : isCurrent
                              ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20 shadow-md shadow-amber-400/20'
                              : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.num}
                        </span>
                        <span className={`text-xs font-semibold truncate ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                          {step.title}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden bg-slate-800/90">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isCompleted
                              ? 'bg-emerald-500 w-full'
                              : isCurrent
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500 w-full'
                              : 'w-0'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateNomination} className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
              {nominateStep === 1 && (
                <div className="space-y-6 animate-in fade-in">
                  
                  {/* 1. Holy Order Ministry Switch with Male & Female Icons */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Holy Order Ministry <span className="text-amber-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950/70 border border-slate-800/90 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => handleGenderChange('male')}
                        className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2.5 ${
                          formData.gender === 'male'
                            ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/20 border border-amber-500/60 text-amber-300 ring-2 ring-amber-500/20 shadow-md'
                            : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${formData.gender === 'male' ? 'text-amber-400' : 'text-slate-500'}`}>
                          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="10" cy="7" r="4" />
                          <path d="M19 8l3-3" />
                          <path d="M16 5h6v6" />
                        </svg>
                        <span>Brethren Order (Male)</span>
                        {formData.gender === 'male' && <Check className="w-4 h-4 text-amber-400 stroke-[3]" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenderChange('female')}
                        className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2.5 ${
                          formData.gender === 'female'
                            ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/20 border border-amber-500/60 text-amber-300 ring-2 ring-amber-500/20 shadow-md'
                            : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${formData.gender === 'female' ? 'text-amber-400' : 'text-slate-500'}`}>
                          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="10" cy="7" r="4" />
                          <path d="M18 11v6" />
                          <path d="M15 14h6" />
                        </svg>
                        <span>Sisters Order (Female)</span>
                        {formData.gender === 'female' && <Check className="w-4 h-4 text-amber-400 stroke-[3]" />}
                      </button>
                    </div>
                  </div>

                  {/* 2. Structured Name Inputs */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Candidate Name Details <span className="text-amber-400">*</span>
                      </label>
                      {computedNomineeFullName && (
                        <span className="text-xs text-amber-300 font-mono font-medium truncate max-w-[260px]">
                          {computedNomineeFullName}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-medium text-slate-400">
                          First Name <span className="text-amber-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="e.g. Emmanuel"
                          className="w-full px-3.5 py-3 bg-slate-950/70 hover:bg-slate-950/90 border border-slate-800 focus:border-amber-400/90 focus:ring-4 focus:ring-amber-400/10 rounded-xl text-sm font-medium text-white placeholder-slate-500 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-medium text-slate-400">
                          Middle Name <span className="text-slate-500">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.middleName}
                          onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                          placeholder="e.g. Babatunde"
                          className="w-full px-3.5 py-3 bg-slate-950/70 hover:bg-slate-950/90 border border-slate-800 focus:border-amber-400/90 focus:ring-4 focus:ring-amber-400/10 rounded-xl text-sm font-medium text-white placeholder-slate-500 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-medium text-slate-400">
                          Last Name / Surname <span className="text-amber-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="e.g. Adeleke"
                          className="w-full px-3.5 py-3 bg-slate-950/70 hover:bg-slate-950/90 border border-slate-800 focus:border-amber-400/90 focus:ring-4 focus:ring-amber-400/10 rounded-xl text-sm font-medium text-white placeholder-slate-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[11px] font-medium text-slate-400">
                        Preferred / Alias Name <span className="text-slate-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.preferredName}
                        onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                        placeholder="e.g. Pastor Adeleke"
                        className="w-full px-3.5 py-3 bg-slate-950/70 hover:bg-slate-950/90 border border-slate-800 focus:border-amber-400/90 focus:ring-4 focus:ring-amber-400/10 rounded-xl text-sm font-medium text-white placeholder-slate-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* 3. Contact Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Church Email Address <span className="text-amber-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. e.adeleke@esocs.church"
                          className="w-full pl-10 pr-4 py-3 bg-slate-950/70 hover:bg-slate-950/90 border border-slate-800 focus:border-amber-400/90 focus:ring-4 focus:ring-amber-400/10 rounded-xl text-sm text-white placeholder-slate-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <InternationalPhoneInput
                        value={formData.phone}
                        onChange={(val, res) => {
                          setFormData({ ...formData, phone: val });
                          setPhoneValidation(res);
                        }}
                        defaultCountry="NG"
                        label="Mobile Phone Number (Worldwide / Nigeria)"
                        required
                      />
                    </div>
                  </div>

                  {/* 4. Ecclesiastical Hierarchy */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/90">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          Ecclesiastical Territorial Jurisdiction
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">Searchable Directory</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SearchableSelect
                        label="1. Ecclesiastical Province / Diocese"
                        required
                        options={provinceOptions}
                        value={province}
                        onChange={handleProvinceChange}
                        placeholder="Search Province / Diocese..."
                        searchPlaceholder="Type province keyword..."
                        icon={<MapPin className="w-4 h-4 text-amber-400" />}
                      />

                      <SearchableSelect
                        label="2. Local Parish / Cathedral Branch"
                        required
                        options={branchOptions}
                        value={parish}
                        onChange={handleBranchChange}
                        placeholder="Search Parish Branch..."
                        searchPlaceholder={`Search all branches in ${province}...`}
                        icon={<Church className="w-4 h-4 text-amber-400" />}
                      />
                    </div>

                    <div className="space-y-2">
                      <SearchableSelect
                        label="3. House of Prayer / Sanctuary"
                        required
                        options={houseOptions}
                        value={isCustomHouse ? '__custom__' : houseOfPrayer}
                        onChange={handleHouseChange}
                        placeholder="Select House of Prayer..."
                        searchPlaceholder="Type sanctuary or chapel name..."
                        allowCustom={true}
                        customOptionLabel="+ Other / Enter Custom House of Prayer"
                        icon={<Sparkles className="w-4 h-4 text-amber-400" />}
                      />

                      {isCustomHouse && (
                        <div className="space-y-1.5 pt-1 animate-in fade-in">
                          <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider">
                            Specify House of Prayer Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={customHouseOfPrayer}
                            onChange={(e) => setCustomHouseOfPrayer(e.target.value)}
                            placeholder="e.g. Mount Carmel Sanctuary of Grace"
                            className="w-full px-4 py-3 bg-slate-950/80 border border-amber-500/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-amber-500/20 font-medium"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 1 Actions */}
                  <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowNominateModal(false)}
                      className="px-5 py-3 rounded-2xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.firstName.trim() || !formData.lastName.trim()) {
                          alert('Please enter candidate first and last name.');
                          return;
                        }
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
                          alert('Please enter a valid ecclesiastical or personal email address.');
                          return;
                        }
                        if (!formData.phone.trim()) {
                          alert('Please enter a valid mobile phone number.');
                          return;
                        }
                        if (phoneValidation && !phoneValidation.isValid) {
                          alert(phoneValidation.error || 'Please enter a valid phone number for selected country.');
                          return;
                        }
                        if (!province || !parish) {
                          alert('Please select Province and Local Parish Branch.');
                          return;
                        }
                        if (isCustomHouse && !customHouseOfPrayer.trim()) {
                          alert('Please specify the name of the House of Prayer / Sanctuary.');
                          return;
                        }
                        setNominateStep(2);
                      }}
                      className="px-7 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center gap-2"
                    >
                      <span>Continue to Canonical Elevation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {nominateStep === 2 && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Current Rank & Conferred Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Current Conferred Rank <span className="text-amber-400">*</span>
                      </label>
                      <select
                        value={formData.currentRank}
                        onChange={(e) => setFormData({ ...formData, currentRank: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-sm font-semibold text-white focus:ring-4 focus:ring-amber-500/15 focus:border-amber-400 focus:outline-none transition-all"
                      >
                        {availableRanksForGender.map((r) => (
                          <option key={r.id} value={r.name}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Year Conferred Current Rank <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="1970"
                        max="2026"
                        value={formData.currentRankYear}
                        onChange={(e) => setFormData({ ...formData, currentRankYear: Number(e.target.value) })}
                        className="w-full px-4 py-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-sm font-medium text-white focus:ring-4 focus:ring-amber-500/15 focus:border-amber-400 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Proposed Elevation Target Rank */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Proposed Elevation Target Holy Order <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={formData.targetRankId}
                      onChange={(e) => setFormData({ ...formData, targetRankId: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm font-bold text-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-400 transition-all"
                    >
                      {availableRanksForGender.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.liturgicalColor || r.robingCategory}) — Statutory: ₦{(r.levyBreakdown?.total || 0).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fee & Robing Preview Badge */}
                  {targetRank && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs sm:text-sm">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 block text-xs">Canonical Assessment & Robing Tier</span>
                        <span className="font-bold text-white text-sm sm:text-base">{targetRank.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-xs">Statutory Synod Fee</span>
                        <span className="font-mono font-bold text-amber-400 text-sm sm:text-base">
                          ₦{(targetRank.levyBreakdown?.total || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Testimonial Note */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Parish Rector Attestation & Character Reference <span className="text-amber-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.parishNotes}
                      onChange={(e) => setFormData({ ...formData, parishNotes: e.target.value })}
                      placeholder="Attest to candidate's spiritual maturity, financial integrity, active attendance, and sanctuary devotion..."
                      className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-2xl text-xs sm:text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-400 transition-all leading-relaxed"
                    />
                  </div>

                  {/* Step 2 Actions */}
                  <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setNominateStep(1)}
                      className="px-5 py-3 rounded-2xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Candidate Info</span>
                    </button>
                    <button
                      type="submit"
                      className="px-7 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center gap-2"
                    >
                      <span>Submit Nomination to Directorate</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

