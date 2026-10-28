export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'gold'
  | 'sacred'
  | 'glass'
  | 'outline'
  | 'danger'
  | 'ghost';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  elevated?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function getButtonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  elevated = false,
  disabled = false,
  loading = false,
  className = '',
}: ButtonStyleOptions): string {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none';

  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'px-2.5 py-1 text-[11px] rounded-lg gap-1.5',
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base rounded-2xl font-semibold gap-2.5',
    xl: 'px-7 py-3.5 text-base sm:text-lg rounded-2xl font-bold gap-3',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-slate-900 text-white hover:bg-slate-800 border border-slate-700/80 shadow-sm hover:shadow-md focus:ring-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 dark:border-white/20',
    secondary:
      'bg-slate-100 text-slate-900 hover:bg-slate-200/90 border border-slate-200/90 shadow-xs focus:ring-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700/80',
    gold:
      'btn-shimmer-sweep bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-bold hover:brightness-105 border border-amber-300/80 shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_25px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 active:translate-y-0 focus:ring-amber-400',
    sacred:
      'bg-gradient-to-r from-slate-950 via-church-950 to-slate-900 text-amber-300 hover:text-amber-200 border border-amber-500/40 shadow-lg shadow-black/40 hover:border-amber-400 focus:ring-amber-500',
    glass:
      'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-sm focus:ring-white/40 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 dark:border-slate-700/60',
    outline:
      'bg-transparent text-slate-800 hover:bg-slate-100/80 border border-slate-300/90 focus:ring-amber-500 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800/80 hover:border-slate-400 dark:hover:border-slate-600',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 border border-rose-700 shadow-sm focus:ring-rose-500',
    ghost:
      'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent focus:ring-slate-400 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800',
  };

  const elevationClass = elevated ? 'shadow-elevated hover:shadow-premium' : '';
  const widthClass = fullWidth ? 'w-full' : '';

  return [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    elevationClass,
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

