'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login:   (email: string, password: string, expectedRole: string) => Promise<void>;
  signup:  (data: object) => Promise<void>;
  logout:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session from cookie on mount
  useEffect(() => {
    api.auth.me()
      .then((u) => setUser(u as User))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string, expectedRole: string) => {
    const u = await api.auth.login({ email, password, expectedRole });
    setUser(u as User);
  };

  const signup = async (data: object) => {
    const u = await api.auth.signup(data);
    setUser(u as User);
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
