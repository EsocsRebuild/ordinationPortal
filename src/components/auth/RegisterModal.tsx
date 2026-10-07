'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { EsocsLogo } from '@/components/ui/EsocsLogo';
import { ESOCS_RANKS, ESOCS_PROVINCES } from '@/lib/constants';
import { validateRankProgression, getRankByName } from '@/utils/ranks';
import { formatCurrency } from '@/utils/formatters';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Church,
  MapPin,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Calendar,
  CreditCard,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CURRENT_YEAR = 2026;
const YEARS_OPTIONS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

export function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const { registerCandidate, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [province, setProvince] = useState(ESOCS_PROVINCES[0]);
  const [parish, setParish] = useState('');
  const [currentRank, setCurrentRank] = useState('Pastor');
  const [currentRankYear, setCurrentRankYear] = useState(2022);
  const [targetRankName, setTargetRankName] = useState('Evangelist');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enable2FA, setEnable2FA] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filter available ranks by gender
  const availableRanks = useMemo(() => {
    return ESOCS_RANKS.filter((r) => r.genderEligibility === 'both' || r.genderEligibility === gender);
  }, [gender]);

  // Real-time canonical step & tenure validation
  const validation = useMemo(() => {
    return validateRankProgression(currentRank, targetRankName, gender, currentRankYear, CURRENT_YEAR);
  }, [currentRank, targetRankName, gender, currentRankYear]);

  if (!isOpen) return null;

  const handleGenderChange = (newGender: 'male' | 'female') => {
    setGender(newGender);
    if (newGender === 'male') {
      setCurrentRank('Pastor');
      setTargetRankName('Evangelist');
    } else {
      setCurrentRank('Lady Leader');
      setTargetRankName('Dorcas');
    }
  };

  const handleApplyCanonicalRecommendation = () => {
    if (validation.expectedNextRank) {
      setTargetRankName(validation.expectedNextRank.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!fullName.trim() || !email.trim() || !parish.trim()) {
      setSubmitError('Please complete all required fields.');
      return;
    }

    if (!validation.isValid) {
      setSubmitError(validation.errorReason || 'Canonical hierarchy rule violation. Please correct target rank.');
      return;
    }

    if (password.length < 6) {
      setSubmitError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      await registerCandidate({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || '+234 800 000 0000',
        gender,
        province,
        parish: parish.trim(),
        currentRank,
        targetRankName,
        password,
        enable2FA,
      });
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit ordination registration.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-premium overflow-hidden transition-all text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <EsocsLogo size={38} showText={false} />
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-church-950 dark:text-white">
                Canonical Ordination Application & Self-Registration
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Multi-tier ecclesiastical onboarding with anti-skipping hierarchy validation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
          {submitError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Canonical Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-gold-500/10 dark:bg-gold-500/15 border border-gold-400/30 text-gold-950 dark:text-gold-200 flex items-start gap-2.5 text-[11px]">
            <Shield className="w-4 h-4 shrink-0 text-gold-600 dark:text-gold-400 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Canonical Order of Ascension & 5-Tier Vetting:</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Your application will flow through Branch → District → Province → CMC National Screening → Holy Synod Advisory Board. Rank elevation is strictly sequential according to ESOCS constitutional orders.
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-xs">
              <User className="w-3.5 h-3.5 text-gold-500" />
              Candidate Identity & Ecclesiastical Profile
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name (Title, First, Middle, Surname) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Pastor Emmanuel Babatunde Adeleke"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-church-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gender Order *
                </label>
                <select
                  value={gender}
                  onChange={(e) => handleGenderChange(e.target.value as 'male' | 'female')}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-church-500 focus:outline-none font-medium"
                >
                  <option value="male">Brethren (Male Order)</option>
                  <option value="female">Sisters (Female Order)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ecclesiastical / Personal Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. e.adeleke@esocs.church"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-church-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 123 4567"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-church-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Province / Diocese *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-church-500 focus:outline-none"
                  >
                    {ESOCS_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Local Parish / Branch Name *
                </label>
                <div className="relative">
                  <Church className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={parish}
                    onChange={(e) => setParish(e.target.value)}
                    placeholder="e.g. Mount Zion Cathedral Branch"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-church-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Canonical Rank Progression & Hierarchy Verification */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <h4 className="font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                Ecclesiastical Rank Progression & Tenure
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                Strict Order Verification
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Rank *
                </label>
                <select
                  value={currentRank}
                  onChange={(e) => setCurrentRank(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-church-500 focus:outline-none font-medium"
                >
                  {availableRanks.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Year of Current Ordination *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={currentRankYear}
                    onChange={(e) => setCurrentRankYear(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-church-500 focus:outline-none font-medium"
                  >
                    {YEARS_OPTIONS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr} ({CURRENT_YEAR - yr} yrs in rank)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Ordination Rank *
                </label>
                <select
                  value={targetRankName}
                  onChange={(e) => setTargetRankName(e.target.value)}
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-xl text-xs focus:ring-2 focus:outline-none font-medium ${
                    validation.isValid
                      ? 'border-emerald-400 dark:border-emerald-600 focus:ring-emerald-500'
                      : 'border-rose-400 dark:border-rose-600 focus:ring-rose-500 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {availableRanks.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Hierarchy Validation Feedback Banner */}
            {!validation.isValid ? (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 space-y-2">
                <div className="flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Hierarchy Validation Failure (Anti-Skipping Rule):</p>
                    <p className="text-[11px] leading-relaxed">{validation.errorReason}</p>
                  </div>
                </div>

                {validation.expectedNextRank && (
                  <div className="pt-1 flex items-center justify-between border-t border-rose-200 dark:border-rose-900/60">
                    <span className="text-[11px] text-rose-700 dark:text-rose-300">
                      Canonical expected rank: <strong>{validation.expectedNextRank.name}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyCanonicalRecommendation}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-colors flex items-center gap-1 shadow-sm"
                    >
                      Select {validation.expectedNextRank.name}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-xs">Canonical Progression Verified: </span>
                    <span className="text-[11px]">
                      {currentRank} → <strong>{targetRankName}</strong> (Sequential Order Confirmed)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded font-semibold text-emerald-800 dark:text-emerald-200">
                  {validation.tenureYears} yrs tenure
                </span>
              </div>
            )}

            {/* Tenure Warning if Applicable */}
            {validation.tenureWarning && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <span>{validation.tenureWarning}</span>
              </div>
            )}

            {/* Mandatory Levies & Dues Breakdown */}
            {validation.levyBreakdown && (
              <div className="mt-2 p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-church-900 dark:text-gold-300">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    Mandatory Ordination Levies & Assessment for {targetRankName}
                  </span>
                  <span className="text-sm font-mono text-gold-600 dark:text-gold-400">
                    Total: {formatCurrency(validation.levyBreakdown.total)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">1. Branch Levy</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(validation.levyBreakdown.branchLevy)}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">2. District Levy</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(validation.levyBreakdown.districtLevy)}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">3. Provincial Dues</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(validation.levyBreakdown.provincialLevy)}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">4. National Fee</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(validation.levyBreakdown.nationalFee)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User-Defined Preferred Password */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2 text-church-900 dark:text-gold-300 font-bold">
              <KeyRound className="w-4 h-4" />
              <span>Create Your Own Secure Password</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              You choose and maintain your password. No assigned keys that get forgotten.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Create Password (min 6 chars) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter preferred password"
                    className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-church-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-church-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2FA Option */}
            <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enable2FA}
                onChange={(e) => setEnable2FA(e.target.checked)}
                className="w-4 h-4 rounded text-church-600 focus:ring-church-500 border-slate-300 dark:border-slate-600"
              />
              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                Protect this account with Two-Factor Authentication (2FA / MFA)
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="outline" size="md" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={!validation.isValid}
              loading={isLoading}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Submit Application to Parish Chairman
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
