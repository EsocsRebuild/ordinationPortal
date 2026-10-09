'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, UserSession } from '@/types';
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
  switchUserRole: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [twoFactorPending, setTwoFactorPending] = useState<boolean>(false);
  const [pendingUserSession, setPendingUserSession] = useState<{ user: UserSession; token: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function restoreSession() {
      try {
        const savedToken = localStorage.getItem('esocs_auth_token');
        const savedUser = localStorage.getItem('esocs_user_session');

        if (savedToken) {
          setToken(savedToken);
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }

          // Verify with live backend
          const session = await api.getCurrentSession();
          if (session && session.user) {
            setUser(session.user);
            localStorage.setItem('esocs_user_session', JSON.stringify(session.user));
          }
        }
      } catch (e) {
        console.error('Session restoration error:', e);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const getDashboardRouteForRole = (role: UserRole): string => {
    switch (role) {
      case 'candidate':
        return '/dashboard/candidate';
      case 'parish_leader':
      case 'screening_officer':
      case 'advisory_board':
      case 'super_admin':
      default:
        return '/dashboard/admin';
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await api.login(credentials);

      // Check if 2FA is active on account
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

  const switchUserRole = async (role: UserRole) => {
    const roleEmailMap: Record<UserRole, string> = {
      candidate: 'e.adeleke@esocs.church',
      parish_leader: 'f.okon@esocs.church',
      screening_officer: 'screening@esocs.church',
      advisory_board: 'advisory@esocs.church',
      super_admin: 'admin@esocs.church',
    };

    const targetEmail = roleEmailMap[role] || 'admin@esocs.church';
    try {
      const res = await api.login({ identifier: targetEmail, password: 'password123' });
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('esocs_user_session', JSON.stringify(res.user));
      localStorage.setItem('esocs_auth_token', res.token);
      const targetRoute = getDashboardRouteForRole(role);
      router.push(targetRoute);
    } catch (e) {
      console.error('Role switch error:', e);
    }
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
