'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
import { User, ApiResponse } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        // Invalid token, remove it
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        toast.success(`Welcome back, ${response.data.user.name || response.data.user.email}!`);
        return true;
      } else {
        toast.error(response.error || 'Login failed');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error?.message || 'Login failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 