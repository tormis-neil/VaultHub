/**
 * VaultHub Activity Log API Service
 *
 * Provides typed methods for accessing the immutable security audit trail.
 */

import { apiClient } from './client';
import { ActivityLog } from '../types';

export const activityApi = {
  /**
   * Fetch all audit trail activity logs for the current student.
   */
  async getActivityLogs(): Promise<ActivityLog[]> {
    return apiClient.get<ActivityLog[]>('/activity/');
  },
};
