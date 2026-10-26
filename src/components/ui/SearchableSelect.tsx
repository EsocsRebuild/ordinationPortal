'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  subLabel?: string;
  badge?: string;
}

interface SearchableSelectProps {
  label?: string;
  required?: boolean;
  options: (string | SelectOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  allowCustom?: boolean;
  customOptionLabel?: string;
  customOptionValue?: string;
}

export function SearchableSelect({
  label,
  required,
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Type keyword to filter directory...',
  icon,
  disabled = false,
  error,
  helperText,
  className = '',
  allowCustom = false,
  customOptionLabel = '+ Other / Enter Custom Sanctuary...',
  customOptionValue = '__custom__',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options to SelectOption objects
  const normalizedOptions = useMemo<SelectOption[]>(() => {
    const list = options.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });

    if (allowCustom) {
      list.push({
        value: customOptionValue,
        label: customOptionLabel,
        badge: 'Custom',
      });
    }

    return list;
  }, [options, allowCustom, customOptionLabel, customOptionValue]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(q)) ||
        (opt.badge && opt.badge.toLowerCase().includes(q))
    );
  }, [normalizedOptions, searchQuery]);

  // Find currently selected option object
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === value);
  }, [normalizedOptions, value]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-amber-500 dark:text-amber-400">*</span>}
          </label>
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full px-3.5 py-3 rounded-xl text-left flex items-center justify-between gap-3 transition-all focus:outline-none ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
            : isOpen
            ? 'border-amber-500 ring-4 ring-amber-500/10 bg-white dark:bg-slate-900 shadow-md text-slate-900 dark:text-white'
            : error
            ? 'border-rose-500/60 text-slate-900 dark:text-white focus:border-rose-500 bg-slate-50 dark:bg-slate-950/70'
            : 'border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/70 text-slate-900 dark:text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {icon && <span className="text-amber-500 dark:text-amber-400 shrink-0">{icon}</span>}
          {selectedOption ? (
            <div className="truncate">
              <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">{selectedOption.label}</span>
            </div>
          ) : (
            <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-500 dark:text-amber-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Bar */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 relative">
            <Search className="w-4 h-4 absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              onClick={(e) => e.stopPropagation()}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 text-xs sm:text-sm">
            {filteredOptions.length === 0 ? (
              <div className="py-7 px-4 text-center space-y-1 text-slate-500 dark:text-slate-400">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No results found for &ldquo;{searchQuery}&rdquo;</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Try typing another location, city, parish, or district name</p>
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-900 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-500/30'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{opt.label}</span>
                        {opt.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-slate-700">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.subLabel && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate mt-0.5">
                          {opt.subLabel}
                        </p>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 stroke-[2.5]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
}
