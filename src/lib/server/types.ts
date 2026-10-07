import { CandidateProfile, UserRole, UserSession, VettingTier } from '@/types';

export type GenderType = 'male' | 'female';

export interface RankDefinition {
  id: string;
  name: string;
  level: number;
  gender: GenderType;
  minYearsInRank: number;
  baseLevy: number;
  robingFee: number;
  requiresSynodApproval: boolean;
}

export interface CanonicalValidationResult {
  isValid: boolean;
  errorCode?: string;
  errorMessage?: string;
  calculatedLevy?: {
    branchLevy: number;
    districtLevy: number;
    provincialQuota: number;
    nationalOrdinationFee: number;
    totalDue: number;
  };
  tenureCheck?: {
    yearsInRank: number;
    minRequired: number;
    isEligible: boolean;
  };
}

export interface ExamScoreInput {
  doctrineScore?: number; // 0-100
  liturgyScore?: number;  // 0-100
  interviewScore?: number; // 0-100
}

export interface ExamEvaluationResult {
  theologyScore: number;
  interviewScore: number;
  compositeScore: number;
  grade: 'Distinction' | 'Merit' | 'Pass' | 'Retake';
  isPassed: boolean;
}

export interface StateMachineTransitionRequest {
  currentStage: string;
  currentTier: VettingTier;
  action: 'advance' | 'reject' | 'query' | 'defer';
  approverRole: UserRole;
  approverName: string;
  remarks: string;
}

export interface StateMachineTransitionResult {
  success: boolean;
  nextStage: string;
  nextTier: VettingTier;
  endorsementStamp: {
    tier: VettingTier;
    approverName: string;
    approverRole: string;
    date: string;
    status: 'approved' | 'rejected' | 'queried';
    remarks: string;
  };
  errorMessage?: string;
}

export interface StandardApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

