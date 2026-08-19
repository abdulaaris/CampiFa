import { api } from './api';
import { User } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async register(data: {
    fullName: string;
    businessName: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
  }): Promise<AuthResponse> {
    const res = await api.post<{ success: boolean; data: AuthResponse; message: string }>(
      '/auth/register',
      data
    );
    if (res.data.token) {
      localStorage.setItem('campifa_token', res.data.token);
    }
    return res.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<{ success: boolean; data: AuthResponse; message: string }>(
      '/auth/login',
      { email, password }
    );
    if (res.data.token) {
      localStorage.setItem('campifa_token', res.data.token);
    }
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('campifa_token');
    }
  },

  async getMe(): Promise<User | null> {
    try {
      const res = await api.get<{ success: boolean; data: { user: User } }>('/auth/me');
      return res.data.user;
    } catch {
      localStorage.removeItem('campifa_token');
      return null;
    }
  },

  async forgotPassword(email: string): Promise<{ resetToken?: string }> {
    const res = await api.post<{ success: boolean; data: { resetToken?: string }; message: string }>(
      '/auth/forgot-password',
      { email }
    );
    return res.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  },
};
