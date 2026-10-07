export type { GenderType } from './types';
import {
  GenderType,
  RankDefinition,
  CanonicalValidationResult,
  ExamEvaluationResult,
  StateMachineTransitionRequest,
  StateMachineTransitionResult,
} from './types';
import { VettingTier } from '@/types';
import crypto from 'crypto';

export const MALE_RANKS: RankDefinition[] = [
  { id: 'rank_brother', name: 'Brother', level: 0, gender: 'male', minYearsInRank: 1, baseLevy: 15000, robingFee: 10000, requiresSynodApproval: false },
  { id: 'rank_aladura', name: 'Aladura', level: 1, gender: 'male', minYearsInRank: 2, baseLevy: 25000, robingFee: 15000, requiresSynodApproval: false },
  { id: 'rank_leader', name: 'Leader', level: 2, gender: 'male', minYearsInRank: 2, baseLevy: 35000, robingFee: 20000, requiresSynodApproval: false },
  { id: 'rank_rabbi', name: 'Rabbi', level: 3, gender: 'male', minYearsInRank: 3, baseLevy: 45000, robingFee: 25000, requiresSynodApproval: false },
  { id: 'rank_pastor', name: 'Pastor', level: 4, gender: 'male', minYearsInRank: 3, baseLevy: 55000, robingFee: 30000, requiresSynodApproval: false },
  { id: 'rank_evangelist', name: 'Evangelist', level: 5, gender: 'male', minYearsInRank: 3, baseLevy: 70000, robingFee: 40000, requiresSynodApproval: false },
  { id: 'rank_apostle_white', name: 'Apostle (White)', level: 6, gender: 'male', minYearsInRank: 4, baseLevy: 90000, robingFee: 50000, requiresSynodApproval: false },
  { id: 'rank_super_apostle_pink', name: 'Super Apostle (Pink)', level: 7, gender: 'male', minYearsInRank: 4, baseLevy: 110000, robingFee: 60000, requiresSynodApproval: false },
  { id: 'rank_senior_apostle_yellow', name: 'Senior Apostle (Yellow)', level: 8, gender: 'male', minYearsInRank: 4, baseLevy: 130000, robingFee: 70000, requiresSynodApproval: true },
  { id: 'rank_special_senior_apostle_blue', name: 'Special Senior Apostle (Blue)', level: 9, gender: 'male', minYearsInRank: 5, baseLevy: 160000, robingFee: 90000, requiresSynodApproval: true },
  { id: 'rank_apostle_general_green', name: 'Apostle General (Green)', level: 10, gender: 'male', minYearsInRank: 5, baseLevy: 200000, robingFee: 120000, requiresSynodApproval: true },
  { id: 'rank_supervising_apostle_general_green', name: 'Supervising Apostle General (Green)', level: 11, gender: 'male', minYearsInRank: 6, baseLevy: 250000, robingFee: 150000, requiresSynodApproval: true },
];

export const FEMALE_RANKS: RankDefinition[] = [
  { id: 'rank_sister', name: 'Sister', level: 0, gender: 'female', minYearsInRank: 1, baseLevy: 15000, robingFee: 10000, requiresSynodApproval: false },
  { id: 'rank_lady_aladura', name: 'Lady Aladura', level: 1, gender: 'female', minYearsInRank: 2, baseLevy: 25000, robingFee: 15000, requiresSynodApproval: false },
  { id: 'rank_lady_leader', name: 'Lady Leader', level: 2, gender: 'female', minYearsInRank: 2, baseLevy: 35000, robingFee: 20000, requiresSynodApproval: false },
  { id: 'rank_dorcas', name: 'Dorcas', level: 3, gender: 'female', minYearsInRank: 3, baseLevy: 45000, robingFee: 25000, requiresSynodApproval: false },
  { id: 'rank_deborah', name: 'Deborah', level: 4, gender: 'female', minYearsInRank: 3, baseLevy: 55000, robingFee: 30000, requiresSynodApproval: false },
  { id: 'rank_mary', name: 'Mary', level: 5, gender: 'female', minYearsInRank: 3, baseLevy: 70000, robingFee: 40000, requiresSynodApproval: false },
  { id: 'rank_prophetess', name: 'Prophetess', level: 6, gender: 'female', minYearsInRank: 4, baseLevy: 90000, robingFee: 50000, requiresSynodApproval: false },
  { id: 'rank_mother_in_israel', name: 'Mother in Israel', level: 7, gender: 'female', minYearsInRank: 4, baseLevy: 120000, robingFee: 65000, requiresSynodApproval: true },
  { id: 'rank_snr_mother_in_israel', name: 'Snr. Mother in Israel', level: 8, gender: 'female', minYearsInRank: 5, baseLevy: 150000, robingFee: 80000, requiresSynodApproval: true },
  { id: 'rank_sp_snr_mother_in_israel', name: 'Sp. Snr. Mother in Israel', level: 9, gender: 'female', minYearsInRank: 5, baseLevy: 180000, robingFee: 100000, requiresSynodApproval: true },
];

function normalizeRankName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function findRankByNameOrId(gender: GenderType, nameOrId: string): RankDefinition | undefined {
  const ranks = gender === 'female' ? FEMALE_RANKS : MALE_RANKS;
  const clean = normalizeRankName(nameOrId);
  return ranks.find((r) => normalizeRankName(r.name) === clean || r.id === nameOrId);
}

/**
 * Server-Side Ecclesiastical Rank Progression Validation Engine
 * Enforces:
 * 1. Gender rank compliance
 * 2. Sequential step elevation (Strictly +1 step, no skipping)
 * 3. Canonical tenure checks (minimum years served in current rank)
 * 4. Automatic levy computation
 */
export function validateRankProgression(
  gender: GenderType,
  currentRankName: string,
  targetRankName: string,
  currentRankYear?: number
): CanonicalValidationResult {
  const currentRank = findRankByNameOrId(gender, currentRankName);
  const targetRank = findRankByNameOrId(gender, targetRankName);

  if (!currentRank) {
    return {
      isValid: false,
      errorCode: 'INVALID_CURRENT_RANK',
      errorMessage: `The current rank '${currentRankName}' is not recognized in the Holy Order's ${gender} ecclesiastical hierarchy.`,
    };
  }

  if (!targetRank) {
    return {
      isValid: false,
      errorCode: 'INVALID_TARGET_RANK',
      errorMessage: `The target ordination rank '${targetRankName}' is not valid for ${gender} candidates in ESOCS Church.`,
    };
  }

  // Check elevation step (Must be exactly +1 level)
  const expectedNextLevel = currentRank.level + 1;
  const ranks = gender === 'female' ? FEMALE_RANKS : MALE_RANKS;
  const expectedRank = ranks.find((r) => r.level === expectedNextLevel);

  if (targetRank.level <= currentRank.level) {
    return {
      isValid: false,
      errorCode: 'INVALID_HORIZONTAL_OR_REGRESSIVE_ELEVATION',
      errorMessage: `Cannot apply for '${targetRank.name}' from current rank '${currentRank.name}'. Target rank must be higher than current rank.`,
    };
  }

  if (targetRank.level > expectedNextLevel) {
    return {
      isValid: false,
      errorCode: 'CANONICAL_RANK_SKIPPING_PROHIBITED',
      errorMessage: `Hierarchical skipping is prohibited. From '${currentRank.name}', the only authorized next rank is '${expectedRank?.name || 'Next Canonical Rank'}'. You cannot leap directly to '${targetRank.name}'.`,
    };
  }

  // Calculate Tenure
  const currentYear = new Date().getFullYear();
  const effectiveYear = currentRankYear && currentRankYear > 1950 && currentRankYear <= currentYear ? currentRankYear : currentYear - 3;
  const yearsInRank = currentYear - effectiveYear;
  const isEligibleTenure = yearsInRank >= currentRank.minYearsInRank;

  // Calculate Fees
  const calculatedLevy = calculateLeviesForRank(targetRank);

  return {
    isValid: true,
    calculatedLevy,
    tenureCheck: {
      yearsInRank,
      minRequired: currentRank.minYearsInRank,
      isEligible: isEligibleTenure,
    },
  };
}

/**
 * Enterprise Financial Treasury Levy Computation Engine
 */
export function calculateLeviesForRank(targetRank: RankDefinition) {
  const branchLevy = Math.round(targetRank.baseLevy * 0.20);
  const districtLevy = Math.round(targetRank.baseLevy * 0.20);
  const provincialQuota = Math.round(targetRank.baseLevy * 0.25);
  const nationalOrdinationFee = targetRank.baseLevy + targetRank.robingFee;
  const totalDue = branchLevy + districtLevy + provincialQuota + nationalOrdinationFee;

  return {
    branchLevy,
    districtLevy,
    provincialQuota,
    nationalOrdinationFee,
    totalDue,
  };
}

/**
 * Theological Examination Scoring Engine (Distinction: >=85, Merit: >=75, Pass: >=70, Retake: <70)
 */
export function evaluateTheologicalScores(
  doctrineScore: number = 0,
  liturgyScore: number = 0,
  interviewScore: number = 0
): ExamEvaluationResult {
  const safeDoc = Math.min(100, Math.max(0, doctrineScore));
  const safeLit = Math.min(100, Math.max(0, liturgyScore));
  const safeInt = Math.min(100, Math.max(0, interviewScore));

  const theologyScore = Math.round(safeDoc * 0.55 + safeLit * 0.45);
  const compositeScore = Math.round(theologyScore * 0.60 + safeInt * 0.40);

  let grade: 'Distinction' | 'Merit' | 'Pass' | 'Retake' = 'Retake';
  let isPassed = false;

  if (compositeScore >= 85) {
    grade = 'Distinction';
    isPassed = true;
  } else if (compositeScore >= 75) {
    grade = 'Merit';
    isPassed = true;
  } else if (compositeScore >= 70) {
    grade = 'Pass';
    isPassed = true;
  } else {
    grade = 'Retake';
    isPassed = false;
  }

  return {
    theologyScore,
    interviewScore: safeInt,
    compositeScore,
    grade,
    isPassed,
  };
}

/**
 * 5-Tier Canonical State Machine Transition Algorithm
 */
export function processTierTransition(
  req: StateMachineTransitionRequest
): StateMachineTransitionResult {
  const { currentStage, currentTier, action, approverRole, approverName, remarks } = req;
  const today = new Date().toISOString().split('T')[0];

  const tierProgressionMap: Record<VettingTier, { nextTier: VettingTier; nextStage: string }> = {
    branch: { nextTier: 'district', nextStage: 'branch_approved' },
    district: { nextTier: 'province', nextStage: 'district_approved' },
    province: { nextTier: 'cmc', nextStage: 'province_approved' },
    cmc: { nextTier: 'national', nextStage: 'cmc_approved' },
    national: { nextTier: 'national', nextStage: 'board_approved' },
  };

  if (action === 'reject') {
    return {
      success: true,
      nextStage: 'rejected',
      nextTier: currentTier,
      endorsementStamp: {
        tier: currentTier,
        approverName,
        approverRole,
        date: today,
        status: 'rejected',
        remarks: remarks || 'Application failed canonical clearance standards.',
      },
    };
  }

  if (action === 'query') {
    return {
      success: true,
      nextStage: 'queried',
      nextTier: currentTier,
      endorsementStamp: {
        tier: currentTier,
        approverName,
        approverRole,
        date: today,
        status: 'queried',
        remarks: remarks || 'Official ecclesiastical query issued. Response required.',
      },
    };
  }

  const nextConfig = tierProgressionMap[currentTier];
  return {
    success: true,
    nextStage: nextConfig.nextStage,
    nextTier: nextConfig.nextTier,
    endorsementStamp: {
      tier: currentTier,
      approverName,
      approverRole,
      date: today,
      status: 'approved',
      remarks: remarks || 'Canonical requirements satisfied and verified.',
    },
  };
}

/**
 * Cryptographic Pass & Certificate Signature Engine
 */
export function generateCryptographicVerification(
  regNumber: string,
  fullName: string,
  targetRank: string,
  cohortYear: number = 2026
): { certHash: string; digitalPassPayload: string; certNumber: string } {
  const secretKey = process.env.ESOCS_CANONICAL_SECRET || 'ESOCS_SOVEREIGN_CANONICAL_KEY_2026';
  const rawString = `${regNumber}::${fullName.toUpperCase()}::${targetRank.toUpperCase()}::${cohortYear}::${secretKey}`;
  const certHash = crypto.createHash('sha256').update(rawString).digest('hex');

  const rankSlug = targetRank.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
  const regTail = regNumber.split('/').pop() || '0000';
  const certNumber = `CERT-${cohortYear}-${rankSlug}-${regTail}`;

  const digitalPassPayload = Buffer.from(
    JSON.stringify({
      regNumber,
      fullName,
      targetRank,
      cohortYear,
      hash: certHash.substring(0, 16),
      issuedAt: new Date().toISOString(),
    })
  ).toString('base64');

  return { certHash, digitalPassPayload, certNumber };
}
