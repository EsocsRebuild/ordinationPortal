import { GenderType } from './types';
import { validateRankProgression } from './canonicalEngine';

export interface RegistrationInput {
  fullName: string;
  email: string;
  phone?: string;
  gender: GenderType;
  currentRank: string;
  targetRankName: string;
  currentRankYear?: number;
  province: string;
  district?: string;
  parish: string;
  password: string;
  enable2FA?: boolean;
}

export interface ValidationResult<T = any> {
  isValid: boolean;
  errors: string[];
  sanitizedData?: T;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[+]?[0-9\s\-()]{7,20}$/;

export function sanitizeString(input: any): string {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}

export function validateCandidateRegistration(body: any): ValidationResult<RegistrationInput> {
  const errors: string[] = [];

  const fullName = sanitizeString(body?.fullName);
  const email = sanitizeString(body?.email).toLowerCase();
  const phone = sanitizeString(body?.phone) || '+234 800 000 0000';
  const gender = (body?.gender === 'female' ? 'female' : 'male') as GenderType;
  const currentRank = sanitizeString(body?.currentRank);
  const targetRankName = sanitizeString(body?.targetRankName);
  const currentRankYear = Number(body?.currentRankYear) || undefined;
  const province = sanitizeString(body?.province);
  const district = sanitizeString(body?.district) || `${province} Central District`;
  const parish = sanitizeString(body?.parish);
  const password = typeof body?.password === 'string' ? body.password : '';
  const enable2FA = Boolean(body?.enable2FA);

  // Field validations
  if (!fullName || fullName.length < 3) {
    errors.push('Full legal name is required and must be at least 3 characters long.');
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push('A valid canonical email address is required.');
  }

  if (phone && !PHONE_REGEX.test(phone)) {
    errors.push('Please enter a valid international contact telephone number.');
  }

  if (!province) {
    errors.push('Ecclesiastical Province jurisdiction is required.');
  }

  if (!parish) {
    errors.push('Parish / Branch name is required.');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters in length.');
  }

  if (!currentRank) {
    errors.push('Current confirmed ecclesiastical rank is required.');
  }

  if (!targetRankName) {
    errors.push('Target ordination rank is required.');
  }

  // Canonical hierarchy validation
  if (currentRank && targetRankName) {
    const rankCheck = validateRankProgression(gender, currentRank, targetRankName, currentRankYear);
    if (!rankCheck.isValid && rankCheck.errorMessage) {
      errors.push(rankCheck.errorMessage);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? {
      fullName,
      email,
      phone,
      gender,
      currentRank,
      targetRankName,
      currentRankYear,
      province,
      district,
      parish,
      password,
      enable2FA,
    } : undefined,
  };
}

export function validateLoginInput(body: any): ValidationResult<{ identifier: string; password?: string }> {
  const errors: string[] = [];
  const identifier = sanitizeString(body?.identifier).toLowerCase();
  const password = typeof body?.password === 'string' ? body.password : undefined;

  if (!identifier) {
    errors.push('Ecclesiastical identifier or email address is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: { identifier, password },
  };
}

export function validateScoreInput(body: any): ValidationResult<{ doctrineScore: number; liturgyScore: number; interviewScore: number }> {
  const errors: string[] = [];
  const doctrineScore = Number(body?.doctrineScore ?? body?.theologyScore ?? 0);
  const liturgyScore = Number(body?.liturgyScore ?? 80);
  const interviewScore = Number(body?.interviewScore ?? 75);

  if (isNaN(doctrineScore) || doctrineScore < 0 || doctrineScore > 100) {
    errors.push('Doctrine score must be a number between 0 and 100.');
  }
  if (isNaN(liturgyScore) || liturgyScore < 0 || liturgyScore > 100) {
    errors.push('Liturgy score must be a number between 0 and 100.');
  }
  if (isNaN(interviewScore) || interviewScore < 0 || interviewScore > 100) {
    errors.push('Interview score must be a number between 0 and 100.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: { doctrineScore, liturgyScore, interviewScore },
  };
}

export function validateBatchActionInput(body: any): ValidationResult<{ action: string; candidateIds: string[]; metadata?: any }> {
  const errors: string[] = [];
  const action = sanitizeString(body?.action);
  const candidateIds = Array.isArray(body?.candidateIds) ? body.candidateIds.filter((id: any) => typeof id === 'string' && id.trim()) : [];

  const allowedActions = ['advance_tier', 'clear_dues', 'generate_certs', 'reject'];

  if (!action || !allowedActions.includes(action)) {
    errors.push(`Action must be one of: ${allowedActions.join(', ')}`);
  }

  if (candidateIds.length === 0) {
    errors.push('At least one candidate ID must be selected for batch operations.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: { action, candidateIds, metadata: body?.metadata },
  };
}

