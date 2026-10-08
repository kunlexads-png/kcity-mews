import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (data: { fullName: string; email: string; phone?: string; password: string; confirmPassword: string }) => Promise<{ user: User; devVerificationToken?: string }>;
  logout: () => void;
  updateProfile: (data: { full_name: string; phone?: string }) => Promise<void>;
  verifyEmailToken: (token: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<string | undefined>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kcity_token'));
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('kcity_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get<{ success: boolean; user: User }>('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        api.clearToken();
        setUser(null);
        setToken(null);
      }
    } catch {
      api.clearToken();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, pass: string): Promise<User> => {
    try {
      const res = await api.post<{ success: boolean; token: string; user: User }>('/auth/login', {
        email,
        password: pass,
      });

      api.setToken(res.token);
      setToken(res.token);
      setUser(res.user);
      success(`Welcome back, ${res.user.full_name}!`);
      return res.user;
    } catch (err: any) {
      error(err.message || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  const register = async (data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ user: User; devVerificationToken?: string }> => {
    try {
      const res = await api.post<{
        success: boolean;
        message: string;
        token: string;
        user: User;
        devVerificationToken?: string;
      }>('/auth/register', data);

      if (res.token) {
        api.setToken(res.token);
        setToken(res.token);
        setUser(res.user);
      }

      success(res.message || 'Account created! Please verify your email.');
      return { user: res.user, devVerificationToken: res.devVerificationToken };
    } catch (err: any) {
      error(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = () => {
    api.clearToken();
    setToken(null);
    setUser(null);
    success('You have been logged out.');
  };

  const updateProfile = async (data: { full_name: string; phone?: string }) => {
    try {
      const res = await api.put<{ success: boolean; user: User }>('/auth/profile', data);
      setUser(res.user);
      success('Profile updated successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to update profile.');
      throw err;
    }
  };

  const verifyEmailToken = async (verificationToken: string) => {
    try {
      const res = await api.get<{ success: boolean; message: string; user: User; token: string }>(
        `/auth/verify-email?token=${encodeURIComponent(verificationToken)}`
      );

      if (res.token) {
        api.setToken(res.token);
        setToken(res.token);
      }
      if (res.user) {
        setUser(res.user);
      }
      success(res.message || 'Email verified successfully! Welcome to KCity Mews.');
    } catch (err: any) {
      error(err.message || 'Email verification failed or token expired.');
      throw err;
    }
  };

  const resendVerificationEmail = async (userEmail: string): Promise<string | undefined> => {
    try {
      const res = await api.post<{ success: boolean; message: string; devVerificationToken?: string }>(
        '/auth/resend-verification',
        { email: userEmail }
      );
      success(res.message || 'Verification email resent.');
      return res.devVerificationToken;
    } catch (err: any) {
      error(err.message || 'Failed to resend verification email.');
      throw err;
    }
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(user && user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        register,
        logout,
        updateProfile,
        verifyEmailToken,
        resendVerificationEmail,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
