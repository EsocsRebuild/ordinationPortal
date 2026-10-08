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
  ArrowLeft,
  Sparkles,
  Check,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CURRENT_YEAR = 2026;
const YEARS_OPTIONS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

export function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const { registerCandidate, isLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form state
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

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (currentStep === 1) {
      if (!fullName.trim() || !email.trim() || !parish.trim()) {
        setSubmitError('Please complete all required personal and parish identity fields.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validation.isValid) {
        setSubmitError(validation.errorReason || 'Canonical hierarchy rule violation. Please select an eligible target rank.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setSubmitError(null);
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl my-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all text-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/70 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <EsocsLogo size={36} showText={false} />
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Canonical Ordination Registration
                </h3>
                <p className="text-xs text-amber-400">
                  Holy Order General Conference 2026 Onboarding
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Multi-Step Progress Tracker */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { num: 1, title: 'Identity & Parish' },
              { num: 2, title: 'Canonical Rank' },
              { num: 3, title: 'Security & 2FA' },
            ].map((step) => {
              const isCompleted = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div key={step.num} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950'
                          : isCurrent
                          ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-400/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.num}
                    </span>
                    <span className={`hidden sm:inline ${isCurrent ? 'text-white' : 'text-slate-500'}`}>
                      {step.title}
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden bg-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500 w-full'
                          : isCurrent
                          ? 'bg-amber-400 w-1/2'
                          : 'w-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Form Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5">
          {submitError && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/80 text-rose-200 rounded-2xl flex items-start gap-3 text-xs leading-relaxed">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* STEP 1: Personal Identity & Parish */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep} id="reg-step-1" className="space-y-4">
              {/* Gender Order Selection Cards */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Select Holy Order Branch Category *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleGenderChange('male')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      gender === 'male'
                        ? 'bg-amber-500/10 border-amber-500/60 text-white ring-1 ring-amber-500/30 shadow-md'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">Brethren Order</p>
                      <p className="text-[11px] text-slate-400">Male Holy Ministries</p>
                    </div>
                    {gender === 'male' && <Check className="w-4 h-4 text-amber-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenderChange('female')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      gender === 'female'
                        ? 'bg-amber-500/10 border-amber-500/60 text-white ring-1 ring-amber-500/30 shadow-md'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">Sisters Order</p>
                      <p className="text-[11px] text-slate-400">Female Matron Ministries</p>
                    </div>
                    {gender === 'female' && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Full Ecclesiastical Name (Title, First, Middle, Surname) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Senior Apostle Emmanuel Babatunde Adeleke"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Ecclesiastical / Personal Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. e.adeleke@esocs.church"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Mobile Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 803 123 4567"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Province & Parish */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Ecclesiastical Province / Diocese *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:outline-none transition-all font-medium"
                    >
                      {ESOCS_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Local Parish / Cathedral Branch *
                  </label>
                  <div className="relative">
                    <Church className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={parish}
                      onChange={(e) => setParish(e.target.value)}
                      placeholder="e.g. Mount Zion Cathedral Branch"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* STEP 2: Canonical Rank & Hierarchy Validation */}
          {currentStep === 2 && (
            <form onSubmit={handleNextStep} id="reg-step-2" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Current Ordination Rank *
                  </label>
                  <select
                    value={currentRank}
                    onChange={(e) => setCurrentRank(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:outline-none transition-all font-medium"
                  >
                    {availableRanks.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Year of Current Ordination *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select
                      value={currentRankYear}
                      onChange={(e) => setCurrentRankYear(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:outline-none transition-all font-medium"
                    >
                      {YEARS_OPTIONS.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr} ({CURRENT_YEAR - yr} years active tenure)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Target Ordination Rank */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Target Elevation Rank *
                </label>
                <select
                  value={targetRankName}
                  onChange={(e) => setTargetRankName(e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-950/80 border rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:outline-none transition-all font-medium ${
                    validation.isValid
                      ? 'border-emerald-500/60 focus:ring-emerald-500/20 focus:border-emerald-400'
                      : 'border-rose-500/60 focus:ring-rose-500/20 focus:border-rose-400 text-rose-300'
                  }`}
                >
                  {availableRanks.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hierarchy Validation Feedback Card */}
              {!validation.isValid ? (
                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/80 text-rose-200 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-xs">Hierarchy Anti-Skipping Rule Violated</p>
                      <p className="text-[11px] leading-relaxed text-slate-300">{validation.errorReason}</p>
                    </div>
                  </div>

                  {validation.expectedNextRank && (
                    <div className="pt-2 flex items-center justify-between border-t border-rose-900/60">
                      <span className="text-[11px] text-rose-300">
                        Canonical next rank: <strong>{validation.expectedNextRank.name}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={handleApplyCanonicalRecommendation}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
                      >
                        Select {validation.expectedNextRank.name}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/80 text-emerald-200 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-white">Canonical Elevation Verified</p>
                      <p className="text-[11px] text-emerald-300">
                        {currentRank} → <strong>{targetRankName}</strong> (Single-Step Order Passed)
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 shrink-0">
                    {validation.tenureYears} yrs tenure ✓
                  </span>
                </div>
              )}

              {/* Statutory Fee Breakdown Card */}
              {validation.levyBreakdown && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300 pb-2 border-b border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      Statutory 4-Tier Assessment for {targetRankName}
                    </span>
                    <span className="text-sm font-mono text-white">
                      Total: {formatCurrency(validation.levyBreakdown.total)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Branch Parish</span>
                      <span className="font-semibold text-white">{formatCurrency(validation.levyBreakdown.branchLevy)}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">District Council</span>
                      <span className="font-semibold text-white">{formatCurrency(validation.levyBreakdown.districtLevy)}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Provincial Diocese</span>
                      <span className="font-semibold text-white">{formatCurrency(validation.levyBreakdown.provincialLevy)}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Holy Synod Robing</span>
                      <span className="font-semibold text-white">{formatCurrency(validation.levyBreakdown.nationalFee)}</span>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* STEP 3: Security & Credentials */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmit} id="reg-step-3" className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-2.5 text-xs">
                <ShieldCheck className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                <p className="leading-relaxed">
                  Choose a secure password for your candidate dashboard. You can access your clearance progress and digital admission pass at any time.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Create Password (minimum 6 characters) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter preferred password"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enable2FA}
                  onChange={(e) => setEnable2FA(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-amber-400 border-slate-700 bg-slate-900"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-white block">
                    Enable Two-Factor Authentication (2FA)
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Receive a 6-digit confirmation token on your email during every new login.
                  </span>
                </div>
              </label>
            </form>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={handlePrevStep}
              icon={<ArrowLeft className="w-4 h-4" />}
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              Back
            </Button>
          ) : (
            <Button variant="outline" size="md" type="button" onClick={onClose} className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
              Cancel
            </Button>
          )}

          {currentStep < 3 ? (
            <Button
              variant="gold"
              size="md"
              type="submit"
              form={`reg-step-${currentStep}`}
              icon={<ChevronRight className="w-4 h-4" />}
              className="font-bold"
            >
              Continue to Step {currentStep + 1}
            </Button>
          ) : (
            <Button
              variant="gold"
              size="md"
              type="submit"
              form="reg-step-3"
              disabled={!validation.isValid}
              loading={isLoading}
              icon={<CheckCircle2 className="w-4 h-4" />}
              className="font-bold shadow-lg shadow-amber-500/20"
            >
              Complete Application
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
