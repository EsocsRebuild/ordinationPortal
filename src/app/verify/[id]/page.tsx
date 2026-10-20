'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { Badge } from '@/components/ui/Badge';
import { QrCodeSvg } from '@/components/ui/QrCodeSvg';
import { AppLoader } from '@/components/ui/AppLoader';
import { CheckCircle2, ArrowLeft, AlertCircle, Clock, ShieldCheck, UserCheck } from 'lucide-react';

interface VerifyRecord {
  id: string;
  regNumber: string;
  fullName: string;
  currentRank: string;
  targetRankName: string;
  province: string;
  district?: string;
  parish: string;
  duesStatus: string;
  stage: string;
  certificateNumber?: string | null;
  verificationHash?: string | null;
  investitureSession?: string | null;
  seatNumber?: string | null;
  isValid: boolean;
  verificationDate: string;
  institution: string;
  authority: string;
}

interface VerifyPageProps {
  params: Promise<{ id: string }>;
}

export default function VerifyPage({ params }: VerifyPageProps) {
  const resolvedParams = use(params);
  const candidateId = resolvedParams.id;

  const [record, setRecord] = useState<VerifyRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await api.verifyCredential(candidateId);
        if (data) {
          setRecord(data);
        } else {
          setErrorMessage('Ordination record not found in the official church registry.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Verification failed. Record could not be located.');
      } finally {
        setIsLoading(false);
      }
    }

    verify();
  }, [candidateId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <AppLoader message="Checking Official Ordination Register..." />
      </div>
    );
  }

  if (errorMessage || !record) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-900/50 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white font-serif">Record Not Found</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {errorMessage || 'The requested registration number or identifier could not be verified in the church registry.'}
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = record.isValid;
  const isDuesCleared = record.duesStatus === 'cleared';

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl w-full mx-auto space-y-6">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-900/60"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className={`w-2 h-2 rounded-full inline-block ${isCompleted ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>OFFICIAL CHURCH REGISTRY</span>
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-2xl ${isCompleted ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-400' : 'bg-amber-950/80 border border-amber-700/60 text-amber-400'}`}>
                {isCompleted ? <CheckCircle2 className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {isCompleted ? 'Official Ordination Credential Verified' : 'Candidate Application Under Review'}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isCompleted
                    ? 'Registered in the Official Church Ordination Records • ESOCS Church Worldwide'
                    : 'Candidate is enrolled in the ordination screening process • Investiture pass pending clearance'}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase shrink-0 border ${
              isCompleted
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              {isCompleted ? 'Officially Valid' : 'Screening in Progress'}
            </span>
          </div>

          {/* Member Profile Record */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            <div className="flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80">
              <QrCodeSvg value={`https://ordination.esocs.church/verify/${record.id}`} size={124} />
              <p className="text-[10px] font-mono text-slate-400 mt-2.5 text-center">
                Digital Verification Code
              </p>
            </div>

            <div className="sm:col-span-2 space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                  Candidate Full Name
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-300 mt-0.5">
                  {record.fullName}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">Target Ordination Rank:</span>
                  <p className="font-bold text-white text-sm mt-0.5">{record.targetRankName}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Registration Number:</span>
                  <p className="font-mono font-bold text-amber-400 text-sm mt-0.5">{record.regNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Province / Diocese:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{record.province}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Parish / Branch:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{record.parish}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Real Status Progression */}
          <div className="p-4 sm:p-5 bg-slate-950/60 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] mb-1">Clearance Progress</span>
              <span className="font-bold text-white text-sm capitalize">
                {record.stage ? record.stage.replace(/_/g, ' ') : 'Under Review'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] mb-1">Ordination Dues</span>
              <span className={`font-bold text-sm inline-flex items-center gap-1.5 ${isDuesCleared ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isDuesCleared ? 'Cleared ✓' : 'Payment Pending'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] mb-1">Ceremony Seating & Pass</span>
              <span className="font-bold text-white text-sm">
                {record.seatNumber ? `Pew: ${record.seatNumber}` : isCompleted ? 'Assigned at Venue' : 'Pending Clearance'}
              </span>
            </div>
          </div>

          {/* Certificate & Hash Details (Only if officially issued) */}
          {isCompleted && record.certificateNumber && (
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Certificate Number:</span>
                <span className="text-emerald-400 font-mono font-bold">{record.certificateNumber}</span>
              </div>
              {record.verificationHash && (
                <div className="pt-1">
                  <span className="text-[10px] text-slate-500 font-mono block mb-1">Digital Certificate Hash:</span>
                  <p className="font-mono text-[11px] text-amber-300/90 break-all p-2 bg-slate-900 rounded-xl border border-slate-800">
                    {record.verificationHash}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Guidance note for pending applicants */}
          {!isCompleted && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Notice for Candidates & Verification Officers</span>
              </div>
              <p className="leading-relaxed">
                This ordination file is undergoing official verification across parish, district, and provincial review boards. Digital ceremony admission passes and official credentials are automatically issued upon final approval.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 mt-8">
        © 1925 – 2026 The Eternal Sacred Order of the Cherubim and Seraphim Worldwide • Official Ordination Register
      </div>
    </div>
  );
}
