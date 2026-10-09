'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  COUNTRIES,
  CountryInfo,
  getCountryByCode,
  validatePhoneNumber,
  formatAsYouTypeNumber,
  PhoneValidationResult,
} from '@/utils/phoneValidation';
import { CountryCode } from 'libphonenumber-js';
import { Check, ChevronDown, Search, ShieldCheck, AlertCircle, Phone, X } from 'lucide-react';

interface InternationalPhoneInputProps {
  value: string;
  onChange: (value: string, validationResult: PhoneValidationResult) => void;
  defaultCountry?: CountryCode;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
}

export const InternationalPhoneInput: React.FC<InternationalPhoneInputProps> = ({
  value,
  onChange,
  defaultCountry = 'NG',
  label = 'Mobile Phone Number',
  required = false,
  error,
  helperText,
  className = '',
  disabled = false,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(defaultCountry);
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const currentCountry = useMemo(() => {
    return getCountryByCode(selectedCountry);
  }, [selectedCountry]);

  // Filter countries by query
  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Compute validation result
  const validationResult = useMemo(() => {
    return validatePhoneNumber(value, selectedCountry);
  }, [value, selectedCountry]);

  // Handle outside clicks to close country popover
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsCountryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Focus search input when popover opens
  useEffect(() => {
    if (isCountryMenuOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isCountryMenuOpen]);

  const handleCountrySelect = (country: CountryInfo) => {
    setSelectedCountry(country.code);
    setIsCountryMenuOpen(false);

    // Re-validate with new country
    const formatted = formatAsYouTypeNumber(value, country.code);
    const newValidation = validatePhoneNumber(formatted, country.code);
    onChange(formatted, newValidation);

    setTimeout(() => {
      phoneInputRef.current?.focus();
    }, 50);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatAsYouTypeNumber(raw, selectedCountry);
    const result = validatePhoneNumber(formatted, selectedCountry);
    onChange(formatted, result);
  };

  const handleClear = () => {
    const result = validatePhoneNumber('', selectedCountry);
    onChange('', result);
    phoneInputRef.current?.focus();
  };

  const isSuccess = validationResult.isValid && value.length > 0;
  const hasError = !!error || (value.length > 0 && !validationResult.isValid);

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-amber-500 font-bold">*</span>}
          </label>
          {isSuccess && validationResult.carrier && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              {validationResult.carrier}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <div
          className={`flex items-center rounded-xl border transition-all duration-200 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden ${
            disabled ? 'opacity-60 cursor-not-allowed' : ''
          } ${
            isFocused
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
              : hasError
              ? 'border-rose-500/70 dark:border-rose-500/50'
              : isSuccess
              ? 'border-emerald-500/60 dark:border-emerald-500/50'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
          }`}
        >
          {/* Country Selector Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsCountryMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-2.5 border-r border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors shrink-0 outline-none"
            aria-label="Select Country"
          >
            <span className="text-base leading-none">{currentCountry.flag}</span>
            <span className="font-semibold text-xs tracking-tight text-slate-900 dark:text-amber-300">
              {currentCountry.dialCode}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isCountryMenuOpen ? 'rotate-180 text-amber-500' : ''
              }`}
            />
          </button>

          {/* Phone Number Input */}
          <div className="relative flex-1 flex items-center">
            <input
              ref={phoneInputRef}
              type="tel"
              disabled={disabled}
              value={value}
              onChange={handlePhoneChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={
                selectedCountry === 'NG'
                  ? '0803 123 4567'
                  : selectedCountry === 'GB'
                  ? '07911 123456'
                  : selectedCountry === 'US' || selectedCountry === 'CA'
                  ? '(555) 123-4567'
                  : `${currentCountry.dialCode} ...`
              }
              className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none font-mono tracking-wide"
            />

            {value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 mr-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                aria-label="Clear phone input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {isSuccess && (
              <div className="pr-3 text-emerald-500">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
            )}
          </div>
        </div>

        {/* Country Picker Dropdown Popover */}
        {isCountryMenuOpen && (
          <div className="absolute z-50 top-full left-0 mt-1.5 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search country or dial code..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Country List */}
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 p-1">
              {filteredCountries.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching countries found
                </div>
              ) : (
                filteredCountries.map((c) => {
                  const isSelected = c.code === selectedCountry;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleCountrySelect(c)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left ${
                        isSelected
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base shrink-0">{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                        {c.isPriority && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                            Diocese
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="font-mono text-slate-400 dark:text-slate-500">
                          {c.dialCode}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper text / error display */}
      {hasError ? (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error || validationResult.error || `Please enter a valid phone number.`}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

