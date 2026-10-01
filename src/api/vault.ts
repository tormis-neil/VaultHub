import { apiClient } from './client';
import { DatabaseRecords } from '../types';

export const vaultApi = {
  /**
   * Fetch structured database table records (users, documents, activity logs).
   */
  async getDatabaseRecords(): Promise<DatabaseRecords> {
    return apiClient.get<DatabaseRecords>('/vault/database-records/');
  },
};
