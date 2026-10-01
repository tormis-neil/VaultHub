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

export interface CryptoDetails {
  id: string;
  title: string;
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  encryptionMethod: string;
  keySize: string;
  checksumSHA256: string;
  ivHex: string;
  ivBase64: string;
  tagHex: string;
  tagBase64: string;
  ciphertextHexSample: string;
  ciphertextTotalBytes: number;
  plaintextSample?: string;
  isIntegrityVerified: boolean;
}

export interface TamperTestResult {
  tampered: boolean;
  originalTag: string;
  decryptionResult: 'FAILED' | 'PASSED';
  detectedBy: string;
  securityMessage: string;
}

export interface DatabaseRecords {
  users: Array<{
    id: string;
    studentId: string;
    fullName: string;
    email: string;
    degreeProgram: string;
    academicYear: string;
    storageQuotaBytes: number;
    avatarInitials: string;
  }>;
  documents: Array<{
    id: string;
    ownerId: string;
    title: string;
    category: string;
    fileName: string;
    fileSizeBytes: number;
    fileType: string;
    encryptionMethod: string;
    checksumSHA256: string;
    ivHex: string;
    tagHex: string;
    ciphertextSample: string;
    uploadedAt: string;
  }>;
  activityLogs: Array<{
    id: string;
    userId: string;
    action: string;
    details: string;
    documentTitle?: string;
    ipAddress: string;
    clientDevice: string;
    timestamp: string;
    status: string;
  }>;
}
