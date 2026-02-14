'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Init from local storage
    const storedToken = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!['admin', 'manager', 'staff'].includes(data.user.role)) {
        throw new Error('Unauthorized Access: Role not permitted');
      }

      const userData = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role
      };

      setToken(data.token);
      setUser(userData as User);

      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(userData));

      router.push('/');
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('admin_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
