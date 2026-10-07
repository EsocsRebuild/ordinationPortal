'use client';

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:text-gold-300 dark:hover:bg-slate-800 transition-all border border-slate-200/80 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-church-500/20 ${className}`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4 text-gold-400 animate-in spin-in-90 duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-church-800 animate-in spin-in-90 duration-200" />
      )}
    </button>
  );
}

