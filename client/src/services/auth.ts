import type { User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'powerdown_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) {
      return { success: false as const, error: data.error };
    }
    setToken(data.token);
    return { success: true as const, user: data.user as User };
  } catch (err: any) {
    return { success: false as const, error: 'Network error. Check your connection.' };
  }
}

export async function registerWithEmail(email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) {
      return { success: false as const, error: data.error };
    }
    setToken(data.token);
    return { success: true as const, user: data.user as User };
  } catch (err: any) {
    return { success: false as const, error: 'Network error. Check your connection.' };
  }
}

export async function verifyToken() {
  const token = getToken();
  if (!token) return { success: false as const };
  
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.success) {
      removeToken();
      return { success: false as const, error: data.error };
    }
    return { success: true as const, user: data.user as User };
  } catch (err) {
    removeToken();
    return { success: false as const };
  }
}

export async function signOut() {
  removeToken();
}
