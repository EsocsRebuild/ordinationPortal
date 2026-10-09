'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { EsocsLogo } from '@/components/ui/EsocsLogo';
import { ProvinceHierarchy, EcclesiasticalRank } from '@/types';
import {
  ESOCS_RANKS,
  ESOCS_HIERARCHY,
  getDistrictsForProvince,
  getAllBranchesForProvince,
  getBranchesForDistrict,
  getHousesOfPrayerForBranch,
} from '@/lib/constants';
import { validateRankProgression, getRankByName } from '@/utils/ranks';
import { formatCurrency } from '@/utils/formatters';
import { PhoneValidationResult } from '@/utils/phoneValidation';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { InternationalPhoneInput } from '@/components/ui/InternationalPhoneInput';
import { api } from '@/services/api';
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Church,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Calendar,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  ShieldCheck,
  Camera,
  Layers,
  Building,
  Award,
} from 'lucide-react';

// Dedicated Male & Female Icons
const MaleOrderIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="10" cy="7" r="4" />
    <path d="M19 8l3-3" />
    <path d="M16 5h6v6" />
  </svg>
);

const FemaleOrderIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="10" cy="7" r="4" />
    <path d="M18 11v6" />
    <path d="M15 14h6" />
  </svg>
);

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CURRENT_YEAR = 2026;
const YEARS_OPTIONS = Array.from({ length: 35 }, (_, i) => CURRENT_YEAR - i);

export function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const { registerCandidate, isLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Holy Order Ministry state
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Structured Name state
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredName, setPreferredName] = useState('');

  // Contact state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneValidation, setPhoneValidation] = useState<PhoneValidationResult | null>(null);

  // Dynamic Ecclesiastical Hierarchy & Ranks state (loaded from live backend)
  const [liveHierarchy, setLiveHierarchy] = useState<ProvinceHierarchy[]>(ESOCS_HIERARCHY);
  const [liveRanks, setLiveRanks] = useState<EcclesiasticalRank[]>(ESOCS_RANKS);

  useEffect(() => {
    api.getHierarchy()
      .then((res) => {
        if (res && Array.isArray(res.hierarchy) && res.hierarchy.length > 0) {
          setLiveHierarchy(res.hierarchy);
        }
      })
      .catch(() => {});

    api.getRanks()
      .then((res) => {
        if (res && Array.isArray(res.ranks) && res.ranks.length > 0) {
          setLiveRanks(res.ranks);
        }
      })
      .catch(() => {});
  }, []);

  // Canonical rank state
  const [currentRank, setCurrentRank] = useState('Pastor');
  const [currentRankYear, setCurrentRankYear] = useState(2022);
  const [targetRankName, setTargetRankName] = useState('Evangelist');

  // Ecclesiastical Hierarchy state
  const [province, setProvince] = useState<string>(() => liveHierarchy[0]?.name || 'Lagos Central Province');
  const [district, setDistrict] = useState<string>(() => {
    return liveHierarchy[0]?.districts[0]?.name || 'Ebute Metta District';
  });
  const [parish, setParish] = useState<string>(() => {
    return liveHierarchy[0]?.districts[0]?.branches[0]?.name || 'Mount Zion Cathedral Branch';
  });
  const [houseOfPrayer, setHouseOfPrayer] = useState<string>(() => {
    return liveHierarchy[0]?.districts[0]?.branches[0]?.housesOfPrayer?.[0] || 'Main House of Prayer';
  });
  const [customHouseOfPrayer, setCustomHouseOfPrayer] = useState('');
  const [isCustomHouse, setIsCustomHouse] = useState(false);
  const [passportPhotoUrl, setPassportPhotoUrl] = useState<string | null>(null);

  // Security state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enable2FA, setEnable2FA] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filter available ranks by gender dynamically
  const availableRanks = useMemo(() => {
    return liveRanks.filter((r) => r.genderEligibility === 'both' || r.genderEligibility === gender);
  }, [liveRanks, gender]);

  // Compute full name automatically
  const computedFullName = useMemo(() => {
    const parts = [firstName.trim(), middleName.trim(), lastName.trim()].filter(Boolean);
    return parts.join(' ');
  }, [firstName, middleName, lastName]);

  // Hierarchy options for the selected Province dynamically
  const provinceOptions = useMemo(() => {
    return liveHierarchy.map((prov) => ({
      value: prov.name,
      label: prov.name,
      subLabel: prov.shortCode,
      badge: `${prov.districts.length} Districts`,
    }));
  }, [liveHierarchy]);

  // All branches across the selected Province dynamically
  const provinceBranches = useMemo(() => {
    const foundProv = liveHierarchy.find((p) => p.name === province);
    if (!foundProv) return [];
    const list: Array<{ id: string; name: string; districtName: string; housesOfPrayer: string[] }> = [];
    for (const d of foundProv.districts) {
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
  }, [liveHierarchy, province]);

  const branchOptions = useMemo(() => {
    return provinceBranches.map((br) => ({
      value: br.name,
      label: br.name,
      subLabel: br.districtName,
      badge: 'Parish Branch',
    }));
  }, [provinceBranches]);

  // Houses of prayer for selected branch
  const availableHousesOfPrayer = useMemo(() => {
    const foundBranch = provinceBranches.find((b) => b.name === parish);
    return foundBranch?.housesOfPrayer || ['Main House of Prayer', 'Sanctuary of Grace'];
  }, [provinceBranches, parish]);

  const houseOptions = useMemo(() => {
    return availableHousesOfPrayer.map((h) => ({
      value: h,
      label: h,
      subLabel: 'Sanctuary / Altar of Prayer',
    }));
  }, [availableHousesOfPrayer]);

  // Handle Province change - automatically refreshes all branches in this province
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

  // Handle Branch change
  const handleBranchChange = (newBranchName: string) => {
    setParish(newBranchName);
    const foundBranch = provinceBranches.find((b) => b.name === newBranchName);
    if (foundBranch) {
      setDistrict(foundBranch.districtName);
      setHouseOfPrayer(foundBranch.housesOfPrayer[0] || 'Main House of Prayer');
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

  // Canonical progression validation
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

  const handlePassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPassportPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhoneChange = (val: string, result: PhoneValidationResult) => {
    setPhone(val);
    setPhoneValidation(result);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (currentStep === 1) {
      if (!firstName.trim()) {
        setSubmitError('First name is required.');
        return;
      }
      if (!lastName.trim()) {
        setSubmitError('Last name / Surname is required.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email.trim())) {
        setSubmitError('Please enter a valid ecclesiastical or personal email address.');
        return;
      }
      if (!phone.trim()) {
        setSubmitError('Mobile phone number is required.');
        return;
      }
      if (phoneValidation && !phoneValidation.isValid) {
        setSubmitError(phoneValidation.error || 'Please enter a valid mobile phone number for your selected country.');
        return;
      }
      if (!province || !parish) {
        setSubmitError('Please select your Ecclesiastical Province and Local Parish Branch.');
        return;
      }
      if (isCustomHouse && !customHouseOfPrayer.trim()) {
        setSubmitError('Please specify the name of your House of Prayer / Sanctuary.');
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

    const resolvedHouseOfPrayer = isCustomHouse ? customHouseOfPrayer.trim() : houseOfPrayer;
    const resolvedPhone = phoneValidation?.isValid ? phoneValidation.formatted : phone.trim();

    try {
      await registerCandidate({
        fullName: computedFullName,
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        preferredName: preferredName.trim() || undefined,
        email: email.trim(),
        phone: resolvedPhone,
        gender,
        province,
        district: district || `${province} Central District`,
        parish,
        houseOfPrayer: resolvedHouseOfPrayer,
        passportPhotoUrl: passportPhotoUrl || undefined,
        currentRank,
        currentRankYear,
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/60 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/80 flex flex-col max-h-[94vh] sm:max-h-[90vh] overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-inner">
                <EsocsLogo size={34} showText={false} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Canonical Ordination Registration
                </h3>
                <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                  Holy Order General Conference 2026 Ordinand Portal
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-slate-700/40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Timeline */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { num: 1, title: 'Profile & Jurisdiction' },
              { num: 2, title: 'Ordination Order' },
              { num: 3, title: 'Account Security' },
            ].map((step) => {
              const isCompleted = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div key={step.num} className="space-y-1.5">
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

        {/* Modal Form Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {submitError && (
            <div className="p-4 bg-rose-950/50 border border-rose-800/80 text-rose-200 rounded-2xl flex items-start gap-3 text-xs sm:text-sm leading-relaxed animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* STEP 1: Personal Identity, Ministry Order & Ecclesiastical Jurisdiction */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep} id="reg-step-1" className="space-y-6 animate-in fade-in">
              
              {/* 1. Holy Order Ministry Switch with Clear Male & Female Icons */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Holy Order Ministry <span className="text-amber-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950/70 border border-slate-800/90 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => handleGenderChange('male')}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2.5 ${
                      gender === 'male'
                        ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/20 border border-amber-500/60 text-amber-300 ring-2 ring-amber-500/20 shadow-md'
                        : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                    }`}
                  >
                    <MaleOrderIcon className={`w-5 h-5 ${gender === 'male' ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>Brethren Order (Male)</span>
                    {gender === 'male' && <Check className="w-4 h-4 text-amber-400 stroke-[3]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderChange('female')}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2.5 ${
                      gender === 'female'
                        ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/20 border border-amber-500/60 text-amber-300 ring-2 ring-amber-500/20 shadow-md'
                        : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                    }`}
                  >
                    <FemaleOrderIcon className={`w-5 h-5 ${gender === 'female' ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>Sisters Order (Female)</span>
                    {gender === 'female' && <Check className="w-4 h-4 text-amber-400 stroke-[3]" />}
                  </button>
                </div>
              </div>

              {/* 2. Structured Name Inputs (First, Middle, Last, Preferred) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Member Name Details <span className="text-amber-400">*</span>
                  </label>
                  {computedFullName && (
                    <span className="text-xs text-amber-300 font-mono font-medium truncate max-w-[260px]">
                      {computedFullName}
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
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
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
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
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
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Adeleke"
                      className="w-full px-3.5 py-3 bg-slate-950/70 hover:bg-slate-950/90 border border-slate-800 focus:border-amber-400/90 focus:ring-4 focus:ring-amber-400/10 rounded-xl text-sm font-medium text-white placeholder-slate-500 transition-all"
                    />
                  </div>
                </div>

                {/* Preferred Name & Current Rank Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-slate-400">
                      Preferred / Alias Name <span className="text-slate-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={preferredName}
                      onChange={(e) => setPreferredName(e.target.value)}
                      placeholder="e.g. Pastor Adeleke"
                      className="w-full px-3.5 py-3 bg-slate-950/70 hover:bg-slate-950/90 border border-slate-800 focus:border-amber-400/90 focus:ring-4 focus:ring-amber-400/10 rounded-xl text-sm font-medium text-white placeholder-slate-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-slate-400">
                      Current Confirmed Rank <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={currentRank}
                      onChange={(e) => setCurrentRank(e.target.value)}
                      className="w-full px-3.5 py-3 bg-slate-950/70 hover:bg-slate-950/90 border border-slate-800 focus:border-amber-400/90 focus:ring-4 focus:ring-amber-400/10 rounded-xl text-sm font-medium text-white transition-all outline-none"
                    >
                      {availableRanks.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name} ({r.liturgicalColor || r.robingCategory})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Email & International Phone Input with Country Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Ecclesiastical / Personal Email <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. e.adeleke@esocs.church"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/70 hover:bg-slate-950/90 border border-slate-800 focus:border-amber-400/90 focus:ring-4 focus:ring-amber-400/10 rounded-xl text-sm text-white placeholder-slate-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <InternationalPhoneInput
                    value={phone}
                    onChange={handlePhoneChange}
                    defaultCountry="NG"
                    label="Mobile Phone Number (Worldwide / Nigeria)"
                    required
                  />
                </div>
              </div>

              {/* 4. Ecclesiastical Hierarchy (Province -> Direct Branch Dropdown -> Sanctuary) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/90">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Ecclesiastical Territorial Jurisdiction
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Searchable Church Directory</span>
                </div>

                {/* Tier 1: Province & Tier 2: Local Parish Branch (Shows all branches in province) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SearchableSelect
                    label="1. Ecclesiastical Province / Diocese"
                    required
                    options={provinceOptions}
                    value={province}
                    onChange={handleProvinceChange}
                    placeholder="Search Province or Diocese..."
                    searchPlaceholder="Type keyword (e.g. Lagos, Edo, Delta, Western, UK, USA)..."
                    icon={<MapPin className="w-4 h-4 text-amber-400" />}
                  />

                  <SearchableSelect
                    label="2. Local Parish / Cathedral Branch"
                    required
                    options={branchOptions}
                    value={parish}
                    onChange={handleBranchChange}
                    placeholder="Search Parish or Branch..."
                    searchPlaceholder={`Search all branches in ${province}...`}
                    icon={<Church className="w-4 h-4 text-amber-400" />}
                  />
                </div>

                {/* Tier 3: House of Prayer / Sanctuary */}
                <div className="space-y-2">
                  <SearchableSelect
                    label="3. House of Prayer / Sanctuary / Chapel"
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
                      <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                        Specify House of Prayer / Sanctuary Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customHouseOfPrayer}
                        onChange={(e) => setCustomHouseOfPrayer(e.target.value)}
                        placeholder="e.g. Mount Horeb Sanctuary of Grace"
                        className="w-full px-4 py-3 bg-slate-950/80 border border-amber-500/50 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-4 focus:ring-amber-500/15 focus:border-amber-400 focus:outline-none transition-all font-medium"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Passport Photo Upload Preview */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Passport Photo (White Robing Attire)
                  </label>
                  <span className="text-[11px] text-slate-400">Optional / Can upload later</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                  {passportPhotoUrl ? (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400/60 shrink-0 shadow-md">
                      <img src={passportPhotoUrl} alt="Passport" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <Camera className="w-7 h-7 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-amber-300 border border-slate-700/80 transition-all shadow-sm">
                      <Camera className="w-4 h-4" />
                      <span>{passportPhotoUrl ? 'Change Photo' : 'Select Photo File'}</span>
                      <input type="file" accept="image/*" onChange={handlePassportUpload} className="hidden" />
                    </label>
                    <p className="text-[11px] text-slate-500">Supported: JPG, PNG, WEBP (Official white robing photo recommended)</p>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* STEP 2: Canonical Progression & Levies Breakdown */}
          {currentStep === 2 && (
            <form onSubmit={handleNextStep} id="reg-step-2" className="space-y-5 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Current Confirmed Rank <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={currentRank}
                    onChange={(e) => setCurrentRank(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-sm text-white focus:ring-4 focus:ring-amber-500/15 focus:border-amber-400 focus:outline-none transition-all font-medium"
                  >
                    {availableRanks.map((r) => (
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
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={currentRankYear}
                      onChange={(e) => setCurrentRankYear(Number(e.target.value))}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-sm text-white focus:ring-4 focus:ring-amber-500/15 focus:border-amber-400 focus:outline-none transition-all font-medium"
                    >
                      {YEARS_OPTIONS.map((year) => (
                        <option key={year} value={year}>
                          {year} ({CURRENT_YEAR - year} years tenure)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Target Rank Selection with Visual Color & Insignia Badge */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Target Ordination Rank <span className="text-amber-400">*</span>
                  </label>
                  {validation.expectedNextRank && (
                    <button
                      type="button"
                      onClick={handleApplyCanonicalRecommendation}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Auto-select Eligible: {validation.expectedNextRank.name}
                    </button>
                  )}
                </div>

                <select
                  value={targetRankName}
                  onChange={(e) => setTargetRankName(e.target.value)}
                  className={`w-full px-4 py-3.5 bg-slate-950/80 border rounded-2xl text-sm font-semibold transition-all focus:outline-none ${
                    validation.isValid
                      ? 'border-emerald-500/50 text-emerald-300 focus:ring-4 focus:ring-emerald-500/15'
                      : 'border-rose-500/50 text-rose-300 focus:ring-4 focus:ring-rose-500/15'
                  }`}
                >
                  {availableRanks.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.liturgicalColor || r.robingCategory}) — Statutory: ₦{(r.levyBreakdown?.total || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Progression Validation Card */}
              <div
                className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-2 transition-all ${
                  validation.isValid
                    ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {validation.isValid ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold text-sm">
                      {validation.isValid ? 'Canonical Progression Validated' : 'Canonical Rule Invalidation'}
                    </p>
                    <p className="text-xs opacity-90">
                      {validation.isValid
                        ? `Eligibility confirmed for ${targetRankName}. Satisfies constitutional tenure and order stepping requirements.`
                        : validation.errorReason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statutory Levies Summary */}
              {validation.targetRank && (
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      Statutory Ordination Levies Breakdown:
                    </span>
                    <span className="font-mono font-bold text-amber-400 text-sm sm:text-base">
                      {formatCurrency(validation.targetRank.levyBreakdown.total)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-slate-400">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500">Branch Share</span>
                      <span className="font-mono font-medium text-slate-200 mt-0.5 block">
                        {formatCurrency(validation.targetRank.levyBreakdown.branchLevy)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500">District Quota</span>
                      <span className="font-mono font-medium text-slate-200 mt-0.5 block">
                        {formatCurrency(validation.targetRank.levyBreakdown.districtLevy)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500">Provincial Dues</span>
                      <span className="font-mono font-medium text-slate-200 mt-0.5 block">
                        {formatCurrency(validation.targetRank.levyBreakdown.provincialLevy)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500">Synod & Robing</span>
                      <span className="font-mono font-medium text-slate-200 mt-0.5 block">
                        {formatCurrency(validation.targetRank.levyBreakdown.nationalFee)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* STEP 3: Security & 2FA Setup */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmit} id="reg-step-3" className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-200 leading-relaxed">
                Create a secure password to protect your ordination dossier, clearance records, and credentials pass.
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Account Password <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-950/70 border border-slate-800 focus:border-amber-400/90 focus:ring-4 focus:ring-amber-400/10 rounded-2xl text-sm text-white placeholder-slate-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Confirm Password <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-950/70 border border-slate-800 focus:border-amber-400/90 focus:ring-4 focus:ring-amber-400/10 rounded-2xl text-sm text-white placeholder-slate-500 transition-all"
                  />
                </div>
              </div>

              {/* 2FA Protection Toggle */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Two-Factor Authentication (2FA)
                  </span>
                  <p className="text-xs text-slate-400">
                    Require one-time authentication passcode for enhanced credential security.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnable2FA(!enable2FA)}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                    enable2FA ? 'bg-amber-500' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      enable2FA ? 'left-6.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 sm:p-6 border-t border-slate-800/90 bg-slate-950/90 flex items-center justify-between gap-4 shrink-0">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-3 rounded-2xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              Cancel
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="submit"
              form={`reg-step-${currentStep}`}
              className="px-7 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center gap-2"
            >
              <span>Continue Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              form="reg-step-3"
              disabled={isLoading}
              className="px-7 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Submitting...' : 'Complete Registration'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
