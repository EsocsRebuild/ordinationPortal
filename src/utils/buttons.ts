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
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100';

  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'px-2.5 py-1 text-[11px] rounded-md gap-1.5',
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base rounded-xl font-semibold gap-2.5',
    xl: 'px-7 py-3.5 text-base sm:text-lg rounded-2xl font-bold gap-3',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-church-900 text-white hover:bg-church-950 border border-church-800 shadow-sm focus:ring-church-700 dark:bg-church-800 dark:hover:bg-church-700 dark:border-church-700',
    secondary:
      'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200/90 shadow-xs focus:ring-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700',
    gold:
      'bg-gradient-to-r from-gold-600 via-gold-500 to-amber-600 text-slate-950 font-bold hover:brightness-105 border border-gold-400/80 shadow-md shadow-gold-500/20 focus:ring-gold-400',
    sacred:
      'bg-gradient-to-r from-church-950 via-church-900 to-royal-950 text-gold-300 hover:text-gold-200 border border-gold-500/40 shadow-lg shadow-black/20 focus:ring-gold-500',
    glass:
      'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-sm focus:ring-white/40 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 dark:border-slate-700/60',
    outline:
      'bg-transparent text-slate-800 hover:bg-slate-50 border border-slate-300 focus:ring-church-500 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800/60',
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

