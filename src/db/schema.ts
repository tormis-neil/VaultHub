import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Users Table (Student Profile & Storage Quota)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or login identifier
  studentId: text('student_id').notNull().unique(), // e.g. 2023-01894-MN
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull().default(''),
  passwordSalt: text('password_salt').notNull().default(''),
  degreeProgram: text('degree_program').notNull(),
  academicYear: text('academic_year').notNull(),
  storageQuotaBytes: integer('storage_quota_bytes').notNull().default(524288000), // 500 MB
  avatarInitials: text('avatar_initials').notNull().default('ST'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Vault Documents Table (Encrypted Payloads & Cryptographic Vectors at Rest)
export const vaultDocuments = pgTable('vault_documents', {
  id: text('id').primaryKey(), // e.g. doc-001
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  fileName: text('file_name').notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  fileType: text('file_type').notNull(),
  uploadDate: text('upload_date').notNull(),
  lastAccessedDate: text('last_accessed_date'),
  isStarred: boolean('is_starred').default(false),
  encryptionMethod: text('encryption_method').notNull().default('AES-256-GCM'),
  checksumSha256: text('checksum_sha256').notNull(), // 64 hex characters
  issuingAuthority: text('issuing_authority').notNull(),
  academicYear: text('academic_year'),
  status: text('status').notNull().default('Encrypted'),
  description: text('description'),
  previewUrl: text('preview_url'),
  textContent: text('text_content'),
  ciphertextBase64: text('ciphertext_base64').notNull(), // Encrypted file bytes stored at rest
  encryptionIvHex: text('encryption_iv_hex').notNull(), // 12-byte (24 hex char) random nonce
  encryptionTagHex: text('encryption_tag_hex').notNull(), // 16-byte (32 hex char) GCM authentication tag
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Activity Logs Table (Immutable Security Audit Trail)
export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey(), // e.g. log-001
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  timestamp: text('timestamp').notNull(),
  action: text('action').notNull(), // USER_LOGIN, DOCUMENT_UPLOAD, DOCUMENT_DOWNLOAD, etc.
  details: text('details').notNull(),
  documentTitle: text('document_title'),
  category: text('category'),
  ipAddress: text('ip_address').notNull(),
  clientDevice: text('client_device').notNull(),
  status: text('status').notNull().default('SUCCESS'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relational Mappings
export const usersRelations = relations(users, ({ many }) => ({
  documents: many(vaultDocuments),
  activityLogs: many(activityLogs),
}));

export const vaultDocumentsRelations = relations(vaultDocuments, ({ one }) => ({
  owner: one(users, {
    fields: [vaultDocuments.userId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));
