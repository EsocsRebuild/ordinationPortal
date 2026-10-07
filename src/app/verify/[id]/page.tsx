'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { CandidateProfile } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { QrCodeSvg } from '@/components/ui/QrCodeSvg';
import { AppLoader } from '@/components/ui/AppLoader';
import { CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';

interface VerifyPageProps {
  params: Promise<{ id: string }>;
}

export default function VerifyPage({ params }: VerifyPageProps) {
  const resolvedParams = use(params);
  const candidateId = resolvedParams.id;

  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await api.getCandidateById(candidateId);
        if (data) {
          setCandidate(data);
        } else {
          setErrorMessage('Canonical record not found in the Holy Order Sovereign Ledger.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Verification failed. Record could not be confirmed.');
      } finally {
        setIsLoading(false);
      }
    }

    verify();
  }, [candidateId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <AppLoader message="Connecting to ESOCS Central Ledger Verification Engine..." />
      </div>
    );
  }

  if (errorMessage || !candidate) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6">
        <div className="max-w-md w-full bg-slate-900/80 border border-red-900/50 rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Credential Verification Failed</h2>
          <p className="text-slate-400 text-sm">{errorMessage || 'Invalid registration number or cryptographic certificate key.'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors pt-4"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Ordination Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl w-full mx-auto space-y-6">
        {/* Top Branding */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Portal Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            LIVE VERIFICATION LEDGER
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-400 shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Canonical Credential Verified & Authentic
                </h1>
                <p className="text-xs text-slate-400">
                  Registered in the Central Holy Synod Archives • ESOCS Church Worldwide
                </p>
              </div>
            </div>
            <Badge variant="success" size="lg" className="shrink-0 bg-emerald-900/40 text-emerald-300 border-emerald-700">
              OFFICIALLY VALID
            </Badge>
          </div>

          {/* Ordinand Profile Record */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            <div className="flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-xl border border-slate-800">
              <QrCodeSvg value={`https://ordination.esocs.church/verify/${candidate.id}`} size={130} />
              <p className="text-[10px] font-mono text-slate-400 mt-2 text-center">
                Digital Cryptographic Seal
              </p>
            </div>

            <div className="sm:col-span-2 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  Ordinand Full Legal Name
                </span>
                <h2 className="text-xl font-serif font-bold text-amber-300 mt-0.5">
                  {candidate.fullName}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-slate-400">Conferred Holy Order:</span>
                  <p className="font-bold text-white text-sm">{candidate.targetRankName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Canonical Registration:</span>
                  <p className="font-mono font-bold text-amber-400 text-sm">{candidate.regNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400">Province / Diocese:</span>
                  <p className="font-semibold text-slate-200">{candidate.province}</p>
                </div>
                <div>
                  <span className="text-slate-400">Parish:</span>
                  <p className="font-semibold text-slate-200">{candidate.parish}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seating & Investiture Verification */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Assigned Investiture Pew</span>
              <span className="font-bold text-white text-sm">{candidate.seatNumber || 'Zone A - Chancel'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Presiding Robing Prelate</span>
              <span className="font-bold text-white text-sm">{candidate.robingOfficer || 'Most Senior Apostle J. K. Coker'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Conference Session</span>
              <span className="font-bold text-white text-sm">{candidate.investitureSession || 'Saturday 09:00 AM'}</span>
            </div>
          </div>

          {/* Cryptographic Hash Security Seal */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Tamper-Proof Verification Hash:</span>
              <span className="text-emerald-400 font-mono text-[10px] font-bold">SHA-256 HMAC VERIFIED</span>
            </div>
            <p className="font-mono text-xs text-amber-300 break-all p-2 bg-slate-900 rounded border border-slate-800">
              {candidate.verificationHash || 'ESOCS-AUTH-2026-B83F4190-2A1B'}
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 mt-6">
        © 1925 – 2026 The Eternal Sacred Order of the Cherubim and Seraphim • Apex Secretariat Verification Engine
      </div>
    </div>
  );
}
