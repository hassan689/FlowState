import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch, clearTokens, getAccessToken, setTokens } from '../api/client';
import { applyThemePreference } from '../lib/theme';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    const res = await apiFetch('/api/users/me');
    if (!res.ok) {
      setUser(null);
      setLoading(false);
      return;
    }
    setUser(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  useEffect(() => {
    if (!user) {
      applyThemePreference('light');
      return;
    }
    const pref = user.study_preferences?.theme;
    if (pref === 'dark' || pref === 'light' || pref === 'system') {
      applyThemePreference(pref);
    } else {
      applyThemePreference('light');
    }
  }, [user]);

  const login = useCallback(async (email, password) => {
    const res = await apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const d = err.detail;
      const msg = Array.isArray(d)
        ? d.map((x) => (typeof x === 'string' ? x : x.msg || JSON.stringify(x))).join(', ')
        : typeof d === 'string'
          ? d
          : 'Login failed';
      throw new Error(msg);
    }
    const data = await res.json();
    setTokens(data);
    await loadMe();
  }, [loadMe]);

  const register = useCallback(async (name, email, password) => {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const d = err.detail;
      const msg = Array.isArray(d)
        ? d.map((x) => (typeof x === 'string' ? x : x.msg || JSON.stringify(x))).join(', ')
        : typeof d === 'string'
          ? d
          : 'Registration failed';
      throw new Error(msg);
    }
    await login(email, password);
  }, [login]);

  const logout = useCallback(async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    clearTokens();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await apiFetch('/api/users/me');
    if (res.ok) setUser(await res.json());
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
