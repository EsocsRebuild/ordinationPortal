import { OrdinationStage, UserRole, VettingTier } from '@/types';

export interface WorkflowStageMeta {
  stage: OrdinationStage;
  tier: VettingTier;
  label: string;
  shortLabel: string;
  stepNumber: number;
  description: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  authorizedRolesToAdvance: UserRole[];
}

export const WORKFLOW_STAGES_ORDERED: WorkflowStageMeta[] = [
  {
    stage: 'nominated',
    tier: 'branch',
    label: '1. Branch / Parish Submission',
    shortLabel: 'Branch',
    stepNumber: 1,
    description: 'Candidate self-applied or nominated; awaiting Parish Priest local endorsement.',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    badgeText: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-300',
    authorizedRolesToAdvance: ['parish_leader', 'super_admin'],
  },
  {
    stage: 'branch_approved',
    tier: 'district',
    label: '2. District Overseer Review',
    shortLabel: 'District',
    stepNumber: 2,
    description: 'Parish priest attested to baptism & moral standing; forwarded to District Vetting Committee.',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    borderColor: 'border-indigo-300',
    authorizedRolesToAdvance: ['parish_leader', 'super_admin'],
  },
  {
    stage: 'district_approved',
    tier: 'province',
    label: '3. Provincial Secretariat Vetting',
    shortLabel: 'Province',
    stepNumber: 3,
    description: 'District quota & character verified; forwarded to Provincial Council of Elders.',
    badgeBg: 'bg-violet-50 dark:bg-violet-950/40',
    badgeText: 'text-violet-700 dark:text-violet-300',
    borderColor: 'border-violet-300',
    authorizedRolesToAdvance: ['super_admin'],
  },
  {
    stage: 'province_approved',
    tier: 'cmc',
    label: '4. CMC National Screening & Exam',
    shortLabel: 'CMC Screening',
    stepNumber: 4,
    description: 'Provincial clearance signed; candidate queued for Theological Examination & Oral Defense.',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-800 dark:text-amber-300',
    borderColor: 'border-amber-300',
    authorizedRolesToAdvance: ['screening_officer', 'super_admin'],
  },
  {
    stage: 'cmc_approved',
    tier: 'national',
    label: '5. Holy Synod Advisory Ratification',
    shortLabel: 'Holy Synod',
    stepNumber: 5,
    description: 'Doctrinal examination & interviews passed; submitted to His Most Eminence & Advisory Board.',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-300',
    authorizedRolesToAdvance: ['advisory_board', 'super_admin'],
  },
  {
    stage: 'board_approved',
    tier: 'national',
    label: 'Holy Synod Ratified & Decreed',
    shortLabel: 'Synod Ratified',
    stepNumber: 6,
    description: 'Apostolic decree ratified by the Advisory Board; awaiting final financial dues clearance.',
    badgeBg: 'bg-purple-100 dark:bg-purple-900/50',
    badgeText: 'text-purple-900 dark:text-purple-200',
    borderColor: 'border-purple-400',
    authorizedRolesToAdvance: ['super_admin'],
  },
  {
    stage: 'clearance_completed',
    tier: 'national',
    label: 'Secretariat Dues Fully Cleared',
    shortLabel: 'Dues Cleared',
    stepNumber: 7,
    description: 'Branch, District, Provincial, and National levies 100% reconciled and cleared.',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-300',
    authorizedRolesToAdvance: ['super_admin'],
  },
  {
    stage: 'investiture_assigned',
    tier: 'national',
    label: 'Robing Zone & Seating Allocated',
    shortLabel: 'Seat Ready',
    stepNumber: 8,
    description: 'Digital Admission Slip issued; Official Cathedral Robing Zone and Seating allocated.',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
    badgeText: 'text-amber-900 dark:text-amber-200',
    borderColor: 'border-gold-400',
    authorizedRolesToAdvance: ['super_admin'],
  },
  {
    stage: 'ordained',
    tier: 'national',
    label: 'Conferred & Ordained',
    shortLabel: 'Ordained',
    stepNumber: 9,
    description: 'Holy ordination hands laid; tamper-proof certificate generated with digital hash.',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    badgeText: 'text-emerald-900 dark:text-emerald-100',
    borderColor: 'border-emerald-500',
    authorizedRolesToAdvance: [],
  },
];

export function getStageMeta(stage: OrdinationStage): WorkflowStageMeta {
  const found = WORKFLOW_STAGES_ORDERED.find((s) => s.stage === stage);
  if (found) return found;

  // Compatibility aliases
  if (stage === 'parish_endorsed') {
    return WORKFLOW_STAGES_ORDERED[1]; // branch_approved
  }
  if (stage === 'screening_in_progress') {
    return WORKFLOW_STAGES_ORDERED[3]; // province_approved / cmc screening
  }
  if (stage === 'theology_assessed') {
    return WORKFLOW_STAGES_ORDERED[4]; // cmc_approved
  }

  if (stage === 'deferred') {
    return {
      stage: 'deferred',
      tier: 'cmc',
      label: 'Deferred for Remediation',
      shortLabel: 'Deferred',
      stepNumber: 0,
      description: 'Application placed on hold pending supplementary documentation or liturgical training.',
      badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
      badgeText: 'text-orange-700 dark:text-orange-300',
      borderColor: 'border-orange-300',
      authorizedRolesToAdvance: ['screening_officer', 'advisory_board', 'super_admin'],
    };
  }

  return {
    stage: 'rejected',
    tier: 'branch',
    label: 'Application Declined',
    shortLabel: 'Declined',
    stepNumber: 0,
    description: 'Application does not meet ecclesiastical criteria or canonical prerequisites.',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    borderColor: 'border-rose-300',
    authorizedRolesToAdvance: ['super_admin'],
  };
}

export function canRoleTransitionStage(
  currentStage: OrdinationStage,
  nextStage: OrdinationStage,
  userRole: UserRole
): boolean {
  if (userRole === 'super_admin') return true;
  const currentMeta = getStageMeta(currentStage);
  return currentMeta.authorizedRolesToAdvance.includes(userRole);
}
