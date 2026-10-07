import { CandidateProfile, UserRole, UserSession } from '@/types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: any;
}

export interface LoginCredentials {
  identifier: string; // Email or Membership Reg Number (e.g. ESOCS/ORD/2026/0481)
  password?: string;
  role?: UserRole;
  section?: 'candidate' | 'admin';
}

export interface RegisterCandidatePayload {
  fullName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female';
  currentRank: string;
  targetRankName: string;
  currentRankYear?: number;
  province: string;
  district?: string;
  parish: string;
  password: string;
  enable2FA?: boolean;
}

export interface AuthSessionResponse {
  token: string;
  user: UserSession;
  candidate?: CandidateProfile;
}

class ApiService {
  private getHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('esocs_auth_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Authentication Endpoints
  async login(credentials: LoginCredentials): Promise<AuthSessionResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed. Please verify credentials.');
      }

      return data.data || data;
    } catch (err: any) {
      throw err;
    }
  }

  // Get Current Authenticated Session
  async getCurrentSession(): Promise<AuthSessionResponse | null> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('esocs_auth_token') : null;
      if (!token) return null;

      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: this.getHeaders(),
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data.data || data;
    } catch (err) {
      return null;
    }
  }

  // Self-Registration / Application
  async registerCandidate(payload: RegisterCandidatePayload): Promise<AuthSessionResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg = data.errors ? data.errors.join(' ') : (data.message || 'Registration failed. Please check your details.');
        throw new Error(errorMsg);
      }

      return data.data || data;
    } catch (err: any) {
      throw err;
    }
  }

  // Forgot Password / Self-Service Reset
  async requestPasswordOtp(identifier: string): Promise<{ success: boolean; message: string; simulatedOtp?: string }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request_otp', identifier }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Unable to request verification code.');
    }
    return data;
  }

  async resetPassword(identifier: string, newPassword: string, otp?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset_password', identifier, newPassword, otp }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Password reset failed.');
    }
    return data;
  }

  // Change Password
  async changePassword(userId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId, newPassword }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update password.');
    }
    return data;
  }

  // 2FA Verification
  async verify2FA(otp: string, rememberDevice: boolean = false): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp, rememberDevice }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Invalid 2FA verification token.');
    }
    return data;
  }

  // Candidates & Nominations
  async getCandidates(params?: { province?: string; stage?: string; tier?: string; search?: string; email?: string }): Promise<CandidateProfile[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${API_BASE_URL}/api/candidates?${query}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) throw new Error('Failed to fetch ordination candidates');
    const data = await res.json();
    return data.data?.candidates || data.candidates || [];
  }

  async getCandidateById(id: string): Promise<CandidateProfile> {
    const res = await fetch(`${API_BASE_URL}/api/candidates/${id}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) throw new Error(`Failed to fetch candidate ${id}`);
    const data = await res.json();
    return data.data?.candidate || data.candidate;
  }

  async updateCandidate(id: string, updates: Partial<CandidateProfile>, actorName?: string): Promise<CandidateProfile> {
    const res = await fetch(`${API_BASE_URL}/api/candidates/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ ...updates, actorName }),
    });

    if (!res.ok) throw new Error('Failed to update candidate record');
    const data = await res.json();
    return data.data?.candidate || data.candidate;
  }

  async createNomination(nominationData: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const res = await fetch(`${API_BASE_URL}/api/candidates`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(nominationData),
    });

    if (!res.ok) throw new Error('Failed to create nomination');
    const data = await res.json();
    return data.data?.candidate || data.candidate;
  }

  // Batch Operations (Rapid Tier Approvals & Clearance)
  async batchAction(payload: {
    action: 'advance_tier' | 'clear_dues' | 'generate_certs';
    candidateIds: string[];
    targetTier?: string;
    approverName?: string;
    approverRole?: string;
  }): Promise<{ success: boolean; count: number; candidates: CandidateProfile[]; message: string }> {
    const res = await fetch(`${API_BASE_URL}/api/candidates/batch`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Batch operation failed');
    }
    return data.data || data;
  }

  // Audit Logs
  async getAuditLogs(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/api/audit-logs`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) throw new Error('Failed to fetch audit trail');
    const data = await res.json();
    return data.data?.logs || data.logs || [];
  }

  // Public Verification
  async verifyCredential(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/verify/${id}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Verification record not found');
    }
    return data.data || data;
  }
}

export const api = new ApiService();
