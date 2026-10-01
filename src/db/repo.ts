import { eq, desc } from 'drizzle-orm';
import { getDb, isCloudSqlConfigured, schema } from './index.ts';

export interface DbUser {
  id: number;
  uid: string;
  studentId: string;
  fullName: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  degreeProgram: string;
  academicYear: string;
  storageQuotaBytes: number;
  avatarInitials: string;
  createdAt: Date | null;
}

export interface DbVaultDocument {
  id: string;
  userId: number;
  title: string;
  category: string;
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  uploadDate: string;
  lastAccessedDate: string | null;
  isStarred: boolean | null;
  encryptionMethod: string;
  checksumSha256: string;
  issuingAuthority: string;
  academicYear: string | null;
  status: string;
  description: string | null;
  previewUrl: string | null;
  textContent: string | null;
  ciphertextBase64: string;
  encryptionIvHex: string;
  encryptionTagHex: string;
  createdAt: Date | null;
}

export interface DbActivityLog {
  id: string;
  userId: number | null;
  timestamp: string;
  action: string;
  details: string;
  documentTitle: string | null;
  category: string | null;
  ipAddress: string;
  clientDevice: string;
  status: string;
  createdAt: Date | null;
}

export const dbRepo = {
  async findUserByLogin(login: string): Promise<DbUser | null> {
    if (!isCloudSqlConfigured()) return null;
    try {
      const db = getDb();
      const normalized = login.trim().toLowerCase();
      const rows = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, normalized));
      if (rows.length > 0) return rows[0];

      // Match student ID (case-insensitive)
      const idRows = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.studentId, login.trim().toUpperCase()));
      return idRows[0] || null;
    } catch (error) {
      console.error('Error finding user in Cloud SQL:', error);
      throw new Error('Database query failed while fetching user.', { cause: error });
    }
  },

  async findUserById(id: number): Promise<DbUser | null> {
    if (!isCloudSqlConfigured()) return null;
    try {
      const db = getDb();
      const rows = await db.select().from(schema.users).where(eq(schema.users.id, id));
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw new Error('Database query failed.', { cause: error });
    }
  },

  async insertUser(data: {
    uid: string;
    studentId: string;
    fullName: string;
    email: string;
    passwordHash?: string;
    passwordSalt?: string;
    degreeProgram: string;
    academicYear: string;
    storageQuotaBytes?: number;
    avatarInitials: string;
  }): Promise<DbUser> {
    const db = getDb();
    try {
      const inserted = await db
        .insert(schema.users)
        .values({
          uid: data.uid,
          studentId: data.studentId,
          fullName: data.fullName,
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash || '',
          passwordSalt: data.passwordSalt || '',
          degreeProgram: data.degreeProgram,
          academicYear: data.academicYear,
          storageQuotaBytes: data.storageQuotaBytes || 524288000,
          avatarInitials: data.avatarInitials,
        })
        .returning();
      return inserted[0];
    } catch (error) {
      console.error('Error inserting user:', error);
      throw new Error('Failed to insert user into database.', { cause: error });
    }
  },

  async updateUser(
    id: number,
    data: Partial<{
      fullName: string;
      studentId: string;
      email: string;
      degreeProgram: string;
      academicYear: string;
      avatarInitials: string;
      passwordHash: string;
      passwordSalt: string;
    }>
  ): Promise<DbUser | null> {
    const db = getDb();
    try {
      const updated = await db
        .update(schema.users)
        .set(data)
        .where(eq(schema.users.id, id))
        .returning();
      return updated[0] || null;
    } catch (error) {
      console.error('Error updating user in Cloud SQL:', error);
      throw new Error('Failed to update user in database.', { cause: error });
    }
  },

  async getDocumentsByUserId(userId: number): Promise<DbVaultDocument[]> {
    if (!isCloudSqlConfigured()) return [];
    try {
      const db = getDb();
      return await db
        .select()
        .from(schema.vaultDocuments)
        .where(eq(schema.vaultDocuments.userId, userId))
        .orderBy(desc(schema.vaultDocuments.uploadDate));
    } catch (error) {
      console.error('Error fetching documents from Cloud SQL:', error);
      throw new Error('Failed to fetch documents from database.', { cause: error });
    }
  },

  async getDocumentById(id: string): Promise<DbVaultDocument | null> {
    if (!isCloudSqlConfigured()) return null;
    try {
      const db = getDb();
      const rows = await db
        .select()
        .from(schema.vaultDocuments)
        .where(eq(schema.vaultDocuments.id, id));
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching document by id:', error);
      throw new Error('Failed to fetch document.', { cause: error });
    }
  },

  async insertDocument(data: {
    id: string;
    userId: number;
    title: string;
    category: string;
    fileName: string;
    fileSizeBytes: number;
    fileType: string;
    uploadDate: string;
    isStarred?: boolean;
    encryptionMethod?: string;
    checksumSha256: string;
    issuingAuthority: string;
    academicYear?: string;
    status?: string;
    description?: string;
    previewUrl?: string;
    textContent?: string;
    ciphertextBase64: string;
    encryptionIvHex: string;
    encryptionTagHex: string;
  }): Promise<DbVaultDocument> {
    const db = getDb();
    try {
      const inserted = await db
        .insert(schema.vaultDocuments)
        .values({
          id: data.id,
          userId: data.userId,
          title: data.title,
          category: data.category,
          fileName: data.fileName,
          fileSizeBytes: data.fileSizeBytes,
          fileType: data.fileType,
          uploadDate: data.uploadDate,
          isStarred: data.isStarred || false,
          encryptionMethod: data.encryptionMethod || 'AES-256-GCM',
          checksumSha256: data.checksumSha256,
          issuingAuthority: data.issuingAuthority,
          academicYear: data.academicYear || '',
          status: data.status || 'Encrypted',
          description: data.description || '',
          previewUrl: data.previewUrl,
          textContent: data.textContent,
          ciphertextBase64: data.ciphertextBase64,
          encryptionIvHex: data.encryptionIvHex,
          encryptionTagHex: data.encryptionTagHex,
        })
        .returning();
      return inserted[0];
    } catch (error) {
      console.error('Error inserting document in Cloud SQL:', error);
      throw new Error('Failed to save encrypted document to database.', { cause: error });
    }
  },

  async updateDocument(
    id: string,
    updates: Partial<{
      title: string;
      isStarred: boolean;
      lastAccessedDate: string;
    }>
  ): Promise<DbVaultDocument | null> {
    const db = getDb();
    try {
      const updated = await db
        .update(schema.vaultDocuments)
        .set(updates)
        .where(eq(schema.vaultDocuments.id, id))
        .returning();
      return updated[0] || null;
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Failed to update document.', { cause: error });
    }
  },

  async deleteDocument(id: string): Promise<boolean> {
    const db = getDb();
    try {
      const res = await db
        .delete(schema.vaultDocuments)
        .where(eq(schema.vaultDocuments.id, id))
        .returning();
      return res.length > 0;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document.', { cause: error });
    }
  },

  async insertActivityLog(data: {
    id: string;
    userId: number | null;
    timestamp: string;
    action: string;
    details: string;
    documentTitle?: string;
    category?: string;
    ipAddress: string;
    clientDevice: string;
    status?: string;
  }): Promise<DbActivityLog> {
    const db = getDb();
    try {
      const inserted = await db
        .insert(schema.activityLogs)
        .values({
          id: data.id,
          userId: data.userId,
          timestamp: data.timestamp,
          action: data.action,
          details: data.details,
          documentTitle: data.documentTitle,
          category: data.category,
          ipAddress: data.ipAddress,
          clientDevice: data.clientDevice,
          status: data.status || 'SUCCESS',
        })
        .returning();
      return inserted[0];
    } catch (error) {
      console.error('Error logging activity:', error);
      throw new Error('Failed to write audit log to database.', { cause: error });
    }
  },

  async getActivityLogsByUserId(userId: number): Promise<DbActivityLog[]> {
    if (!isCloudSqlConfigured()) return [];
    try {
      const db = getDb();
      return await db
        .select()
        .from(schema.activityLogs)
        .where(eq(schema.activityLogs.userId, userId))
        .orderBy(desc(schema.activityLogs.timestamp));
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw new Error('Failed to fetch activity logs.', { cause: error });
    }
  },

  async getAllRecords() {
    if (!isCloudSqlConfigured()) return { users: [], documents: [], activityLogs: [] };
    try {
      const db = getDb();
      const [uList, dList, lList] = await Promise.all([
        db.select().from(schema.users),
        db.select().from(schema.vaultDocuments).orderBy(desc(schema.vaultDocuments.uploadDate)),
        db.select().from(schema.activityLogs).orderBy(desc(schema.activityLogs.timestamp)),
      ]);

      return {
        users: uList.map((u) => ({
          id: String(u.id),
          studentId: u.studentId,
          fullName: u.fullName,
          email: u.email,
          degreeProgram: u.degreeProgram,
          academicYear: u.academicYear,
          storageQuotaBytes: u.storageQuotaBytes,
          avatarInitials: u.avatarInitials,
        })),
        documents: dList.map((d) => ({
          id: d.id,
          ownerId: String(d.userId),
          title: d.title,
          category: d.category,
          fileName: d.fileName,
          fileSizeBytes: d.fileSizeBytes,
          fileType: d.fileType,
          encryptionMethod: d.encryptionMethod,
          checksumSHA256: d.checksumSha256,
          ivHex: d.encryptionIvHex,
          tagHex: d.encryptionTagHex,
          ciphertextSample: d.ciphertextBase64.slice(0, 32) + '...',
          uploadedAt: d.uploadDate,
        })),
        activityLogs: lList.map((l) => ({
          id: l.id,
          userId: String(l.userId || ''),
          action: l.action,
          details: l.details,
          documentTitle: l.documentTitle || undefined,
          ipAddress: l.ipAddress,
          clientDevice: l.clientDevice,
          timestamp: l.timestamp,
          status: l.status,
        })),
      };
    } catch (error) {
      console.error('Error fetching all records:', error);
      throw new Error('Failed to fetch database records.', { cause: error });
    }
  },
};
