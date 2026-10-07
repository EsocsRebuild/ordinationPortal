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
    title: 'Candidate / Ordinand Portal',
    badgeLabel: 'Ordinand Candidate',
    badgeClass: 'bg-blue-900/10 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    allowedViews: ['overview', 'spiritual_record', 'clearance', 'slip', 'certificate'],
    description: 'Track application, exams, clearance pass, and digital certificate.',
  },
  parish_leader: {
    role: 'parish_leader',
    title: 'Parish Leader & Branch Rector Portal',
    badgeLabel: 'Branch Priest / Leader',
    badgeClass: 'bg-indigo-900/10 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
    allowedViews: ['nominations', 'endorsements', 'branch_roster', 'new_nomination'],
    description: 'Nominate faithful members, endorse applications, and review branch quotas.',
  },
  screening_officer: {
    role: 'screening_officer',
    title: 'Screening & Vetting Committee Portal',
    badgeLabel: 'Screening Officer',
    badgeClass: 'bg-amber-900/10 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    allowedViews: ['vetting_queue', 'theology_scores', 'interview_matrix', 'dossier_review'],
    description: 'Vet certificates, record exam & interview marks, and flag discrepancies.',
  },
  advisory_board: {
    role: 'advisory_board',
    title: 'Advisory Board & Council of Elders',
    badgeLabel: 'Holy Order Advisory Council',
    badgeClass: 'bg-purple-900/10 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    allowedViews: ['board_approvals', 'investiture_roll', 'decrees', 'hierarchy_ratification'],
    description: 'Final review and executive ratification of high ranks and apostolic elevations.',
  },
  super_admin: {
    role: 'super_admin',
    title: 'Central Secretariat & Super Admin Portal',
    badgeLabel: 'Apex Secretariat Admin',
    badgeClass: 'bg-rose-900/10 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
    allowedViews: ['all', 'master_database', 'batch_certs', 'rank_matrix', 'audit_trail', 'seating_plan'],
    description: 'Full system sovereignty: master roster, batch QR certificates, logs, and database control.',
  },
};

export function canAccessView(role: UserRole, view: string): boolean {
  if (role === 'super_admin') return true;
  const config = ROLE_CONFIGS[role];
  return config.allowedViews.includes(view);
}

