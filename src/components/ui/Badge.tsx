import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'gold' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold tracking-wide',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const variantClasses = {
    default: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    primary: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800',
    purple: 'bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800',
    gold: 'bg-gold-50 text-gold-900 border-gold-300 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-700',
    outline: 'bg-transparent text-slate-700 border-slate-300 dark:text-slate-300 dark:border-slate-600',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

