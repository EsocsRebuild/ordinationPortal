'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CandidateProfile } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getRobingSpecifications } from '@/utils/ranks';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { api } from '@/services/api';
import {
  QrCode,
  CheckCircle2,
  Clock,
  Search,
  User,
  MapPin,
  Award,
  Users,
  Building,
  RotateCcw,
  Sparkles,
  Zap,
  Check,
  AlertCircle,
  TrendingUp,
  Layers,
  Camera,
  Printer,
  ChevronRight,
  ShieldCheck,
  Radio,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

interface LiveAccreditationDeskProps {
  officerName?: string;
}

type ConsecrationCohort = 'all' | 'junior' | 'pastoral' | 'apostolic' | 'apex';

interface CohortDefinition {
  id: ConsecrationCohort;
  title: string;
  subtitle: string;
  ranks: string[];
  sessionTime: string;
  gateName: string;
  presidingPrelate: string;
  colorClass: string;
}

const COHORTS: CohortDefinition[] = [
  {
    id: 'junior',
    title: 'Junior Holy Orders',
    subtitle: 'Brother, Aladura, Leader, Rabbi • Sister, Lady Aladura, Lady Leader',
    ranks: ['Brother', 'Aladura', 'Leader', 'Rabbi', 'Sister', 'Lady Aladura', 'Lady Leader'],
    sessionTime: 'Saturday 08:00 AM – 10:30 AM',
    gateName: 'Gate 1 (North Nave Wing)',
    presidingPrelate: 'Senior Apostle Festus N. Okon & Council of Pastors',
    colorClass: 'border-blue-500/40 text-blue-300 bg-blue-500/10',
  },
  {
    id: 'pastoral',
    title: 'Pastoral & Doctrinal Orders',
    subtitle: 'Pastor, Evangelist • Dorcas, Deborah, Mary',
    ranks: ['Pastor', 'Evangelist', 'Dorcas', 'Deborah', 'Mary'],
    sessionTime: 'Saturday 10:45 AM – 01:15 PM',
    gateName: 'Gate 2 (Central Chancel Wing)',
    presidingPrelate: 'Special Senior Apostle Dr. Godwin I. Bassey',
    colorClass: 'border-purple-500/40 text-purple-300 bg-purple-500/10',
  },
  {
    id: 'apostolic',
    title: 'Senior Apostolic & Prophetic Orders',
    subtitle: 'Apostle (White), Super Apostle (Pink) • Prophetess',
    ranks: ['Apostle (White)', 'Super Apostle (Pink)', 'Prophetess'],
    sessionTime: 'Saturday 01:30 PM – 03:45 PM',
    gateName: 'Gate 2 (Chancel Apex Wing)',
    presidingPrelate: 'His Eminence, Apostle General J. K. Coker',
    colorClass: 'border-pink-500/40 text-pink-300 bg-pink-500/10',
  },
  {
    id: 'apex',
    title: 'Apex Holy Synod Consecration',
    subtitle: 'Senior Apostle (Yellow), SSA (Blue), Mother in Israel, Apostle General',
    ranks: ['Senior Apostle (Yellow)', 'Special Senior Apostle (Blue)', 'Mother in Israel', 'Snr. Mother in Israel', 'Sp. Snr. Mother in Israel', 'Apostle General (Green)', 'Supervising Apostle General (Green)'],
    sessionTime: 'Saturday 04:00 PM – 06:30 PM',
    gateName: 'Apex Sanctuary Gate (Sanctum Sanctorum)',
    presidingPrelate: 'Supervising Apostle General Prof. David A. Oladele & Holy Synod',
    colorClass: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
  },
  {
    id: 'all',
    title: 'All Active Cohorts',
    subtitle: 'Full Worldwide Ordination Roster (All Ranks)',
    ranks: [],
    sessionTime: 'Full Day Investiture Program',
    gateName: 'All Cathedral Gates (Gates 1, 2 & Sanctuary)',
    presidingPrelate: 'Holy Synod & Central Secretariat Directorate',
    colorClass: 'border-slate-500/40 text-slate-300 bg-slate-500/10',
  },
];

export function LiveAccreditationDesk({ officerName = 'Accreditation Marshal' }: LiveAccreditationDeskProps) {
  const [activeCohort, setActiveCohort] = useState<ConsecrationCohort>('junior');
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);

  // Scanner & Search State
  const [inputCode, setInputCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [scannedCandidate, setScannedCandidate] = useState<CandidateProfile | null>(null);
  const [scannerActive, setScannerActive] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [filterCheckInStatus, setFilterCheckInStatus] = useState<'all' | 'checked_in' | 'pending'>('all');
  const [searchTableQuery, setSearchTableQuery] = useState('');

  // Metrics State
  const [metrics, setMetrics] = useState<{
    totalEligible: number;
    checkedInCount: number;
    pendingCount: number;
    attendancePercentage: number;
    rankBreakdown: { rankName: string; total: number; checkedIn: number }[];
    provinceBreakdown: { province: string; total: number; checkedIn: number }[];
    recentArrivals: any[];
  } | null>(null);

  const loadData = async () => {
    try {
      const [candList, attendanceData] = await Promise.all([
        api.getCandidates(),
        api.getAttendanceMetrics(),
      ]);
      setCandidates(candList || []);
      setMetrics(attendanceData);
    } catch (e) {
      console.error('Failed to load live accreditation data:', e);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000); // 8-second live sync
    return () => clearInterval(interval);
  }, []);

  const selectedCohortDef = useMemo(() => {
    return COHORTS.find((c) => c.id === activeCohort) || COHORTS[0];
  }, [activeCohort]);

  // Filter candidates matching the active cohort
  const cohortCandidates = useMemo(() => {
    if (activeCohort === 'all') return candidates;
    const targetRanks = selectedCohortDef.ranks.map((r) => r.toLowerCase());
    return candidates.filter((c) => targetRanks.includes(c.targetRankName.toLowerCase()));
  }, [candidates, activeCohort, selectedCohortDef]);

  // Cohort-specific metrics
  const cohortMetrics = useMemo(() => {
    const total = cohortCandidates.length;
    const checkedIn = cohortCandidates.filter((c) => c.isCheckedIn).length;
    const pending = Math.max(0, total - checkedIn);
    const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    return { total, checkedIn, pending, percentage };
  }, [cohortCandidates]);

  // Filter table list
  const filteredCohortTable = useMemo(() => {
    return cohortCandidates.filter((c) => {
      const matchesStatus =
        filterCheckInStatus === 'all'
          ? true
          : filterCheckInStatus === 'checked_in'
          ? !!c.isCheckedIn
          : !c.isCheckedIn;

      const q = searchTableQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        c.fullName.toLowerCase().includes(q) ||
        c.regNumber.toLowerCase().includes(q) ||
        c.targetRankName.toLowerCase().includes(q) ||
        c.province.toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [cohortCandidates, filterCheckInStatus, searchTableQuery]);

  // Scan & Lookup Handler
  const handleScanLookup = async (identifier: string) => {
    if (!identifier.trim()) return;
    setIsSearching(true);
    setFeedbackMsg(null);

    try {
      const found = candidates.find(
        (c) =>
          c.regNumber.toLowerCase() === identifier.trim().toLowerCase() ||
          c.id.toLowerCase() === identifier.trim().toLowerCase() ||
          c.fullName.toLowerCase().includes(identifier.trim().toLowerCase())
      ) || (await api.getCandidateById(identifier.trim()));

      if (found) {
        setScannedCandidate(found);
        setFeedbackMsg({
          text: `Found ${found.fullName} (${found.targetRankName}). Ready for gate accreditation.`,
          type: 'info',
        });
      } else {
        setFeedbackMsg({
          text: `No candidate matching '${identifier}' found in canonical registry.`,
          type: 'error',
        });
      }
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Lookup failed.', type: 'error' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScanLookup(inputCode);
  };

  // One-Click Accreditation
  const handleAccreditCandidate = async (candToAccredit: CandidateProfile) => {
    try {
      const res = await api.checkInCandidate({
        identifier: candToAccredit.id,
        officerName,
        action: 'check_in',
      });

      // Update local candidate state
      setCandidates((prev) => prev.map((c) => (c.id === res.candidate.id ? res.candidate : c)));
      if (scannedCandidate?.id === res.candidate.id) {
        setScannedCandidate(res.candidate);
      }

      setFeedbackMsg({
        text: `✓ ACCREDITED! ${res.candidate.fullName} checked in to ${res.candidate.seatNumber || 'Chancel Pew'}.`,
        type: 'success',
      });

      loadData();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Accreditation failed.', type: 'error' });
    }
  };

  const handleUndoCheckIn = async (candToUndo: CandidateProfile) => {
    try {
      const res = await api.checkInCandidate({
        identifier: candToUndo.id,
        officerName,
        action: 'undo_check_in',
      });

      setCandidates((prev) => prev.map((c) => (c.id === res.candidate.id ? res.candidate : c)));
      if (scannedCandidate?.id === res.candidate.id) {
        setScannedCandidate(res.candidate);
      }

      setFeedbackMsg({
        text: `Accreditation check-in reversed for ${res.candidate.fullName}.`,
        type: 'info',
      });

      loadData();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Reversal failed.', type: 'error' });
    }
  };

  const handleSimulateCohortMember = (cand: CandidateProfile) => {
    setScannedCandidate(cand);
    setInputCode(cand.regNumber);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Cathedral Consecration Command Center */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Cathedral Consecration Command Center
              </span>
              <span className="text-xs font-mono text-slate-400">General Conference 2026</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-serif">
              Live Ordination Day Accreditation & Seating Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Verify ordinand identity, validate statutory dues clearance, confirm liturgical robing vestments, and accredit candidates into assigned chancel pews in real time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Live Consecration Mode</p>
                <p className="text-xs font-bold text-emerald-400 font-mono">ALL GATES OPERATIONAL</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
              className="bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              Print Gate Roster
            </Button>
          </div>
        </div>
      </div>

      {/* Cohort Stream Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Select Active Ordination Stream / Consecration Cohort
          </span>
          <span className="text-xs text-amber-400 font-mono font-semibold">
            {cohortMetrics.checkedIn} / {cohortMetrics.total} Present ({cohortMetrics.percentage}%)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {COHORTS.map((cohort) => {
            const isSelected = activeCohort === cohort.id;
            const cTotal = cohort.id === 'all'
              ? candidates.length
              : candidates.filter((c) => cohort.ranks.map((r) => r.toLowerCase()).includes(c.targetRankName.toLowerCase())).length;
            const cCheckedIn = cohort.id === 'all'
              ? candidates.filter((c) => c.isCheckedIn).length
              : candidates.filter((c) => cohort.ranks.map((r) => r.toLowerCase()).includes(c.targetRankName.toLowerCase()) && c.isCheckedIn).length;
            const cPct = cTotal > 0 ? Math.round((cCheckedIn / cTotal) * 100) : 0;

            return (
              <button
                key={cohort.id}
                onClick={() => {
                  setActiveCohort(cohort.id);
                  setScannedCandidate(null);
                  setInputCode('');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500/80 shadow-lg ring-2 ring-amber-500/30'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${cohort.colorClass}`}>
                      {cohort.id === 'all' ? 'Worldwide' : 'Cohort Stream'}
                    </span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1 leading-snug">{cohort.title}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{cohort.subtitle}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-400">
                    <strong className="text-white">{cCheckedIn}</strong> / {cTotal}
                  </span>
                  <span className={`font-bold ${cPct === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {cPct}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Cohort Directives Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">{selectedCohortDef.title} Stream</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-300 font-semibold">{selectedCohortDef.sessionTime}</span>
          </div>
          <p className="text-slate-400 text-[11px] flex flex-wrap items-center gap-2">
            <span>Cathedral Gate: <strong className="text-slate-200">{selectedCohortDef.gateName}</strong></span>
            <span>•</span>
            <span>Presiding Prelate: <strong className="text-slate-200">{selectedCohortDef.presidingPrelate}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="gold" size="sm" className="bg-amber-500/10 text-amber-300 border-amber-500/20 font-mono">
            {cohortMetrics.checkedIn} Accredited / {cohortMetrics.pending} Pending
          </Badge>
        </div>
      </div>

      {/* Live Counter Cards for Active Cohort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Cohort Ordinands</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {cohortMetrics.total}
          </p>
          <span className="text-[11px] text-slate-500">Ratified in {selectedCohortDef.title}</span>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Accredited Present</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">
            {cohortMetrics.checkedIn}
          </p>
          <span className="text-[11px] text-emerald-500 font-semibold">
            {cohortMetrics.percentage}% Seated in Chancel
          </span>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Gate Arrival</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono">
            {cohortMetrics.pending}
          </p>
          <span className="text-[11px] text-slate-500">Awaiting Gate Verification</span>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Gate Marshals On Duty</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-purple-300 font-mono">
            {officerName.split(' ')[0]}
          </p>
          <span className="text-[11px] text-slate-500">Apex Secretariat Accreditation</span>
        </div>
      </div>

      {/* Main Command Workspace: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: QR Optical Scanner Terminal & Candidate Accreditation Card (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Scanner & Fast Search Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>Optical QR Scanner & Barcode Terminal</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                OPTICAL SENSOR READY
              </span>
            </div>

            {/* High-Tech Simulated Optical Scanner Viewfinder */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[160px] text-center">
              <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />

              {/* Viewfinder crosshairs */}
              <div className="w-24 h-24 border-2 border-dashed border-amber-500/50 rounded-2xl flex items-center justify-center relative mb-3">
                <QrCode className="w-10 h-10 text-amber-400/70" />
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-amber-400" />
              </div>

              <p className="text-xs font-semibold text-white">Present Admission Pass or Scan Code</p>
              <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                Target ordinand digital QR pass, or enter their registration code below for instant verification.
              </p>
            </div>

            {/* Input form */}
            <form onSubmit={handleScanSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Type Reg Number (e.g. ESOCS/ORD/2026/0481) or Candidate Name..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <Button
                type="submit"
                variant="gold"
                size="md"
                disabled={isSearching || !inputCode.trim()}
                className="font-bold shrink-0"
              >
                {isSearching ? 'Verifying...' : 'Accredit'}
              </Button>
            </form>

            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-950/40 border border-emerald-700/50 text-emerald-300'
                    : feedbackMsg.type === 'error'
                    ? 'bg-red-950/40 border border-red-700/50 text-red-300'
                    : 'bg-amber-950/40 border border-amber-700/50 text-amber-300'
                }`}
              >
                {feedbackMsg.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : feedbackMsg.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <Sparkles className="w-4 h-4 shrink-0" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
            )}
          </div>

          {/* Scanned Candidate Profile & Records */}
          {scannedCandidate ? (
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 space-y-5 shadow-xl animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 border-2 border-amber-500/60 shrink-0 flex items-center justify-center relative">
                    {scannedCandidate.passportPhotoUrl ? (
                      <img src={scannedCandidate.passportPhotoUrl} alt={scannedCandidate.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">{scannedCandidate.regNumber}</span>
                    <h3 className="text-xl font-bold text-white tracking-tight">{scannedCandidate.fullName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        {scannedCandidate.houseOfPrayer ? `${scannedCandidate.houseOfPrayer} • ` : ''}
                        {scannedCandidate.parish}
                        {scannedCandidate.district ? ` (${scannedCandidate.district})` : ''}, {scannedCandidate.province}
                      </span>
                    </p>
                  </div>
                </div>

                <Badge
                  variant={scannedCandidate.isCheckedIn ? 'success' : 'warning'}
                  size="md"
                  className={scannedCandidate.isCheckedIn ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs py-1 px-3' : 'bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs py-1 px-3'}
                >
                  {scannedCandidate.isCheckedIn ? '✓ ACCREDITED PRESENT' : 'PENDING CHECK-IN'}
                </Badge>
              </div>

              {/* Order Elevation & Pew Allocation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px] block">Target Holy Order</span>
                  <span className="font-bold text-amber-300 text-sm">{scannedCandidate.targetRankName}</span>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px] block">Assigned Chancel Pew</span>
                  <span className="font-bold text-white text-sm">{scannedCandidate.seatNumber || 'Zone A - Chancel Pew 14'}</span>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px] block">Financial Clearance</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {scannedCandidate.duesStatus === 'cleared' ? '100% Cleared ✓' : 'Dues Pending'}
                  </span>
                </div>
              </div>

              {/* Robing Prelate & Vestment Specs */}
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Presiding Robing Prelate:</span>
                  <span className="font-bold text-white">{scannedCandidate.robingOfficer || selectedCohortDef.presidingPrelate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Accredited By:</span>
                  <span className="font-mono text-amber-400">{scannedCandidate.accreditedBy || officerName}</span>
                </div>
                {scannedCandidate.checkInTimestamp && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Gate Entry Timestamp:</span>
                    <span className="font-mono">{new Date(scannedCandidate.checkInTimestamp).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {!scannedCandidate.isCheckedIn ? (
                  <Button
                    variant="gold"
                    size="lg"
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    onClick={() => handleAccreditCandidate(scannedCandidate)}
                    className="flex-1 font-bold py-3.5 text-sm shadow-xl shadow-amber-500/20"
                  >
                    Confirm Accreditation & Seat in Chancel
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="md"
                    icon={<RotateCcw className="w-4 h-4" />}
                    onClick={() => handleUndoCheckIn(scannedCandidate)}
                    className="border-red-800 text-red-300 hover:bg-red-950/30"
                  >
                    Revert Accreditation
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Column: Active Cohort Queue Table & Fast Gate Roster (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{selectedCohortDef.title} Stream Roster</span>
                </h3>
                <p className="text-xs text-slate-400">Click any candidate below to view profile details or instant-accredit</p>
              </div>

              {/* Filter check-in status buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setFilterCheckInStatus('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    filterCheckInStatus === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({cohortCandidates.length})
                </button>
                <button
                  onClick={() => setFilterCheckInStatus('checked_in')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    filterCheckInStatus === 'checked_in' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Present ({cohortMetrics.checkedIn})
                </button>
                <button
                  onClick={() => setFilterCheckInStatus('pending')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    filterCheckInStatus === 'pending' ? 'bg-amber-950 text-amber-300 border border-amber-700/50' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pending ({cohortMetrics.pending})
                </button>
              </div>
            </div>

            {/* Search within cohort table */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
                placeholder="Filter candidates in this stream by name, reg number, province..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Candidate List Feed */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredCohortTable.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No candidates matching current cohort filter.
                </div>
              ) : (
                filteredCohortTable.map((c) => {
                  const isScanned = scannedCandidate?.id === c.id;

                  return (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isScanned
                          ? 'bg-slate-950 border-amber-500 ring-1 ring-amber-500/40'
                          : c.isCheckedIn
                          ? 'bg-emerald-950/15 border-emerald-800/40 hover:border-emerald-700/70'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div
                        onClick={() => handleSimulateCohortMember(c)}
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center">
                          {c.passportPhotoUrl ? (
                            <img src={c.passportPhotoUrl} alt={c.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 text-xs">
                          <p className="font-bold text-white truncate">{c.fullName}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <span className="text-amber-300 font-semibold">{c.targetRankName}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-500">{c.regNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {c.isCheckedIn ? (
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Seated
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAccreditCandidate(c)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-sm"
                          >
                            Accredit
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
