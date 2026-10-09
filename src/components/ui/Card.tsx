import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered' | 'goldAccent';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const variantClasses = {
    default: 'bg-white border border-slate-200/80 shadow-card dark:bg-slate-900 dark:border-slate-800',
    elevated: 'bg-white border border-slate-200 shadow-elevated dark:bg-slate-900 dark:border-slate-800',
    bordered: 'bg-white border-2 border-slate-200 dark:bg-slate-900 dark:border-slate-700',
    goldAccent:
      'bg-white border border-gold-200/70 border-t-4 border-t-gold-500 shadow-card dark:bg-slate-900 dark:border-slate-800 dark:border-t-gold-500',
  };

  return (
    <div className={`rounded-xl overflow-hidden transition-all ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  if (children) {
    return (
      <div className={`px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 ${className}`}>
      <div>
        {title && <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}

