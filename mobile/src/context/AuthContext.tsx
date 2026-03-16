import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMeApi, loginApi, registerApi, User } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, load token from SecureStore
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const res = await loginApi(email, password);
    setToken(res.data.token);
    setUser(res.data.user);
    (global as any).__authToken = res.data.token;
  }

  async function register(username: string, email: string, password: string) {
    const res = await registerApi(username, email, password);
    setToken(res.data.token);
    setUser(res.data.user);
    (global as any).__authToken = res.data.token;
  }

  function logout() {
    setToken(null);
    setUser(null);
    (global as any).__authToken = null;
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
