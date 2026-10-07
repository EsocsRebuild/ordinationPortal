'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, UserSession } from '@/types';
import { INITIAL_USERS } from '@/lib/mockData';
import { api, LoginCredentials, RegisterCandidatePayload } from '@/services/api';

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isLoading: boolean;
  twoFactorPending: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  registerCandidate: (payload: RegisterCandidatePayload) => Promise<void>;
  resetPassword: (identifier: string, newPassword: string, otp?: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  verifyTwoFactor: (otp: string, rememberDevice?: boolean) => Promise<void>;
  cancelTwoFactor: () => void;
  switchUserRole: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(INITIAL_USERS[0]);
  const [token, setToken] = useState<string | null>('esocs_default_session_token');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [twoFactorPending, setTwoFactorPending] = useState<boolean>(false);
  const [pendingUserSession, setPendingUserSession] = useState<{ user: UserSession; token: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage on mount
    const savedUser = localStorage.getItem('esocs_user_session');
    const savedToken = localStorage.getItem('esocs_auth_token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        console.error('Error parsing stored session', e);
      }
    }
  }, []);

  const getDashboardRouteForRole = (role: UserRole): string => {
    switch (role) {
      case 'candidate':
        return '/dashboard/candidate';
      case 'parish_leader':
        return '/dashboard/parish-leader';
      case 'screening_officer':
        return '/dashboard/screening';
      case 'advisory_board':
        return '/dashboard/advisory-board';
      case 'super_admin':
        return '/dashboard/admin';
      default:
        return '/dashboard/candidate';
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await api.login(credentials);

      // Check if 2FA is active on account (or triggered for demo simulation)
      const is2FAEnabled = localStorage.getItem(`esocs_2fa_${response.user.userId}`) === 'true';

      if (is2FAEnabled) {
        setPendingUserSession({ user: response.user, token: response.token });
        setTwoFactorPending(true);
        return;
      }

      setUser(response.user);
      setToken(response.token);

      localStorage.setItem('esocs_user_session', JSON.stringify(response.user));
      localStorage.setItem('esocs_auth_token', response.token);

      const targetRoute = getDashboardRouteForRole(response.user.role);
      router.push(targetRoute);
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerCandidate = async (payload: RegisterCandidatePayload) => {
    setIsLoading(true);
    try {
      const response = await api.registerCandidate(payload);
      
      if (payload.enable2FA) {
        localStorage.setItem(`esocs_2fa_${response.user.userId}`, 'true');
      }

      setUser(response.user);
      setToken(response.token);

      localStorage.setItem('esocs_user_session', JSON.stringify(response.user));
      localStorage.setItem('esocs_auth_token', response.token);

      router.push('/dashboard/candidate');
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (identifier: string, newPassword: string, otp?: string) => {
    setIsLoading(true);
    try {
      await api.resetPassword(identifier, newPassword, otp);
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!user) throw new Error('No authenticated user session.');
    setIsLoading(true);
    try {
      await api.changePassword(user.userId, newPassword);
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTwoFactor = async (otp: string, rememberDevice: boolean = false) => {
    if (!pendingUserSession) throw new Error('No pending 2FA login session.');
    setIsLoading(true);
    try {
      await api.verify2FA(otp, rememberDevice);
      setUser(pendingUserSession.user);
      setToken(pendingUserSession.token);

      localStorage.setItem('esocs_user_session', JSON.stringify(pendingUserSession.user));
      localStorage.setItem('esocs_auth_token', pendingUserSession.token);

      setTwoFactorPending(false);
      setPendingUserSession(null);

      const targetRoute = getDashboardRouteForRole(pendingUserSession.user.role);
      router.push(targetRoute);
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelTwoFactor = () => {
    setTwoFactorPending(false);
    setPendingUserSession(null);
  };

  const switchUserRole = (role: UserRole) => {
    const targetUser = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setUser(targetUser);
    localStorage.setItem('esocs_user_session', JSON.stringify(targetUser));
    const targetRoute = getDashboardRouteForRole(role);
    router.push(targetRoute);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setTwoFactorPending(false);
    setPendingUserSession(null);
    localStorage.removeItem('esocs_user_session');
    localStorage.removeItem('esocs_auth_token');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        twoFactorPending,
        login,
        registerCandidate,
        resetPassword,
        changePassword,
        verifyTwoFactor,
        cancelTwoFactor,
        switchUserRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
