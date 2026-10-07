'use client';

import React, { useState, useEffect } from 'react';
import { CandidateProfile } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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
} from 'lucide-react';

interface LiveAccreditationDeskProps {
  officerName?: string;
}

export function LiveAccreditationDesk({ officerName = 'Accreditation Marshal' }: LiveAccreditationDeskProps) {
  const [inputCode, setInputCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [scannedCandidate, setScannedCandidate] = useState<CandidateProfile | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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

  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  const loadMetrics = async () => {
    try {
      const data = await api.getAttendanceMetrics();
      setMetrics(data);
    } catch (e) {
      console.error('Failed to load attendance metrics:', e);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 10000); // 10s live polling
    return () => clearInterval(interval);
  }, []);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setIsSearching(true);
    setFeedbackMsg(null);

    try {
      const cand = await api.getCandidateById(inputCode.trim());
      if (cand) {
        setScannedCandidate(cand);
      } else {
        setFeedbackMsg({ text: `No candidate matching '${inputCode}' found.`, type: 'error' });
      }
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Lookup failed.', type: 'error' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmAccreditation = async () => {
    if (!scannedCandidate) return;

    try {
      const res = await api.checkInCandidate({
        identifier: scannedCandidate.id,
        officerName,
        action: 'check_in',
      });

      setScannedCandidate(res.candidate);
      setFeedbackMsg({
        text: `✓ ACCREDITED! ${res.candidate.fullName} checked in to ${res.candidate.seatNumber || 'Chancel Pew'}.`,
        type: 'success',
      });

      await loadMetrics();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Accreditation failed.', type: 'error' });
    }
  };

  const handleUndoCheckIn = async () => {
    if (!scannedCandidate) return;

    try {
      const res = await api.checkInCandidate({
        identifier: scannedCandidate.id,
        officerName,
        action: 'undo_check_in',
      });

      setScannedCandidate(res.candidate);
      setFeedbackMsg({
        text: `Check-in reversed for ${res.candidate.fullName}.`,
        type: 'error',
      });

      await loadMetrics();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Reversal failed.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Live Cathedral Gate Accreditation
              </span>
              <span className="text-xs font-mono text-slate-400">Ordination Day 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Investiture Attendance & QR Accreditation Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Scan candidate QR pass or enter registration ID to accredit ordinands, verify dues, and assign robing chancel pews.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shrink-0">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono text-emerald-400 font-bold">GATE ACCREDITATION LIVE</span>
          </div>
        </div>
      </div>

      {/* Live Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Expected Ordinands</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {metrics?.totalEligible ?? '...'}
          </p>
          <span className="text-[11px] text-slate-500">Holy Synod Ratified Cohort</span>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Checked-In & Present</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400">
            {metrics?.checkedInCount ?? '...'}
          </p>
          <span className="text-[11px] text-emerald-500 font-semibold">
            {metrics?.attendancePercentage ?? 0}% Total Quota Seated
          </span>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Cathedral Arrival</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-400">
            {metrics?.pendingCount ?? '...'}
          </p>
          <span className="text-[11px] text-slate-500">En route / Awaiting check-in</span>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Cathedral Seating</span>
            <Building className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-purple-300">
            Chancel A
          </p>
          <span className="text-[11px] text-slate-500">Main Apex Auditorium</span>
        </div>
      </div>

      {/* Main Scanner / Entry & Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR / ID Entry & Candidate Verification Drawer (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Scanner Input Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Ordinand Pass Scanner & ID Verification</span>
            </h3>

            <form onSubmit={handleScanSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Scan QR Barcode or type Reg No. (e.g. ESOCS/ORD/2026/0481)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <Button
                type="submit"
                variant="gold"
                size="md"
                disabled={isSearching || !inputCode.trim()}
                className="font-bold"
              >
                {isSearching ? 'Looking up...' : 'Lookup'}
              </Button>
            </form>

            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-950/40 border border-emerald-700/50 text-emerald-300'
                    : 'bg-red-950/40 border border-red-700/50 text-red-300'
                }`}
              >
                {feedbackMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{feedbackMsg.text}</span>
              </div>
            )}
          </div>

          {/* Scanned Candidate Accreditation Dossier */}
          {scannedCandidate ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-amber-500/40 shrink-0 flex items-center justify-center">
                    {scannedCandidate.passportPhotoUrl ? (
                      <img src={scannedCandidate.passportPhotoUrl} alt={scannedCandidate.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">{scannedCandidate.regNumber}</span>
                    <h3 className="text-lg font-bold text-white">{scannedCandidate.fullName}</h3>
                    <p className="text-xs text-slate-400">{scannedCandidate.parish}, {scannedCandidate.province}</p>
                  </div>
                </div>

                <Badge
                  variant={scannedCandidate.isCheckedIn ? 'success' : 'warning'}
                  size="md"
                  className={scannedCandidate.isCheckedIn ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}
                >
                  {scannedCandidate.isCheckedIn ? '✓ ACCREDITED PRESENT' : 'PENDING CHECK-IN'}
                </Badge>
              </div>

              {/* Ordination Target & Clearance Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Target Ordination Rank</span>
                  <span className="font-bold text-amber-300">{scannedCandidate.targetRankName}</span>
                </div>
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Assigned Chancel Pew</span>
                  <span className="font-bold text-white">{scannedCandidate.seatNumber || 'Zone A - Chancel Pew 14'}</span>
                </div>
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Financial Clearance</span>
                  <span className="font-bold text-emerald-400">
                    {scannedCandidate.duesStatus === 'cleared' ? '100% Cleared ✓' : 'Payment Required'}
                  </span>
                </div>
              </div>

              {/* Accreditation Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {!scannedCandidate.isCheckedIn ? (
                  <Button
                    variant="gold"
                    size="lg"
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    onClick={handleConfirmAccreditation}
                    className="flex-1 font-bold py-3 text-sm shadow-xl shadow-amber-500/20"
                  >
                    Confirm Accreditation & Check-In
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="md"
                    icon={<RotateCcw className="w-4 h-4" />}
                    onClick={handleUndoCheckIn}
                    className="border-red-800/80 text-red-300 hover:bg-red-950/30"
                  >
                    Revert Check-In
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-10 text-center text-slate-500 space-y-2">
              <QrCode className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">Ready for Scan</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Scan an ordinand’s QR admission pass or search above to verify accreditation credentials.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Live Rank Breakdown & Arrivals Stream (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Rank Attendance Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Attendance by Conferred Rank</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Live Tracker</span>
            </h3>

            <div className="space-y-3">
              {metrics?.rankBreakdown.map((r) => {
                const pct = r.total > 0 ? Math.round((r.checkedIn / r.total) * 100) : 0;
                return (
                  <div key={r.rankName} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300 truncate max-w-[200px]">{r.rankName}</span>
                      <span className="font-mono text-slate-400">
                        <strong className="text-emerald-400">{r.checkedIn}</strong> / {r.total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Arrivals Stream */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Recent Cathedral Arrivals</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto">
              {!metrics?.recentArrivals || metrics.recentArrivals.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No arrivals checked in yet today.</p>
              ) : (
                metrics.recentArrivals.map((arrival) => (
                  <div key={arrival.id} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-200">{arrival.fullName}</p>
                      <p className="text-[11px] text-amber-300">{arrival.targetRankName} • {arrival.seatNumber}</p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      {new Date(arrival.checkInTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

