import { UserRole } from '@/types';

export interface RoleConfig {
  role: UserRole;
  title: string;
  badgeLabel: string;
  badgeClass: string;
  allowedViews: string[];
  description: string;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  candidate: {
    role: 'candidate',
    title: 'Candidate Portal',
    badgeLabel: 'Ordinand Candidate',
    badgeClass: 'bg-blue-900/10 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    allowedViews: ['overview', 'spiritual_record', 'clearance', 'slip', 'certificate'],
    description: 'Personal profile records, clearance milestones, ceremony admission pass, and certificates.',
  },
  parish_leader: {
    role: 'parish_leader',
    title: 'Executive Admin',
    badgeLabel: 'Branch Leader',
    badgeClass: 'bg-indigo-900/10 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
    allowedViews: ['all'],
    description: 'Executive ecclesiastical management.',
  },
  screening_officer: {
    role: 'screening_officer',
    title: 'Executive Admin',
    badgeLabel: 'Screening Officer',
    badgeClass: 'bg-amber-900/10 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    allowedViews: ['all'],
    description: 'Theological examination and screening governance.',
  },
  advisory_board: {
    role: 'advisory_board',
    title: 'Executive Admin',
    badgeLabel: 'Holy Synod Elder',
    badgeClass: 'bg-purple-900/10 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    allowedViews: ['all'],
    description: 'Supreme council ratification and decrees.',
  },
  super_admin: {
    role: 'super_admin',
    title: 'Executive Admin',
    badgeLabel: 'Super Admin',
    badgeClass: 'bg-rose-900/10 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
    allowedViews: ['all'],
    description: 'Full system sovereignty and master roster administration.',
  },
};

export function canAccessView(role: UserRole, view: string): boolean {
  if (role === 'super_admin') return true;
  const config = ROLE_CONFIGS[role];
  return config.allowedViews.includes(view);
}

