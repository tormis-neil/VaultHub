/**
 * VaultHub Documents API Service
 *
 * Provides typed methods for document management:
 * - Listing encrypted vault documents
 * - Encrypted document upload (multipart with SHA-256 + AES-256-GCM at rest)
 * - Metadata update (e.g. toggle isStarred)
 * - Deletion from vault
 * - Secure download (triggers backend decryption + SHA-256 integrity verification)
 */

import { apiClient } from './client';
import { VaultDocument, DocumentCategory } from '../types';

export interface DocumentUploadParams {
  file: File;
  title: string;
  category: DocumentCategory;
  issuingAuthority: string;
  academicYear?: string;
  description?: string;
  isStarred?: boolean;
}

export interface DocumentUpdateParams {
  title?: string;
  isStarred?: boolean;
}

export const documentsApi = {
  /**
   * Fetch all documents owned by the current student.
   */
  async getDocuments(): Promise<VaultDocument[]> {
    return apiClient.get<VaultDocument[]>('/documents/');
  },

  /**
   * Fetch details for a specific document by ID.
   */
  async getDocument(id: string | number): Promise<VaultDocument> {
    return apiClient.get<VaultDocument>(`/documents/${id}/`);
  },

  /**
   * Upload a new academic document.
   * File will be encrypted with AES-256-GCM and hashed with SHA-256 on the backend.
   */
  async uploadDocument(params: DocumentUploadParams): Promise<VaultDocument> {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('title', params.title);
    formData.append('category', params.category);
    formData.append('issuingAuthority', params.issuingAuthority);
    
    if (params.academicYear) {
      formData.append('academicYear', params.academicYear);
    }
    if (params.description) {
      formData.append('description', params.description);
    }
    if (params.isStarred !== undefined) {
      formData.append('isStarred', String(params.isStarred));
    }

    return apiClient.upload<VaultDocument>('/documents/', formData);
  },

  /**
   * Update document metadata (e.g. star/unstar, edit title).
   */
  async updateDocument(id: string | number, data: DocumentUpdateParams): Promise<VaultDocument> {
    return apiClient.patch<VaultDocument>(`/documents/${id}/`, data);
  },

  /**
   * Permanently delete a document from the vault and disk.
   */
  async deleteDocument(id: string | number): Promise<void> {
    await apiClient.delete(`/documents/${id}/`);
  },

  /**
   * Decrypt and download a document.
   * Prompts the browser download with the original plaintext file.
   */
  async downloadDocument(
    id: string | number, 
    fallbackFileName: string = 'document'
  ): Promise<{ blob: Blob; fileName: string; checksumSHA256?: string }> {
    return apiClient.download(`/documents/${id}/download/`, fallbackFileName);
  },
};
