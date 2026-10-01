/**
 * VaultHub Authentication API Service
 *
 * Provides typed methods for user registration, session login (Argon2id),
 * logout, and profile management against the Django backend.
 */

import { apiClient } from './client';
import { StudentUser } from '../types';

export interface LoginPayload {
  login: string;     // Student ID (e.g. 2023-01894-MN) or Email
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  studentId: string;
  degreeProgram: string;
  academicYear: string;
}

export interface ProfileUpdatePayload {
  email?: string;
  studentId?: string;
  degreeProgram?: string;
  academicYear?: string;
  firstName?: string;
  lastName?: string;
}

export const authApi = {
  /**
   * Log in an existing student using Student ID or Email.
   */
  async login(payload: LoginPayload): Promise<StudentUser> {
    return apiClient.post<StudentUser>('/auth/login/', {
      emailOrStudentId: payload.login,
      login: payload.login,
      password: payload.password,
    });
  },

  /**
   * Register a new student account. Password is automatically hashed using Argon2id.
   */
  async register(payload: RegisterPayload): Promise<StudentUser> {
    return apiClient.post<StudentUser>('/auth/register/', payload);
  },

  /**
   * Terminate the student's active session.
   */
  async logout(): Promise<void> {
    await apiClient.post<{ detail: string }>('/auth/logout/');
  },

  /**
   * Fetch the currently authenticated student profile.
   */
  async getProfile(): Promise<StudentUser> {
    return apiClient.get<StudentUser>('/auth/me/');
  },

  /**
   * Update student profile fields.
   */
  async updateProfile(payload: ProfileUpdatePayload): Promise<StudentUser> {
    return apiClient.put<StudentUser>('/auth/me/', payload);
  },

  /**
   * Permanently delete account and all documents.
   */
  async deleteAccount(): Promise<void> {
    await apiClient.delete('/auth/me/');
  },
};
