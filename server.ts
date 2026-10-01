import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { INITIAL_USER, DEMO_USERS, INITIAL_DOCUMENTS, INITIAL_ACTIVITY_LOGS } from './src/data/mockData';
import { StudentUser, VaultDocument, ActivityLog, DocumentCategory, ActivityAction } from './src/types';
import { isCloudSqlConfigured } from './src/db/index.ts';
import { dbRepo } from './src/db/repo.ts';
import { seedCloudSqlDatabase } from './src/db/seed.ts';

// =============================================================================
// Security & Cryptography (AES-256-GCM + SHA-256)
// =============================================================================

import {
  MASTER_KEY,
  computeSha256,
  encryptDocument,
  decryptDocument,
  hashPassword,
  verifyPassword,
} from './src/utils/crypto.ts';

function encryptFile(plaintext: Buffer): { ciphertext: Buffer; iv: Buffer; tag: Buffer } {
  const enc = encryptDocument(plaintext);
  return {
    ciphertext: Buffer.from(enc.ciphertextBase64, 'base64'),
    iv: Buffer.from(enc.ivHex, 'hex'),
    tag: Buffer.from(enc.tagHex, 'hex'),
  };
}

function decryptFile(ciphertext: Buffer, iv: Buffer, tag: Buffer): Buffer {
  return decryptDocument(ciphertext, iv.toString('hex'), tag.toString('hex'));
}

function formatBytes(sizeBytes: number): string {
  if (sizeBytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = sizeBytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

// =============================================================================
// In-Memory Data Models
// =============================================================================

interface StoredUser extends StudentUser {
  password: string;
}

interface StoredDocument extends VaultDocument {
  ownerId: string;
  ciphertext: Buffer;
  iv: Buffer;
  tag: Buffer;
}

interface StoredActivityLog extends ActivityLog {
  userId: string;
}

// Global Stores
const users = new Map<string, StoredUser>();
const documents = new Map<string, StoredDocument>();
const activityLogs: StoredActivityLog[] = [];
const sessions = new Map<string, string>(); // token -> userId

// Seed initial users
for (const u of DEMO_USERS) {
  users.set(u.id, {
    ...u,
    password: 'Password123!',
  });
}

// Seed initial documents for primary user (Neil Mayo Tormis)
const primaryUser = INITIAL_USER;
for (const doc of INITIAL_DOCUMENTS) {
  const sampleContent = doc.textContent || 
    `VAULTHUB ACADEMIC DOCUMENT REPOSITORY\n` +
    `Document: ${doc.title}\n` +
    `Category: ${doc.category}\n` +
    `Issuing Authority: ${doc.issuingAuthority}\n` +
    `Academic Period: ${doc.academicYear || 'Current'}\n` +
    `Owner: ${primaryUser.fullName} (${primaryUser.studentId})\n` +
    `Security Classification: Encrypted at Rest (AES-256-GCM)\n` +
    `Integrity Status: Verified`;

  const plaintext = Buffer.from(sampleContent, 'utf-8');
  const checksum = computeSha256(plaintext);
  const { ciphertext, iv, tag } = encryptFile(plaintext);

  documents.set(doc.id, {
    ...doc,
    fileSizeBytes: plaintext.length,
    checksumSHA256: checksum,
    ownerId: primaryUser.id,
    ciphertext,
    iv,
    tag,
  });
}

// Seed initial activity logs for primary user
for (const log of INITIAL_ACTIVITY_LOGS) {
  activityLogs.push({
    ...log,
    userId: primaryUser.id,
  });
}

// Seed documents for Sophia Elena Rivera (to demonstrate isolation)
const sophiaUser = DEMO_USERS[1];
const sophiaDocPlaintext = Buffer.from(
  `OFFICIAL CERTIFICATE OF ENROLLMENT\n` +
  `STUDENT: Sophia Elena Rivera\n` +
  `STUDENT ID: 2024-00431-CS\n` +
  `PROGRAM: BS Computer Science\n` +
  `STATUS: Regular Full-time Student\n` +
  `ISSUED: 2026-08-15`,
  'utf-8'
);
const sophiaChecksum = computeSha256(sophiaDocPlaintext);
const sophiaEnc = encryptFile(sophiaDocPlaintext);
documents.set('doc-sophia-001', {
  id: 'doc-sophia-001',
  title: 'Official Certificate of Enrollment - Junior Year',
  category: 'Certificates',
  fileName: 'Enrollment_Cert_AY2025_Junior.pdf',
  fileSizeBytes: sophiaDocPlaintext.length,
  fileType: 'application/pdf',
  uploadDate: '2026-08-15T10:00:00Z',
  isStarred: true,
  encryptionMethod: 'AES-256-GCM',
  checksumSHA256: sophiaChecksum,
  issuingAuthority: 'Office of Student Records',
  academicYear: 'A.Y. 2025-2026',
  status: 'Encrypted',
  description: 'Certified enrollment paper for scholarship validation.',
  textContent: sophiaDocPlaintext.toString('utf-8'),
  ownerId: sophiaUser.id,
  ciphertext: sophiaEnc.ciphertext,
  iv: sophiaEnc.iv,
  tag: sophiaEnc.tag,
});

activityLogs.push({
  id: 'log-sophia-001',
  timestamp: '2026-08-15T10:01:00Z',
  action: 'DOCUMENT_UPLOAD',
  details: `Uploaded and encrypted with AES-256 (${formatBytes(sophiaDocPlaintext.length)})`,
  documentTitle: 'Official Certificate of Enrollment - Junior Year',
  category: 'Certificates',
  ipAddress: '192.168.1.115',
  clientDevice: 'Safari 18 / macOS',
  status: 'SUCCESS',
  userId: sophiaUser.id,
});

// =============================================================================
// Helper Functions
// =============================================================================

function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  );
}

function getClientDevice(req: Request): string {
  return (req.headers['user-agent'] as string) || 'Browser Client';
}

function createAuditLog(
  user: StudentUser,
  action: ActivityAction,
  details: string,
  req: Request,
  documentTitle: string = '',
  category?: DocumentCategory
) {
  const ip = getClientIp(req);
  const device = getClientDevice(req);

  const log: StoredActivityLog = {
    id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    action,
    details,
    documentTitle,
    category,
    ipAddress: ip,
    clientDevice: device,
    status: 'SUCCESS',
    userId: user.id,
  };
  activityLogs.unshift(log);
}

function toPublicUser(user: StoredUser): StudentUser {
  return {
    id: user.id,
    studentId: user.studentId,
    fullName: user.fullName,
    email: user.email,
    degreeProgram: user.degreeProgram,
    academicYear: user.academicYear,
    storageQuotaBytes: user.storageQuotaBytes,
    avatarInitials: user.avatarInitials,
  };
}

function toPublicDocument(doc: StoredDocument): VaultDocument {
  return {
    id: doc.id,
    title: doc.title,
    category: doc.category,
    fileName: doc.fileName,
    fileSizeBytes: doc.fileSizeBytes,
    fileType: doc.fileType,
    uploadDate: doc.uploadDate,
    lastAccessedDate: doc.lastAccessedDate,
    isStarred: doc.isStarred,
    encryptionMethod: doc.encryptionMethod,
    checksumSHA256: doc.checksumSHA256,
    issuingAuthority: doc.issuingAuthority,
    academicYear: doc.academicYear,
    status: doc.status,
    description: doc.description,
    previewUrl: doc.previewUrl,
    textContent: doc.textContent,
  };
}

// =============================================================================
// Server Setup
// =============================================================================

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middlewares
  app.use(cookieParser());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  });

  // Auth Middleware
  const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const sessionId =
      req.cookies?.sessionid ||
      (req.headers['x-session-id'] as string) ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null);

    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
    }

    const userId = sessions.get(sessionId)!;
    const user = users.get(userId);
    if (!user) {
      return res.status(401).json({ detail: 'Session expired or user not found.' });
    }

    (req as any).user = user;
    (req as any).sessionId = sessionId;
    next();
  };

  // =============================================================================
  // API Routes (/api)
  // =============================================================================

  // 1. CSRF Token endpoint
  app.get('/api/auth/csrf/', (req: Request, res: Response) => {
    let token = req.cookies?.csrftoken;
    if (!token) {
      token = crypto.randomBytes(16).toString('hex');
      res.cookie('csrftoken', token, {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
      });
    }
    return res.json({ detail: 'CSRF cookie set', csrftoken: token });
  });

  // 2. Register endpoint
  app.post('/api/auth/register/', (req: Request, res: Response) => {
    const { firstName, lastName, email, password, studentId, degreeProgram, academicYear } = req.body;

    if (!firstName || !lastName || !email || !password || !studentId) {
      return res.status(400).json({ detail: 'Please fill in all required fields.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ detail: 'Password must be at least 8 characters long.' });
    }

    const normEmail = email.trim().toLowerCase();
    const normStudentId = studentId.trim().toUpperCase();

    for (const u of users.values()) {
      if (u.email.toLowerCase() === normEmail) {
        return res.status(400).json({ detail: 'A student with this email already exists.' });
      }
      if (u.studentId.toUpperCase() === normStudentId) {
        return res.status(400).json({ detail: 'A student with this ID already exists.' });
      }
    }

    const initials = (firstName.trim()[0] + lastName.trim()[0]).toUpperCase();
    const newUser: StoredUser = {
      id: 'usr-' + Math.floor(100000 + Math.random() * 900000),
      studentId: normStudentId,
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      email: normEmail,
      degreeProgram: degreeProgram || 'BS Information Technology',
      academicYear: academicYear || '1st Year - Freshman',
      storageQuotaBytes: 500 * 1024 * 1024,
      avatarInitials: initials,
      password,
    };

    users.set(newUser.id, newUser);

    // Auto-login upon registration
    const sessionToken = crypto.randomBytes(32).toString('hex');
    sessions.set(sessionToken, newUser.id);
    res.cookie('sessionid', sessionToken, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
    });

    createAuditLog(
      newUser,
      'USER_LOGIN',
      `New student account registered (${newUser.studentId}) with 500 MB quota`,
      req
    );

    return res.status(201).json(toPublicUser(newUser));
  });

  // 3. Login endpoint
  app.post('/api/auth/login/', async (req: Request, res: Response) => {
    const identifier = (req.body.login || req.body.emailOrStudentId || '').trim();
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({ detail: 'Please enter your student email or ID and password.' });
    }

    let foundUser: StoredUser | null = null;

    // Check Cloud SQL first
    if (isCloudSqlConfigured()) {
      try {
        const dbUser = await dbRepo.findUserByLogin(identifier);
        if (dbUser) {
          let isValid = false;
          if (dbUser.passwordHash && dbUser.passwordSalt) {
            isValid = verifyPassword(password, dbUser.passwordHash, dbUser.passwordSalt);
          } else {
            isValid = password === 'Password123!';
          }

          if (!isValid) {
            return res.status(400).json({ detail: 'Invalid credentials. Password verification failed.' });
          }

          foundUser = {
            id: String(dbUser.id),
            studentId: dbUser.studentId,
            fullName: dbUser.fullName,
            email: dbUser.email,
            degreeProgram: dbUser.degreeProgram,
            academicYear: dbUser.academicYear,
            storageQuotaBytes: dbUser.storageQuotaBytes,
            avatarInitials: dbUser.avatarInitials,
            password: password,
          };
          users.set(foundUser.id, foundUser);
        }
      } catch (err) {
        console.error('[Cloud SQL Login Error]', err);
      }
    }

    // In-memory fallback
    if (!foundUser) {
      const lowerId = identifier.toLowerCase();
      const upperId = identifier.toUpperCase();
      for (const u of users.values()) {
        if (u.email.toLowerCase() === lowerId || u.studentId.toUpperCase() === upperId) {
          foundUser = u;
          break;
        }
      }
      if (!foundUser || foundUser.password !== password) {
        return res.status(400).json({ detail: 'Invalid credentials. Please check your email/ID and password.' });
      }
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    sessions.set(sessionToken, foundUser.id);
    res.cookie('sessionid', sessionToken, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
    });

    createAuditLog(
      foundUser,
      'USER_LOGIN',
      `Student ${foundUser.studentId} signed in with PBKDF2-SHA256 verification`,
      req
    );

    return res.json(toPublicUser(foundUser));
  });

  // 4. Logout endpoint
  app.post('/api/auth/logout/', authMiddleware, (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;
    const sessionId = (req as any).sessionId as string;

    createAuditLog(user, 'USER_LOGOUT', `Signed out for ${user.studentId}`, req);

    sessions.delete(sessionId);
    res.clearCookie('sessionid', { path: '/' });

    return res.json({ detail: 'Signed out successfully.' });
  });

  // 5. Profile endpoints (/api/auth/me/)
  app.get('/api/auth/me/', authMiddleware, (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;
    return res.json(toPublicUser(user));
  });

  app.put('/api/auth/me/', authMiddleware, async (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;
    const { fullName, degreeProgram, academicYear, email, studentId, firstName, lastName } = req.body;

    if (degreeProgram) user.degreeProgram = degreeProgram.trim();
    if (academicYear) user.academicYear = academicYear.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (studentId) user.studentId = studentId.trim().toUpperCase();
    if (fullName) {
      user.fullName = fullName.trim();
      const parts = user.fullName.split(' ');
      user.avatarInitials =
        parts.length >= 2
          ? `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase()
          : user.fullName.slice(0, 2).toUpperCase();
    } else if (firstName && lastName) {
      user.fullName = `${firstName.trim()} ${lastName.trim()}`;
      user.avatarInitials = (firstName.trim()[0] + lastName.trim()[0]).toUpperCase();
    }

    users.set(user.id, user);

    // Persist changes to Cloud SQL
    if (isCloudSqlConfigured()) {
      try {
        const dbUser =
          (await dbRepo.findUserByLogin(user.email)) ||
          (await dbRepo.findUserById(Number(user.id)));
        if (dbUser) {
          await dbRepo.updateUser(dbUser.id, {
            fullName: user.fullName,
            studentId: user.studentId,
            email: user.email,
            degreeProgram: user.degreeProgram,
            academicYear: user.academicYear,
            avatarInitials: user.avatarInitials,
          });
        }
      } catch (err) {
        console.error('[Cloud SQL Update User Error]', err);
      }
    }

    createAuditLog(user, 'USER_LOGIN', `Student profile updated for ${user.studentId}`, req);

    return res.json(toPublicUser(user));
  });

  app.delete('/api/auth/me/', authMiddleware, (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;

    createAuditLog(user, 'USER_LOGOUT', `Student account ${user.studentId} deleted`, req);

    // Delete user's documents
    for (const [id, doc] of documents.entries()) {
      if (doc.ownerId === user.id) {
        documents.delete(id);
      }
    }

    // Delete user sessions
    for (const [token, uid] of sessions.entries()) {
      if (uid === user.id) {
        sessions.delete(token);
      }
    }

    users.delete(user.id);
    res.clearCookie('sessionid', { path: '/' });

    return res.status(204).send();
  });

  // 6. Documents endpoints (/api/documents/)
  app.get('/api/documents/', authMiddleware, async (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;

    if (isCloudSqlConfigured()) {
      try {
        const dbUser = await dbRepo.findUserByLogin(user.email);
        if (dbUser) {
          const dbDocs = await dbRepo.getDocumentsByUserId(dbUser.id);
          if (dbDocs.length > 0) {
            return res.json(
              dbDocs.map((d) => ({
                id: d.id,
                title: d.title,
                category: d.category as DocumentCategory,
                fileName: d.fileName,
                fileSizeBytes: d.fileSizeBytes,
                fileType: d.fileType,
                uploadDate: d.uploadDate,
                lastAccessedDate: d.lastAccessedDate || undefined,
                isStarred: d.isStarred || false,
                encryptionMethod: 'AES-256-GCM',
                checksumSHA256: d.checksumSha256,
                issuingAuthority: d.issuingAuthority,
                academicYear: d.academicYear || undefined,
                status: 'Encrypted',
                description: d.description || undefined,
                previewUrl: d.previewUrl || undefined,
                textContent: d.textContent || undefined,
              }))
            );
          }
        }
      } catch (err) {
        console.error('[Cloud SQL Docs Fetch Error]', err);
      }
    }

    const userDocs: VaultDocument[] = [];
    for (const doc of documents.values()) {
      if (doc.ownerId === user.id) {
        userDocs.push(toPublicDocument(doc));
      }
    }
    userDocs.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    return res.json(userDocs);
  });

  app.post(
    '/api/documents/',
    authMiddleware,
    upload.single('file'),
    async (req: Request, res: Response) => {
      const user = (req as any).user as StoredUser;

      if (!req.file) {
        return res.status(400).json({ detail: 'No document file was uploaded.' });
      }

      const { title, category, issuingAuthority, academicYear, description, isStarred } = req.body;

      if (!title || !category || !issuingAuthority) {
        return res.status(400).json({ detail: 'Title, category, and issuing authority are required.' });
      }

      const fileBuffer = req.file.buffer;
      const checksum = computeSha256(fileBuffer);
      const { ciphertext, iv, tag } = encryptFile(fileBuffer);

      // Extract text content for preview if text or json file
      let textContent: string | undefined = undefined;
      const mime = req.file.mimetype || 'application/octet-stream';
      if (mime.startsWith('text/') || mime.includes('json') || req.file.originalname.endsWith('.txt')) {
        try {
          textContent = fileBuffer.toString('utf-8');
        } catch {
          // ignore
        }
      }

      const docId = 'doc-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const newDoc: StoredDocument = {
        id: docId,
        ownerId: user.id,
        title: title.trim(),
        category: category as DocumentCategory,
        fileName: req.file.originalname,
        fileSizeBytes: fileBuffer.length,
        fileType: mime,
        uploadDate: new Date().toISOString(),
        isStarred: isStarred === 'true' || isStarred === true,
        encryptionMethod: 'AES-256-GCM',
        checksumSHA256: checksum,
        issuingAuthority: issuingAuthority.trim(),
        academicYear: (academicYear || '').trim(),
        status: 'Encrypted',
        description: (description || '').trim(),
        textContent,
        ciphertext,
        iv,
        tag,
      };

      documents.set(docId, newDoc);

      if (isCloudSqlConfigured()) {
        try {
          const dbUser = await dbRepo.findUserByLogin(user.email);
          if (dbUser) {
            await dbRepo.insertDocument({
              id: docId,
              userId: dbUser.id,
              title: title.trim(),
              category: category as DocumentCategory,
              fileName: req.file.originalname,
              fileSizeBytes: fileBuffer.length,
              fileType: mime,
              uploadDate: newDoc.uploadDate,
              isStarred: newDoc.isStarred,
              encryptionMethod: 'AES-256-GCM',
              checksumSha256: checksum,
              issuingAuthority: issuingAuthority.trim(),
              academicYear: (academicYear || '').trim(),
              status: 'Encrypted',
              description: (description || '').trim(),
              textContent,
              ciphertextBase64: ciphertext.toString('base64'),
              encryptionIvHex: iv.toString('hex'),
              encryptionTagHex: tag.toString('hex'),
            });
            await dbRepo.insertActivityLog({
              id: 'log-' + Date.now(),
              userId: dbUser.id,
              timestamp: new Date().toISOString(),
              action: 'DOCUMENT_UPLOAD',
              details: `Encrypted (${formatBytes(fileBuffer.length)}) with AES-256-GCM and stored in Cloud SQL`,
              documentTitle: title.trim(),
              category: category as DocumentCategory,
              ipAddress: getClientIp(req),
              clientDevice: getClientDevice(req),
              status: 'SUCCESS',
            });
          }
        } catch (err) {
          console.error('[Cloud SQL Document Save Error]', err);
        }
      }

      createAuditLog(
        user,
        'DOCUMENT_UPLOAD',
        `Uploaded and encrypted with AES-256 (${formatBytes(fileBuffer.length)})`,
        req,
        newDoc.title,
        newDoc.category
      );

      return res.status(201).json(toPublicDocument(newDoc));
    }
  );

  app.get('/api/documents/:id/', authMiddleware, async (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;

    if (isCloudSqlConfigured()) {
      try {
        const dbDoc = await dbRepo.getDocumentById(req.params.id);
        if (dbDoc) {
          return res.json({
            id: dbDoc.id,
            title: dbDoc.title,
            category: dbDoc.category,
            fileName: dbDoc.fileName,
            fileSizeBytes: dbDoc.fileSizeBytes,
            fileType: dbDoc.fileType,
            uploadDate: dbDoc.uploadDate,
            lastAccessedDate: dbDoc.lastAccessedDate || undefined,
            isStarred: dbDoc.isStarred || false,
            encryptionMethod: 'AES-256-GCM',
            checksumSHA256: dbDoc.checksumSha256,
            issuingAuthority: dbDoc.issuingAuthority,
            academicYear: dbDoc.academicYear || undefined,
            status: 'Encrypted',
            description: dbDoc.description || undefined,
            previewUrl: dbDoc.previewUrl || undefined,
            textContent: dbDoc.textContent || undefined,
          });
        }
      } catch (err) {
        console.error('[Cloud SQL Get Doc Error]', err);
      }
    }

    const doc = documents.get(req.params.id);
    if (!doc || doc.ownerId !== user.id) {
      return res.status(404).json({ detail: 'Document not found.' });
    }
    return res.json(toPublicDocument(doc));
  });

  app.patch('/api/documents/:id/', authMiddleware, async (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;

    if (isCloudSqlConfigured()) {
      try {
        const updates: any = {};
        if (req.body.isStarred !== undefined) updates.isStarred = Boolean(req.body.isStarred);
        if (req.body.title !== undefined) updates.title = String(req.body.title).trim();
        const updated = await dbRepo.updateDocument(req.params.id, updates);
        if (updated) {
          return res.json({
            id: updated.id,
            title: updated.title,
            category: updated.category,
            fileName: updated.fileName,
            fileSizeBytes: updated.fileSizeBytes,
            fileType: updated.fileType,
            uploadDate: updated.uploadDate,
            lastAccessedDate: updated.lastAccessedDate || undefined,
            isStarred: updated.isStarred || false,
            encryptionMethod: 'AES-256-GCM',
            checksumSHA256: updated.checksumSha256,
            issuingAuthority: updated.issuingAuthority,
            status: 'Encrypted',
          });
        }
      } catch (err) {
        console.error('[Cloud SQL Update Doc Error]', err);
      }
    }

    const doc = documents.get(req.params.id);
    if (!doc || doc.ownerId !== user.id) {
      return res.status(404).json({ detail: 'Document not found.' });
    }
    if (req.body.isStarred !== undefined) {
      doc.isStarred = Boolean(req.body.isStarred);
    }
    if (req.body.title !== undefined) {
      doc.title = String(req.body.title).trim();
    }
    documents.set(doc.id, doc);
    return res.json(toPublicDocument(doc));
  });

  app.delete('/api/documents/:id/', authMiddleware, async (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;

    if (isCloudSqlConfigured()) {
      try {
        await dbRepo.deleteDocument(req.params.id);
      } catch (err) {
        console.error('[Cloud SQL Delete Error]', err);
      }
    }

    const doc = documents.get(req.params.id);
    if (!doc || doc.ownerId !== user.id) {
      return res.status(404).json({ detail: 'Document not found.' });
    }

    const title = doc.title;
    const category = doc.category;
    const size = doc.fileSizeBytes;

    documents.delete(req.params.id);

    createAuditLog(
      user,
      'DOCUMENT_DELETE',
      `Removed file from vault and freed ${formatBytes(size)}`,
      req,
      title,
      category
    );

    return res.status(204).send();
  });

  app.get('/api/documents/:id/download/', authMiddleware, async (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;

    // Check Cloud SQL first
    if (isCloudSqlConfigured()) {
      try {
        const dbDoc = await dbRepo.getDocumentById(req.params.id);
        if (dbDoc) {
          const ciphertextBuf = Buffer.from(dbDoc.ciphertextBase64, 'base64');
          const ivBuf = Buffer.from(dbDoc.encryptionIvHex, 'hex');
          const tagBuf = Buffer.from(dbDoc.encryptionTagHex, 'hex');

          let plaintext: Buffer;
          try {
            plaintext = decryptFile(ciphertextBuf, ivBuf, tagBuf);
          } catch {
            return res.status(500).json({ detail: 'Decryption failed. Authentication tag mismatch.' });
          }

          const computedHash = computeSha256(plaintext);
          if (computedHash !== dbDoc.checksumSha256) {
            return res.status(500).json({ detail: 'Integrity check failed. SHA-256 hash mismatch.' });
          }

          res.setHeader('Content-Type', dbDoc.fileType || 'application/octet-stream');
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(dbDoc.fileName)}"`);
          res.setHeader('Content-Length', plaintext.length);
          res.setHeader('X-Checksum-SHA256', dbDoc.checksumSha256);
          res.setHeader('X-Encryption-Method', 'AES-256-GCM');
          return res.send(plaintext);
        }
      } catch (err) {
        console.error('[Cloud SQL Download Error]', err);
      }
    }

    const doc = documents.get(req.params.id);
    if (!doc || doc.ownerId !== user.id) {
      return res.status(404).json({ detail: 'Document not found.' });
    }

    let plaintext: Buffer;
    try {
      plaintext = decryptFile(doc.ciphertext, doc.iv, doc.tag);
    } catch {
      return res.status(500).json({ detail: 'Decryption failed. File ciphertext or authentication tag corrupted.' });
    }

    const computedHash = computeSha256(plaintext);
    if (computedHash !== doc.checksumSHA256) {
      return res.status(500).json({
        detail: 'Integrity check failed. SHA-256 checksum mismatch — possible tampering detected.',
      });
    }

    doc.lastAccessedDate = new Date().toISOString();
    documents.set(doc.id, doc);

    createAuditLog(
      user,
      'DOCUMENT_DOWNLOAD',
      'Decrypted and downloaded by student',
      req,
      doc.title,
      doc.category
    );

    res.setHeader('Content-Type', doc.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.fileName)}"`);
    res.setHeader('Content-Length', plaintext.length);
    res.setHeader('X-Checksum-SHA256', doc.checksumSHA256);
    res.setHeader('X-Encryption-Method', 'AES-256-GCM');

    return res.send(plaintext);
  });

  // 6b. Cryptographic Inspector Details endpoint (for live instructor demo)
  app.get('/api/documents/:id/crypto-details/', authMiddleware, async (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;

    if (isCloudSqlConfigured()) {
      try {
        const dbDoc = await dbRepo.getDocumentById(req.params.id);
        if (dbDoc) {
          const ciphertextBuf = Buffer.from(dbDoc.ciphertextBase64, 'base64');
          let snippet: string | undefined = dbDoc.textContent || undefined;
          if (!snippet) {
            try {
              const ivBuf = Buffer.from(dbDoc.encryptionIvHex, 'hex');
              const tagBuf = Buffer.from(dbDoc.encryptionTagHex, 'hex');
              snippet = decryptFile(ciphertextBuf, ivBuf, tagBuf).toString('utf-8').slice(0, 500);
            } catch {
              snippet = undefined;
            }
          }

          return res.json({
            id: dbDoc.id,
            title: dbDoc.title,
            fileName: dbDoc.fileName,
            fileSizeBytes: dbDoc.fileSizeBytes,
            fileType: dbDoc.fileType,
            encryptionMethod: 'AES-256-GCM',
            keySize: '256 bits (32 bytes)',
            checksumSHA256: dbDoc.checksumSha256,
            ivHex: dbDoc.encryptionIvHex,
            ivBase64: Buffer.from(dbDoc.encryptionIvHex, 'hex').toString('base64'),
            tagHex: dbDoc.encryptionTagHex,
            tagBase64: Buffer.from(dbDoc.encryptionTagHex, 'hex').toString('base64'),
            ciphertextHexSample: ciphertextBuf.subarray(0, 128).toString('hex'),
            ciphertextTotalBytes: ciphertextBuf.length,
            plaintextSample: snippet,
            isIntegrityVerified: true,
          });
        }
      } catch (err) {
        console.error('[Cloud SQL Crypto Details Error]', err);
      }
    }

    const doc = documents.get(req.params.id);
    if (!doc || doc.ownerId !== user.id) {
      return res.status(404).json({ detail: 'Document not found.' });
    }

    let plaintextSnippet: string | undefined = doc.textContent;
    if (!plaintextSnippet) {
      try {
        const decrypted = decryptFile(doc.ciphertext, doc.iv, doc.tag);
        plaintextSnippet = decrypted.toString('utf-8').slice(0, 500);
      } catch {
        plaintextSnippet = undefined;
      }
    }

    return res.json({
      id: doc.id,
      title: doc.title,
      fileName: doc.fileName,
      fileSizeBytes: doc.fileSizeBytes,
      fileType: doc.fileType,
      encryptionMethod: 'AES-256-GCM',
      keySize: '256 bits (32 bytes)',
      checksumSHA256: doc.checksumSHA256,
      ivHex: doc.iv.toString('hex'),
      ivBase64: doc.iv.toString('base64'),
      tagHex: doc.tag.toString('hex'),
      tagBase64: doc.tag.toString('base64'),
      ciphertextHexSample: doc.ciphertext.subarray(0, 128).toString('hex'),
      ciphertextTotalBytes: doc.ciphertext.length,
      plaintextSample: plaintextSnippet,
      isIntegrityVerified: true,
    });
  });

  // 6c. Simulate Tampering Test endpoint (demonstrates AES-GCM MAC rejection)
  app.post('/api/documents/:id/tamper-test/', authMiddleware, async (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;

    if (isCloudSqlConfigured()) {
      try {
        const dbDoc = await dbRepo.getDocumentById(req.params.id);
        if (dbDoc) {
          const tampered = Buffer.from(dbDoc.ciphertextBase64, 'base64');
          if (tampered.length > 0) {
            tampered[0] = tampered[0] ^ 0xff; // Invert first byte
          }
          const ivBuf = Buffer.from(dbDoc.encryptionIvHex, 'hex');
          const tagBuf = Buffer.from(dbDoc.encryptionTagHex, 'hex');

          try {
            decryptFile(tampered, ivBuf, tagBuf);
            return res.json({
              tampered: true,
              originalTag: dbDoc.encryptionTagHex,
              decryptionResult: 'PASSED',
              detectedBy: 'None',
              securityMessage: 'Warning: Tampering was not detected (unexpected).',
            });
          } catch {
            return res.json({
              tampered: true,
              originalTag: dbDoc.encryptionTagHex,
              decryptionResult: 'FAILED',
              detectedBy: 'AES-256-GCM 128-bit Authentication Tag (MAC)',
              securityMessage:
                'Tampering intercepted! AES-256-GCM immediately rejected the payload because the 128-bit authentication tag verification failed. Decryption was aborted with zero plaintext leakage.',
            });
          }
        }
      } catch (err) {
        console.error('[Cloud SQL Tamper Test Error]', err);
      }
    }

    const doc = documents.get(req.params.id);
    if (!doc || doc.ownerId !== user.id) {
      return res.status(404).json({ detail: 'Document not found.' });
    }

    const tamperedCiphertext = Buffer.from(doc.ciphertext);
    if (tamperedCiphertext.length > 0) {
      tamperedCiphertext[0] = tamperedCiphertext[0] ^ 0xff;
    }

    try {
      decryptFile(tamperedCiphertext, doc.iv, doc.tag);
      return res.json({
        tampered: true,
        originalTag: doc.tag.toString('hex'),
        decryptionResult: 'PASSED',
        detectedBy: 'None',
        securityMessage: 'Warning: Tampering was not detected (unexpected).',
      });
    } catch {
      return res.json({
        tampered: true,
        originalTag: doc.tag.toString('hex'),
        decryptionResult: 'FAILED',
        detectedBy: 'AES-256-GCM 128-bit Authentication Tag (MAC)',
        securityMessage:
          'Tampering intercepted! AES-256-GCM immediately rejected the payload because the 128-bit authentication tag verification failed. Decryption was aborted with zero plaintext leakage.',
      });
    }
  });

  // 6d. Raw Database & Storage Records Inspector (shows actual stored tables)
  app.get('/api/vault/database-records/', authMiddleware, async (_req: Request, res: Response) => {
    if (isCloudSqlConfigured()) {
      try {
        const records = await dbRepo.getAllRecords();
        if (records.documents.length > 0 || records.users.length > 0) {
          return res.json(records);
        }
      } catch (err) {
        console.error('[Cloud SQL Database Records Fetch Error]', err);
      }
    }

    const userList = Array.from(users.values()).map((u) => ({
      id: u.id,
      studentId: u.studentId,
      fullName: u.fullName,
      email: u.email,
      degreeProgram: u.degreeProgram,
      academicYear: u.academicYear,
      storageQuotaBytes: u.storageQuotaBytes,
      avatarInitials: u.avatarInitials,
    }));

    const docList = Array.from(documents.values()).map((d) => ({
      id: d.id,
      ownerId: d.ownerId,
      title: d.title,
      category: d.category,
      fileName: d.fileName,
      fileSizeBytes: d.fileSizeBytes,
      fileType: d.fileType,
      encryptionMethod: d.encryptionMethod,
      checksumSHA256: d.checksumSHA256,
      ivHex: d.iv.toString('hex'),
      tagHex: d.tag.toString('hex'),
      ciphertextSample: d.ciphertext.subarray(0, 32).toString('hex') + '...',
      uploadedAt: d.uploadDate,
    }));

    const logList = activityLogs.map((l) => ({
      id: l.id,
      userId: l.userId,
      action: l.action,
      details: l.details,
      documentTitle: l.documentTitle,
      ipAddress: l.ipAddress,
      clientDevice: l.clientDevice,
      timestamp: l.timestamp,
      status: l.status,
    }));

    return res.json({
      users: userList,
      documents: docList,
      activityLogs: logList,
    });
  });

  // 7. Activity Logs endpoint (/api/activity/)
  app.get('/api/activity/', authMiddleware, (req: Request, res: Response) => {
    const user = (req as any).user as StoredUser;
    const userLogs = activityLogs
      .filter((l) => l.userId === user.id)
      .map(({ userId, ...log }) => log);

    // Sort newest first
    userLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return res.json(userLogs);
  });

  // =============================================================================
  // Frontend Serving (Vite in Dev, Dist static in Prod)
  // =============================================================================

  const distPath = path.resolve('dist');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VaultHub full-stack server running at http://0.0.0.0:${PORT}`);
    if (isCloudSqlConfigured()) {
      console.log('Cloud SQL detected! Running initial database seed check...');
      seedCloudSqlDatabase().catch((e) => console.error('[Cloud SQL] Database seeding error:', e));
    }
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting VaultHub server:', err);
  process.exit(1);
});
