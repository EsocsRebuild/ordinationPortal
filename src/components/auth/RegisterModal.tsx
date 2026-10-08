'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { EsocsLogo } from '@/components/ui/EsocsLogo';
import {
  ESOCS_RANKS,
  ESOCS_HIERARCHY,
  ESOCS_PROVINCES,
  getDistrictsForProvince,
  getBranchesForDistrict,
  getHousesOfPrayerForBranch,
} from '@/lib/constants';
import { validateRankProgression, getRankByName } from '@/utils/ranks';
import { formatCurrency } from '@/utils/formatters';
import { validatePhoneNumber, PhoneValidationResult } from '@/utils/phoneValidation';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
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
  Camera,
  Layers,
  Building,
} from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CURRENT_YEAR = 2026;
const YEARS_OPTIONS = Array.from({ length: 35 }, (_, i) => CURRENT_YEAR - i);

export function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const { registerCandidate, isLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form identity state
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Cascading Ecclesiastical Hierarchy state
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
  const [passportPhotoUrl, setPassportPhotoUrl] = useState<string | null>(null);

  // Canonical rank state
  const [currentRank, setCurrentRank] = useState('Pastor');
  const [currentRankYear, setCurrentRankYear] = useState(2022);
  const [targetRankName, setTargetRankName] = useState('Evangelist');

  // Security state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enable2FA, setEnable2FA] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Available hierarchy options
  const availableDistricts = useMemo(() => {
    return getDistrictsForProvince(province);
  }, [province]);

  const availableBranches = useMemo(() => {
    return getBranchesForDistrict(province, district);
  }, [province, district]);

  const availableHousesOfPrayer = useMemo(() => {
    return getHousesOfPrayerForBranch(province, district, parish);
  }, [province, district, parish]);

  // Real-time Nigerian phone validation & carrier detection
  const phoneValidation: PhoneValidationResult = useMemo(() => {
    if (!phone) {
      return { isValid: false, formatted: '', isNigerian: false };
    }
    return validatePhoneNumber(phone);
  }, [phone]);

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

  // Cascading Handlers
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

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (currentStep === 1) {
      if (!fullName.trim() || fullName.trim().length < 3) {
        setSubmitError('Please enter your full legal ecclesiastical name (minimum 3 characters).');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email.trim())) {
        setSubmitError('Please enter a valid ecclesiastical or personal email address.');
        return;
      }
      if (!phone.trim()) {
        setSubmitError('Please enter your active Nigerian mobile phone number (e.g. 08031234567).');
        return;
      }
      const phoneVal = validatePhoneNumber(phone);
      if (!phoneVal.isValid) {
        setSubmitError(phoneVal.error || 'Please enter a valid 11-digit Nigerian mobile phone number.');
        return;
      }
      if (!province || !district || !parish) {
        setSubmitError('Please select your complete Province, District, and Local Parish Branch.');
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
    const phoneVal = validatePhoneNumber(phone);
    const resolvedPhone = phoneVal.isValid ? phoneVal.formatted : phone.trim();

    try {
      await registerCandidate({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: resolvedPhone,
        gender,
        province,
        district,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl my-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all text-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/70 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <EsocsLogo size={36} showText={false} />
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Canonical Ordination Registration
                </h3>
                <p className="text-xs text-amber-400 font-medium">
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
              { num: 1, title: 'Identity & Lineage' },
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

          {/* STEP 1: Personal Identity & Ecclesiastical Hierarchy */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep} id="reg-step-1" className="space-y-5">
              {/* Full Name First */}
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
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:outline-none transition-all font-medium"
                  />
                </div>
              </div>

              {/* Gender / Holy Order Category Segmented Switch */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Sacred Holy Order Category *
                </label>
                <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleGenderChange('male')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      gender === 'male'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Brethren (Male Order)</span>
                    {gender === 'male' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderChange('female')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      gender === 'female'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Sisters (Female Order)</span>
                    {gender === 'female' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                </div>
              </div>

              {/* Email & Phone Contact with Nigerian Validation */}
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
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Mobile Phone Number *
                    </label>
                    {phone && (
                      <span
                        className={`text-[10px] font-mono font-semibold flex items-center gap-1 ${
                          phoneValidation.isValid ? 'text-emerald-400' : 'text-rose-400'
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
                    <div className="absolute left-3 flex items-center gap-1 text-slate-400 pointer-events-none text-xs font-mono font-medium border-r border-slate-800 pr-2">
                      <span className="text-sm">🇳🇬</span>
                      <span>+234</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0803 123 4567"
                      className={`w-full pl-20 pr-4 py-2.5 bg-slate-950/80 border rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:outline-none transition-all font-mono ${
                        phone && phoneValidation.isValid
                          ? 'border-emerald-500/50 focus:ring-emerald-500/20 focus:border-emerald-400'
                          : phone && !phoneValidation.isValid
                          ? 'border-rose-500/50 focus:ring-rose-500/20 focus:border-rose-400'
                          : 'border-slate-800 focus:ring-amber-500/20 focus:border-amber-400'
                      }`}
                    />
                  </div>
                  {phone && !phoneValidation.isValid && phoneValidation.error && (
                    <p className="text-[11px] text-rose-400 leading-tight mt-1">
                      {phoneValidation.error}
                    </p>
                  )}
                </div>
              </div>

              {/* Seamless Cascading Ecclesiastical Hierarchy (4-Tier Searchable Select) */}
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs">
                  <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    Ecclesiastical Territorial Jurisdiction
                  </span>
                  <span className="text-[11px] text-slate-400">Searchable Directory</span>
                </div>

                {/* Tier 1: Province & Tier 2: District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <SearchableSelect
                    label="1. Ecclesiastical Province / Diocese"
                    required
                    options={provinceOptions}
                    value={province}
                    onChange={handleProvinceChange}
                    placeholder="Search Province or Diocese..."
                    searchPlaceholder="Type keyword (e.g. Lagos, Edo, Delta, Western)..."
                    icon={<MapPin className="w-4 h-4 text-amber-400" />}
                  />

                  <SearchableSelect
                    label="2. District / Zonal Council"
                    required
                    options={districtOptions}
                    value={district}
                    onChange={handleDistrictChange}
                    placeholder="Search District Council..."
                    searchPlaceholder={`Type district in ${province}...`}
                    icon={<Building className="w-4 h-4 text-amber-400" />}
                  />
                </div>

                {/* Tier 3: Local Parish Branch & Tier 4: House of Prayer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <SearchableSelect
                    label="3. Local Parish / Cathedral Branch"
                    required
                    options={branchOptions}
                    value={parish}
                    onChange={handleBranchChange}
                    placeholder="Search Parish or Branch..."
                    searchPlaceholder={`Type parish branch name...`}
                    icon={<Church className="w-4 h-4 text-amber-400" />}
                  />

                  <SearchableSelect
                    label="4. House of Prayer / Sanctuary / Chapel"
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
                </div>

                {/* Custom House of Prayer Input if selected */}
                {isCustomHouse && (
                  <div className="space-y-1.5 pt-1 animate-in fade-in">
                    <label className="text-xs font-semibold text-amber-300">
                      Specify House of Prayer / Sanctuary Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customHouseOfPrayer}
                      onChange={(e) => setCustomHouseOfPrayer(e.target.value)}
                      placeholder="e.g. Mount Horeb Sanctuary of Grace"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-amber-500/50 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:outline-none transition-all font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Passport Photo Upload Preview */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Canonical Passport Photo (White Robing Attire)</span>
                  <span className="text-[11px] text-slate-400 font-normal">Optional / Can upload later</span>
                </label>
                <div className="flex items-center gap-4 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
                  {passportPhotoUrl ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-amber-400/50 shrink-0">
                      <img src={passportPhotoUrl} alt="Passport" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{passportPhotoUrl ? 'Change Photo' : 'Select Photo File'}</span>
                      <input type="file" accept="image/*" onChange={handlePassportUpload} className="hidden" />
                    </label>
                    <p className="text-[10px] text-slate-500">Supported: JPG, PNG, WEBP (Max 5MB)</p>
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
                    Year Conferred Current Rank *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select
                      value={currentRankYear}
                      onChange={(e) => setCurrentRankYear(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:outline-none transition-all font-medium"
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
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Proposed Target Sacred Order *
                  </label>
                  {validation.expectedNextRank && (
                    <button
                      type="button"
                      onClick={handleApplyCanonicalRecommendation}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-select Eligible: {validation.expectedNextRank.name}
                    </button>
                  )}
                </div>

                <select
                  value={targetRankName}
                  onChange={(e) => setTargetRankName(e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-950/80 border rounded-xl text-xs sm:text-sm font-semibold transition-all focus:outline-none ${
                    validation.isValid
                      ? 'border-emerald-500/50 text-emerald-300 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-rose-500/50 text-rose-300 focus:ring-2 focus:ring-rose-500/20'
                  }`}
                >
                  {availableRanks.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.liturgicalColor || r.robingCategory}) — Statutory: ₦{(r.levyBreakdown?.total || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hierarchy Validation Card */}
              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 transition-all ${
                  validation.isValid
                    ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {validation.isValid ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold">
                      {validation.isValid ? 'Canonical Progression Validated' : 'Canonical Rule Invalidation'}
                    </p>
                    <p className="text-[11px] opacity-90">
                      {validation.isValid
                        ? `Eligibility confirmed for ${targetRankName}. Satisfies constitutional tenure and order stepping requirements.`
                        : validation.errorReason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statutory Levies Summary */}
              {validation.targetRank && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                      Statutory Ordination Levies Breakdown:
                    </span>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {formatCurrency(validation.targetRank.levyBreakdown.total)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/60">
                      <span className="block text-[10px] text-slate-500">Branch Share</span>
                      <span className="font-mono font-medium text-slate-200">
                        {formatCurrency(validation.targetRank.levyBreakdown.branchLevy)}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/60">
                      <span className="block text-[10px] text-slate-500">District Quota</span>
                      <span className="font-mono font-medium text-slate-200">
                        {formatCurrency(validation.targetRank.levyBreakdown.districtLevy)}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/60">
                      <span className="block text-[10px] text-slate-500">Provincial Dues</span>
                      <span className="font-mono font-medium text-slate-200">
                        {formatCurrency(validation.targetRank.levyBreakdown.provincialLevy)}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/60">
                      <span className="block text-[10px] text-slate-500">Synod & Robing Fee</span>
                      <span className="font-mono font-medium text-slate-200">
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
            <form onSubmit={handleSubmit} id="reg-step-3" className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
                Create a secure password to protect your ordination dossier, clearance records, and credentials pass.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Account Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* 2FA Protection Toggle */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Two-Factor Authentication (2FA)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Require one-time authentication passcode for enhanced credential security.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnable2FA(!enable2FA)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
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
        <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={handlePrevStep}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous Step
            </Button>
          ) : (
            <Button variant="outline" size="md" type="button" onClick={onClose}>
              Cancel
            </Button>
          )}

          {currentStep < 3 ? (
            <Button
              variant="primary"
              size="md"
              type="submit"
              form={`reg-step-${currentStep}`}
              icon={<ArrowRight className="w-4 h-4" />}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
            >
              Continue Next
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              type="submit"
              form="reg-step-3"
              loading={isLoading}
              icon={<CheckCircle2 className="w-4 h-4" />}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
            >
              Complete Registration
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
