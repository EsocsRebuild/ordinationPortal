'use client';

import React, { useState, useMemo } from 'react';
import { CandidateProfile, UserSession } from '@/types';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { validatePhoneNumber, PhoneValidationResult } from '@/utils/phoneValidation';
import {
  ESOCS_RANKS,
  ESOCS_HIERARCHY,
  getDistrictsForProvince,
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

  // Hierarchy state for nomination
  const [province, setProvince] = useState<string>(ESOCS_HIERARCHY[0].name);
  const [district, setDistrict] = useState<string>(() => {
    const districts = getDistrictsForProvince(ESOCS_HIERARCHY[0].name);
    return districts[0]?.name || '';
  });
  const [parish, setParish] = useState<string>(() => {
    const districts = getDistrictsForProvince(ESOCS_HIERARCHY[0].name);
    const branches = getBranchesForDistrict(ESOCS_HIERARCHY[0].name, districts[0]?.name || '');
    return branches[0]?.name || '';
  });
  const [houseOfPrayer, setHouseOfPrayer] = useState<string>(() => {
    const districts = getDistrictsForProvince(ESOCS_HIERARCHY[0].name);
    const branches = getBranchesForDistrict(ESOCS_HIERARCHY[0].name, districts[0]?.name || '');
    const houses = getHousesOfPrayerForBranch(ESOCS_HIERARCHY[0].name, districts[0]?.name || '', branches[0]?.name || '');
    return houses[0] || 'Main House of Prayer';
  });
  const [customHouseOfPrayer, setCustomHouseOfPrayer] = useState('');
  const [isCustomHouse, setIsCustomHouse] = useState(false);

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

  const availableDistricts = useMemo(() => getDistrictsForProvince(province), [province]);
  const availableBranches = useMemo(() => getBranchesForDistrict(province, district), [province, district]);
  const availableHousesOfPrayer = useMemo(() => getHousesOfPrayerForBranch(province, district, parish), [province, district, parish]);

  // Real-time Nigerian phone validation & carrier detection
  const phoneValidation: PhoneValidationResult = useMemo(() => {
    if (!formData.phone) {
      return { isValid: false, formatted: '', isNigerian: false };
    }
    return validatePhoneNumber(formData.phone);
  }, [formData.phone]);

  // Searchable Select Option Formats
  const provinceOptions = useMemo(() => {
    return ESOCS_HIERARCHY.map((prov) => ({
      value: prov.name,
      label: prov.name,
      subLabel: prov.shortCode,
      badge: `${prov.districts.length} Districts`,
    }));
  }, []);

  const districtOptions = useMemo(() => {
    return availableDistricts.map((dist) => ({
      value: dist.name,
      label: dist.name,
      subLabel: `${dist.branches.length} Parishes / Branches`,
      badge: 'District',
    }));
  }, [availableDistricts]);

  const branchOptions = useMemo(() => {
    return availableBranches.map((br) => ({
      value: br.name,
      label: br.name,
      subLabel: `${br.housesOfPrayer.length} Sanctuaries`,
      badge: 'Branch',
    }));
  }, [availableBranches]);

  const houseOptions = useMemo(() => {
    return availableHousesOfPrayer.map((h) => ({
      value: h,
      label: h,
      subLabel: 'Sanctuary of Prayer',
    }));
  }, [availableHousesOfPrayer]);

  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    const districts = getDistrictsForProvince(newProvince);
    const firstDistrict = districts[0]?.name || '';
    setDistrict(firstDistrict);

    const branches = getBranchesForDistrict(newProvince, firstDistrict);
    const firstBranch = branches[0]?.name || '';
    setParish(firstBranch);

    const houses = getHousesOfPrayerForBranch(newProvince, firstDistrict, firstBranch);
    setHouseOfPrayer(houses[0] || 'Main House of Prayer');
    setIsCustomHouse(false);
    setCustomHouseOfPrayer('');
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    const branches = getBranchesForDistrict(province, newDistrict);
    const firstBranch = branches[0]?.name || '';
    setParish(firstBranch);

    const houses = getHousesOfPrayerForBranch(province, newDistrict, firstBranch);
    setHouseOfPrayer(houses[0] || 'Main House of Prayer');
    setIsCustomHouse(false);
    setCustomHouseOfPrayer('');
  };

  const handleBranchChange = (newBranch: string) => {
    setParish(newBranch);
    const houses = getHousesOfPrayerForBranch(province, district, newBranch);
    setHouseOfPrayer(houses[0] || 'Main House of Prayer');
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden my-6 text-slate-900 dark:text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Initiate Ecclesiastical Nomination
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Submit candidate profile for 5-tier canonical vetting & Directorate clearance
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowNominateModal(false);
                  setNominateStep(1);
                }}
                className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Tracker */}
            <div className="px-6 pt-4 pb-2 bg-slate-50/40 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-colors ${
                    nominateStep === 1
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {nominateStep === 1 ? '1' : <Check className="w-3.5 h-3.5" />}
                </div>
                <span className={`font-semibold ${nominateStep === 1 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                  Candidate Identity & Lineage
                </span>
              </div>

              <div className="h-0.5 w-12 bg-slate-200 dark:bg-slate-800" />

              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-colors ${
                    nominateStep === 2
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  2
                </div>
                <span className={`font-semibold ${nominateStep === 2 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                  Canonical Elevation & Attestation
                </span>
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateNomination} className="p-6 sm:p-8 space-y-6">
              {nominateStep === 1 && (
                <div className="space-y-5 animate-in fade-in">
                  {/* Candidate Name First */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Candidate Full Ecclesiastical Name (Title, First, Middle, Surname) *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Senior Apostle Emmanuel Babatunde Adeleke"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Gender / Order Segmented Switch */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Sacred Holy Order Category *
                    </label>
                    <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => handleGenderChange('male')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          formData.gender === 'male'
                            ? 'bg-amber-500 text-slate-950 shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span>Brethren (Male Order)</span>
                        {formData.gender === 'male' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenderChange('female')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          formData.gender === 'female'
                            ? 'bg-amber-500 text-slate-950 shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span>Sisters (Female Order)</span>
                        {formData.gender === 'female' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </div>
                  </div>

                  {/* Contact Info with Nigerian Phone Validator */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Church Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. e.adeleke@esocs.church"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Mobile Phone Number *
                        </label>
                        {formData.phone && (
                          <span
                            className={`text-[10px] font-mono font-semibold flex items-center gap-1 ${
                              phoneValidation.isValid ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                            }`}
                          >
                            {phoneValidation.isValid ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{phoneValidation.carrier}</span>
                              </>
                            ) : (
                              <span>Invalid Number</span>
                            )}
                          </span>
                        )}
                      </div>

                      <div className="relative flex items-center">
                        <div className="absolute left-3 flex items-center gap-1 text-slate-400 pointer-events-none text-xs font-mono font-medium border-r border-slate-300 dark:border-slate-800 pr-2">
                          <span className="text-sm">🇳🇬</span>
                          <span>+234</span>
                        </div>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="0803 123 4567"
                          className={`w-full pl-20 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border rounded-2xl text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 transition-all ${
                            formData.phone && phoneValidation.isValid
                              ? 'border-emerald-500/60 focus:ring-emerald-500/15 focus:border-emerald-500'
                              : formData.phone && !phoneValidation.isValid
                              ? 'border-rose-500/60 focus:ring-rose-500/15 focus:border-rose-500'
                              : 'border-slate-300 dark:border-slate-700/80 focus:ring-amber-500/15 focus:border-amber-500'
                          }`}
                        />
                      </div>
                      {formData.phone && !phoneValidation.isValid && phoneValidation.error && (
                        <p className="text-[11px] text-rose-500 dark:text-rose-400 leading-tight mt-1">
                          {phoneValidation.error}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cascading 4-Tier Ecclesiastical Hierarchy (Searchable Select) */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 space-y-3.5">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4" />
                        Ecclesiastical Territorial Jurisdiction
                      </span>
                      <span className="text-[11px] text-slate-400">Searchable Directory</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <SearchableSelect
                        label="1. Ecclesiastical Province / Diocese"
                        required
                        options={provinceOptions}
                        value={province}
                        onChange={handleProvinceChange}
                        placeholder="Search Province / Diocese..."
                        searchPlaceholder="Type province keyword..."
                        icon={<MapPin className="w-4 h-4 text-amber-500" />}
                      />

                      <SearchableSelect
                        label="2. District / Zonal Council"
                        required
                        options={districtOptions}
                        value={district}
                        onChange={handleDistrictChange}
                        placeholder="Search District Council..."
                        searchPlaceholder={`Type district in ${province}...`}
                        icon={<Building className="w-4 h-4 text-amber-500" />}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <SearchableSelect
                        label="3. Local Parish / Cathedral Branch"
                        required
                        options={branchOptions}
                        value={parish}
                        onChange={handleBranchChange}
                        placeholder="Search Parish Branch..."
                        searchPlaceholder="Type parish name..."
                        icon={<Church className="w-4 h-4 text-amber-500" />}
                      />

                      <SearchableSelect
                        label="4. House of Prayer / Sanctuary"
                        required
                        options={houseOptions}
                        value={isCustomHouse ? '__custom__' : houseOfPrayer}
                        onChange={handleHouseChange}
                        placeholder="Select House of Prayer..."
                        searchPlaceholder="Type sanctuary or chapel name..."
                        allowCustom={true}
                        customOptionLabel="+ Other / Enter Custom House of Prayer"
                        icon={<Sparkles className="w-4 h-4 text-amber-500" />}
                      />
                    </div>

                    {isCustomHouse && (
                      <div className="space-y-1.5 pt-1 animate-in fade-in">
                        <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400">
                          Specify House of Prayer Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={customHouseOfPrayer}
                          onChange={(e) => setCustomHouseOfPrayer(e.target.value)}
                          placeholder="e.g. Mount Carmel Sanctuary of Grace"
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-amber-500/50 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
                        />
                      </div>
                    )}
                  </div>

                  {/* Step 1 Actions */}
                  <div className="pt-3 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="lg"
                      type="button"
                      onClick={() => setShowNominateModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      type="button"
                      onClick={() => {
                        if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
                          alert('Please enter candidate full ecclesiastical name (minimum 3 characters).');
                          return;
                        }
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
                          alert('Please enter a valid ecclesiastical or personal email address.');
                          return;
                        }
                        if (!formData.phone.trim()) {
                          alert('Please enter a valid Nigerian mobile phone number.');
                          return;
                        }
                        const phoneVal = validatePhoneNumber(formData.phone);
                        if (!phoneVal.isValid) {
                          alert(phoneVal.error || 'Please enter a valid 11-digit Nigerian phone number.');
                          return;
                        }
                        if (!province || !district || !parish) {
                          alert('Please select Province, District, and Local Parish Branch.');
                          return;
                        }
                        if (isCustomHouse && !customHouseOfPrayer.trim()) {
                          alert('Please specify the name of the House of Prayer / Sanctuary.');
                          return;
                        }
                        setNominateStep(2);
                      }}
                      icon={<ArrowRight className="w-4 h-4" />}
                      className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold"
                    >
                      Continue to Canonical Elevation
                    </Button>
                  </div>
                </div>
              )}

              {nominateStep === 2 && (
                <div className="space-y-5 animate-in fade-in">
                  {/* Current Rank & Conferred Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Current Conferred Rank *
                      </label>
                      <select
                        value={formData.currentRank}
                        onChange={(e) => setFormData({ ...formData, currentRank: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all"
                      >
                        {availableRanksForGender.map((r) => (
                          <option key={r.id} value={r.name}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Year Conferred Current Rank *
                      </label>
                      <input
                        type="number"
                        min="1970"
                        max="2026"
                        value={formData.currentRankYear}
                        onChange={(e) => setFormData({ ...formData, currentRankYear: Number(e.target.value) })}
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Proposed Elevation Target Rank */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Proposed Elevation Target Sacred Order *
                    </label>
                    <select
                      value={formData.targetRankId}
                      onChange={(e) => setFormData({ ...formData, targetRankId: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-sm font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all"
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
                    <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="text-slate-500 dark:text-slate-400 block font-medium">Canonical Assessment & Robing Tier</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{targetRank.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 dark:text-slate-400 block font-medium">Statutory Synod Fee</span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                          ₦{(targetRank.levyBreakdown?.total || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Testimonial Note */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Parish Rector Attestation & Character Reference *
                    </label>
                    <textarea
                      rows={3}
                      value={formData.parishNotes}
                      onChange={(e) => setFormData({ ...formData, parishNotes: e.target.value })}
                      placeholder="Attest to candidate's spiritual maturity, financial integrity, active attendance, and sanctuary devotion..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all leading-relaxed"
                    />
                  </div>

                  {/* Step 2 Actions */}
                  <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setNominateStep(1)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      ← Back to Candidate Info
                    </button>
                    <Button
                      variant="primary"
                      size="lg"
                      type="submit"
                      icon={<Send className="w-4 h-4" />}
                      className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-3.5"
                    >
                      Submit Nomination to Directorate
                    </Button>
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

