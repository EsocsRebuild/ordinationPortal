import { CandidateProfile, UserRole, UserSession } from '@/types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginCredentials {
  identifier: string; // Email or Membership Reg Number (e.g. ESOCS/ORD/2026/0481)
  password?: string;
  role?: UserRole;
}

export interface RegisterCandidatePayload {
  fullName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female';
  currentRank: string;
  targetRankName: string;
  province: string;
  district?: string;
  parish: string;
  password: string;
  enable2FA?: boolean;
}

export interface AuthSessionResponse {
  token: string;
  user: {
    userId: string;
    name: string;
    email: string;
    role: UserRole;
    roleTitle: string;
    jurisdiction: string;
    candidateId?: string;
  };
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Authentication failed. Please verify credentials.');
      }

      const data = await res.json();
      return data;
    } catch (err: any) {
      throw err;
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed. Please check your details.');
      }

      const data = await res.json();
      return data;
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

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Unable to request verification code.');
    }
    return res.json();
  }

  async resetPassword(identifier: string, newPassword: string, otp?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset_password', identifier, newPassword, otp }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Password reset failed.');
    }
    return res.json();
  }

  // Change Password
  async changePassword(userId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId, newPassword }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update password.');
    }
    return res.json();
  }

  // 2FA Verification
  async verify2FA(otp: string, rememberDevice: boolean = false): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp, rememberDevice }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Invalid 2FA verification token.');
    }
    return res.json();
  }

  // Candidates & Nominations
  async getCandidates(params?: { province?: string; stage?: string; search?: string }): Promise<CandidateProfile[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${API_BASE_URL}/api/candidates?${query}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) throw new Error('Failed to fetch ordination candidates');
    const data = await res.json();
    return data.candidates;
  }

  async getCandidateById(id: string): Promise<CandidateProfile> {
    const res = await fetch(`${API_BASE_URL}/api/candidates/${id}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) throw new Error(`Failed to fetch candidate ${id}`);
    const data = await res.json();
    return data.candidate;
  }

  async updateCandidate(id: string, updates: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const res = await fetch(`${API_BASE_URL}/api/candidates/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!res.ok) throw new Error('Failed to update candidate record');
    const data = await res.json();
    return data.candidate;
  }

  async createNomination(nominationData: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const res = await fetch(`${API_BASE_URL}/api/candidates`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(nominationData),
    });

    if (!res.ok) throw new Error('Failed to create nomination');
    const data = await res.json();
    return data.candidate;
  }
}

export const api = new ApiService();
