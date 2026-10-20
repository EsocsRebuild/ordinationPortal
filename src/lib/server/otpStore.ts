import { randomInt } from 'crypto';

export type OtpPurpose = 'password_reset' | 'two_factor' | 'candidate_verification';

export interface OtpRecord {
  identifier: string; // email, regNumber, or userId (normalized lowercase)
  code: string;
  purpose: OtpPurpose;
  createdAt: number;
  expiresAt: number;
  cooldownUntil: number;
  attempts: number;
  metadata?: Record<string, any>;
}

export interface OtpConfig {
  expiresInSeconds: number;
  cooldownSeconds: number;
  maxAttempts: number;
}

const DEFAULT_CONFIGS: Record<OtpPurpose, OtpConfig> = {
  password_reset: {
    expiresInSeconds: 600, // 10 minutes
    cooldownSeconds: 60, // 60s cooldown between resends
    maxAttempts: 5,
  },
  two_factor: {
    expiresInSeconds: 300, // 5 minutes
    cooldownSeconds: 60, // 60s cooldown
    maxAttempts: 5,
  },
  candidate_verification: {
    expiresInSeconds: 900, // 15 minutes
    cooldownSeconds: 60,
    maxAttempts: 5,
  },
};

/**
 * In-memory OTP store singleton.
 * Persists across requests within the server runtime.
 */
class OtpStoreManager {
  private records = new Map<string, OtpRecord>();

  private getKey(identifier: string, purpose: OtpPurpose): string {
    return `${purpose}:${identifier.trim().toLowerCase()}`;
  }

  /**
   * Generate or resend an OTP for an identifier and purpose.
   */
  public generateOrResend(
    identifier: string,
    purpose: OtpPurpose,
    options?: { force?: boolean; metadata?: Record<string, any> }
  ): {
    code: string;
    expiresAt: number;
    expiresInSeconds: number;
    cooldownSeconds: number;
    isResend: boolean;
  } {
    const key = this.getKey(identifier, purpose);
    const now = Date.now();
    const config = DEFAULT_CONFIGS[purpose];
    const existing = this.records.get(key);

    const isResend = !!existing;

    // Check cooldown unless force is specified
    if (existing && !options?.force && now < existing.cooldownUntil) {
      const waitSeconds = Math.ceil((existing.cooldownUntil - now) / 1000);
      const error = new Error(`Please wait ${waitSeconds}s before requesting a new verification code.`);
      (error as any).code = 'OTP_RATE_LIMITED';
      (error as any).retryAfterSeconds = waitSeconds;
      throw error;
    }

    // Generate cryptographic 6-digit numeric token
    const code = randomInt(100000, 999999).toString();
    const expiresAt = now + config.expiresInSeconds * 1000;
    const cooldownUntil = now + config.cooldownSeconds * 1000;

    const record: OtpRecord = {
      identifier: identifier.trim().toLowerCase(),
      code,
      purpose,
      createdAt: now,
      expiresAt,
      cooldownUntil,
      attempts: 0,
      metadata: options?.metadata || existing?.metadata,
    };

    this.records.set(key, record);

    return {
      code,
      expiresAt,
      expiresInSeconds: config.expiresInSeconds,
      cooldownSeconds: config.cooldownSeconds,
      isResend,
    };
  }

  /**
   * Verify an submitted OTP code against active record.
   */
  public verify(
    identifier: string,
    code: string,
    purpose: OtpPurpose
  ): {
    valid: boolean;
    error?: 'OTP_NOT_FOUND' | 'OTP_EXPIRED' | 'MAX_ATTEMPTS' | 'INVALID_CODE';
    message: string;
  } {
    const key = this.getKey(identifier, purpose);
    const record = this.records.get(key);
    const now = Date.now();

    if (!record) {
      return {
        valid: false,
        error: 'OTP_NOT_FOUND',
        message: 'No active verification code found for this account. Please request a code first.',
      };
    }

    // Check expiration (elapsing)
    if (now > record.expiresAt) {
      return {
        valid: false,
        error: 'OTP_EXPIRED',
        message: 'Your verification code has elapsed (expired). Please click Resend Code to obtain a new code.',
      };
    }

    // Check attempt lockout
    if (record.attempts >= DEFAULT_CONFIGS[purpose].maxAttempts) {
      this.records.delete(key);
      return {
        valid: false,
        error: 'MAX_ATTEMPTS',
        message: 'Too many incorrect attempts. For security reasons, this code has been revoked. Please request a new code.',
      };
    }

    // Validate code
    if (record.code !== code.trim()) {
      record.attempts += 1;
      const remainingAttempts = DEFAULT_CONFIGS[purpose].maxAttempts - record.attempts;
      return {
        valid: false,
        error: 'INVALID_CODE',
        message: `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`,
      };
    }

    // Code matches! Invalidate so it cannot be replayed
    this.records.delete(key);

    return {
      valid: true,
      message: 'Verification code confirmed successfully.',
    };
  }

  /**
   * Check status of current OTP (time remaining, cooldown).
   */
  public getStatus(
    identifier: string,
    purpose: OtpPurpose
  ): {
    exists: boolean;
    isExpired: boolean;
    secondsRemaining: number;
    canResend: boolean;
    cooldownSecondsRemaining: number;
  } {
    const key = this.getKey(identifier, purpose);
    const record = this.records.get(key);
    const now = Date.now();

    if (!record) {
      return {
        exists: false,
        isExpired: true,
        secondsRemaining: 0,
        canResend: true,
        cooldownSecondsRemaining: 0,
      };
    }

    const secondsRemaining = Math.max(0, Math.ceil((record.expiresAt - now) / 1000));
    const isExpired = secondsRemaining <= 0;
    const cooldownSecondsRemaining = Math.max(0, Math.ceil((record.cooldownUntil - now) / 1000));
    const canResend = cooldownSecondsRemaining <= 0 || isExpired;

    return {
      exists: true,
      isExpired,
      secondsRemaining,
      canResend,
      cooldownSecondsRemaining,
    };
  }

  /**
   * Explicitly invalidate an OTP.
   */
  public invalidate(identifier: string, purpose: OtpPurpose): void {
    const key = this.getKey(identifier, purpose);
    this.records.delete(key);
  }
}

// Global singleton for Next.js development and production lifecycle
const globalForOtp = global as unknown as { otpStore: OtpStoreManager };
export const otpStore = globalForOtp.otpStore || new OtpStoreManager();
if (process.env.NODE_ENV !== 'production') globalForOtp.otpStore = otpStore;

