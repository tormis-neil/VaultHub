export type DocumentCategory = 
  | 'Certificates'
  | 'Transcripts'
  | 'Resumes'
  | 'Identification Cards'
  | 'Clearances';

export interface VaultDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  uploadDate: string;
  lastAccessedDate?: string;
  isStarred?: boolean;
  encryptionMethod: 'AES-256-GCM';
  checksumSHA256: string;
  issuingAuthority: string;
  academicYear?: string;
  status: 'Encrypted' | 'Archived';
  description?: string;
  previewUrl?: string;
  textContent?: string;
}

export type ActivityAction = 
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'DOCUMENT_UPLOAD'
  | 'DOCUMENT_DOWNLOAD'
  | 'DOCUMENT_DECRYPT'
  | 'DOCUMENT_DELETE';

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string
  action: ActivityAction;
  details: string;
  documentTitle?: string;
  category?: DocumentCategory;
  ipAddress: string;
  clientDevice: string;
  status: 'SUCCESS' | 'FLAGGED';
}

export interface StudentUser {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  degreeProgram: string;
  academicYear: string;
  storageQuotaBytes: number; // e.g. 500 * 1024 * 1024 (500 MB)
  avatarInitials: string;
}
