import { getDb, isCloudSqlConfigured, schema } from './index.ts';
import { eq } from 'drizzle-orm';
import { encryptDocument, hashPassword } from '../utils/crypto.ts';

export async function seedCloudSqlDatabase() {
  if (!isCloudSqlConfigured()) {
    console.log('[Seed] Cloud SQL is not configured in environment, skipping seed.');
    return;
  }

  const db = getDb();

  try {
    const defaultPassword = 'Password123!';
    const neilPasswordHash = hashPassword(defaultPassword);
    const sophiaPasswordHash = hashPassword(defaultPassword);

    // 1. Check & Seed / Update Neil Mayo Tormis
    const existingNeil = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.studentId, '2023-01894-MN'));

    let neilId: number;

    if (existingNeil.length === 0) {
      console.log('[Seed] Seeding Neil Mayo Tormis into Cloud SQL...');
      const inserted = await db
        .insert(schema.users)
        .values({
          uid: 'usr-882194',
          studentId: '2023-01894-MN',
          fullName: 'Neil Mayo Tormis',
          email: 'tormisneilmayo@gmail.com',
          passwordHash: neilPasswordHash.hashHex,
          passwordSalt: neilPasswordHash.saltHex,
          degreeProgram: 'BS Information Technology',
          academicYear: '4th Year - Senior',
          storageQuotaBytes: 524288000,
          avatarInitials: 'NT',
        })
        .returning();
      neilId = inserted[0].id;
    } else {
      neilId = existingNeil[0].id;
      // Ensure password hash & salt are populated
      if (!existingNeil[0].passwordHash || !existingNeil[0].passwordSalt) {
        await db
          .update(schema.users)
          .set({
            passwordHash: neilPasswordHash.hashHex,
            passwordSalt: neilPasswordHash.saltHex,
          })
          .where(eq(schema.users.id, neilId));
      }
    }

    // 2. Check & Seed / Update Sophia Elena Rivera
    const existingSophia = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.studentId, '2024-00431-CS'));

    if (existingSophia.length === 0) {
      console.log('[Seed] Seeding Sophia Elena Rivera into Cloud SQL...');
      await db.insert(schema.users).values({
        uid: 'usr-441920',
        studentId: '2024-00431-CS',
        fullName: 'Sophia Elena Rivera',
        email: 'sophia.rivera@univ.edu',
        passwordHash: sophiaPasswordHash.hashHex,
        passwordSalt: sophiaPasswordHash.saltHex,
        degreeProgram: 'BS Computer Science',
        academicYear: '3rd Year - Junior',
        storageQuotaBytes: 524288000,
        avatarInitials: 'SR',
      });
    } else {
      if (!existingSophia[0].passwordHash || !existingSophia[0].passwordSalt) {
        await db
          .update(schema.users)
          .set({
            passwordHash: sophiaPasswordHash.hashHex,
            passwordSalt: sophiaPasswordHash.saltHex,
          })
          .where(eq(schema.users.id, existingSophia[0].id));
      }
    }

    // 3. Official Sample Academic Documents
    const sampleDocuments = [
      {
        id: 'doc-001',
        title: 'Official Transcript of Records (OTR) - 3rd Year',
        category: 'Transcripts',
        fileName: 'TOR_3rdYear_Official_Sealed.pdf',
        fileType: 'application/pdf',
        uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        isStarred: true,
        issuingAuthority: 'Office of the University Registrar',
        academicYear: '2025-2026',
        status: 'Encrypted',
        description: 'Official digital copy of academic grades with registrar security dry seal verification.',
        textContent: `OFFICIAL TRANSCRIPT OF RECORDS\nSTUDENT NO: 2023-01894-MN\nPROGRAM: Bachelor of Science in Information Technology\nCAMPUS: Main University Campus\n\nTerm: 1st Sem 2025-2026\n- IT 401 | Information Assurance & Security 2 | 1.25 | Passed\n- IT 402 | Capstone Project & Research 1       | 1.00 | Passed\n- IT 403 | Systems Admin & Maintenance       | 1.25 | Passed\n- IT 404 | Advanced Web Systems & Frameworks | 1.25 | Passed\n\nGeneral Weighted Average: 1.1875\nStatus: Dean's Honor List\nRegistrar Signature: Digitally Certified and Encrypted`,
      },
      {
        id: 'doc-002',
        title: "Dean's Lister Award Certificate - Academic Year 2024-2025",
        category: 'Certificates',
        fileName: 'Deans_Lister_Certificate_AY2024_2025.pdf',
        fileType: 'application/pdf',
        uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
        isStarred: true,
        issuingAuthority: 'College of Computer and Information Sciences',
        academicYear: '2024-2025',
        status: 'Encrypted',
        description: 'Recognition for academic excellence maintaining a GPA higher than 1.45.',
        textContent: `COLLEGE OF COMPUTER AND INFORMATION SCIENCES\nCERTIFICATE OF ACADEMIC EXCELLENCE\n\nThis is proudly conferred upon\nNEIL MAYO TORMIS\n\nFor meritorious academic standing as DEAN'S LISTER for the Academic Year 2024-2025.\nIssued on the 15th day of July 2025.\n\nDean: Dr. M. K. Villanueva, Ph.D.`,
      },
      {
        id: 'doc-003',
        title: 'Software Engineer & Full-Stack Developer Curriculum Vitae',
        category: 'Resumes',
        fileName: 'Neil_Mayo_Tormis_FullStack_Resume_2026.pdf',
        fileType: 'application/pdf',
        uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
        isStarred: false,
        issuingAuthority: 'Career Placement & Industry Relations',
        academicYear: '2025-2026',
        status: 'Encrypted',
        description: 'Curated technical resume highlighting Cloud SQL, AES-256, React, and TypeScript projects.',
        textContent: `NEIL MAYO TORMIS\nSoftware Engineer & IT Specialist | Manila, Philippines\nEmail: tormisneilmayo@gmail.com\n\nTECHNICAL SKILLS:\n- Frontend: React 19, TypeScript, Tailwind CSS, Vite\n- Backend: Node.js, Express, Cloud SQL (PostgreSQL), Drizzle ORM\n- Security: AES-256-GCM Authenticated Encryption, SHA-256 Fingerprinting, PBKDF2 Password Hashing\n\nPROJECTS:\nVaultHub: Student Cryptographic Cloud Document Storage System with Tamper-Evident Audit Trails.`,
      },
      {
        id: 'doc-004',
        title: 'Institutional RFID Student Identification Badge',
        category: 'Identification Cards',
        fileName: 'Student_ID_SmartCard_Front_Back.pdf',
        fileType: 'application/pdf',
        uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
        isStarred: false,
        issuingAuthority: 'University Security & Identification Bureau',
        academicYear: '2023-2027',
        status: 'Encrypted',
        description: 'Scanned verified student card with integrated MIFARE smart chip encoding.',
        textContent: `UNIVERSITY STUDENT IDENTIFICATION CARD\nName: NEIL MAYO TORMIS\nStudent Number: 2023-01894-MN\nDegree: BS Information Technology\nBlood Type: O+\nEmergency Contact: +63 917 123 4567\nValid Through: Academic Year 2026-2027`,
      },
      {
        id: 'doc-005',
        title: 'Comprehensive University Academic & Financial Clearance',
        category: 'Clearances',
        fileName: 'Final_University_Clearance_4thYear.pdf',
        fileType: 'application/pdf',
        uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
        isStarred: false,
        issuingAuthority: 'Student Affairs and Services Guidance Office',
        academicYear: '2025-2026',
        status: 'Encrypted',
        description: 'Verified multi-signatory clearance: Library, Laboratory, Accounting, ROTC, Registrar.',
        textContent: `COMPREHENSIVE STUDENT CLEARANCE SYSTEM\nStudent: 2023-01894-MN - Tormis, Neil M.\n\nSign-offs:\n1. Main University Library: [CLEARED - No outstanding books]\n2. Advanced Computing Laboratories: [CLEARED - Hardware returned]\n3. Accounting & Bursar: [CLEARED - Zero balance]\n4. Student Affairs & Discipline: [CLEARED - Good moral certificate issued]\n5. University Registrar: [CLEARED - Graduation candidate eligible]`,
      },
      {
        id: 'doc-006',
        title: 'AWS Certified Cloud Solutions Architect Candidate Certificate',
        category: 'Certificates',
        fileName: 'Cloud_Architecture_Professional_Cert.pdf',
        fileType: 'application/pdf',
        uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 75).toISOString(),
        isStarred: false,
        issuingAuthority: 'AWS Cloud Academy Partner Program',
        academicYear: '2024-2025',
        status: 'Encrypted',
        description: 'Certification validating skills in cloud database high-availability, encryption at rest, and serverless architectures.',
        textContent: `AWS ACADEMY CLOUD ARCHITECTURE\nCertificate of Completion\n\nConferred to: NEIL MAYO TORMIS\nFor completing 40 hours of cloud architecture training covering relational databases, Cloud SQL, IAM access boundaries, and end-to-end cryptographic transit security.\nVerification ID: AWS-ACAD-88491-PH`,
      },
    ];

    // Seed or synchronize each document with unified AES-256-GCM cipher payload
    for (const doc of sampleDocuments) {
      const encrypted = encryptDocument(Buffer.from(doc.textContent, 'utf-8'));
      const existing = await db
        .select()
        .from(schema.vaultDocuments)
        .where(eq(schema.vaultDocuments.id, doc.id));

      if (existing.length === 0) {
        await db.insert(schema.vaultDocuments).values({
          id: doc.id,
          userId: neilId,
          title: doc.title,
          category: doc.category,
          fileName: doc.fileName,
          fileSizeBytes: encrypted.fileSizeBytes,
          fileType: doc.fileType,
          uploadDate: doc.uploadDate,
          isStarred: doc.isStarred,
          encryptionMethod: 'AES-256-GCM',
          checksumSha256: encrypted.checksumSha256,
          issuingAuthority: doc.issuingAuthority,
          academicYear: doc.academicYear,
          status: 'Encrypted',
          description: doc.description,
          textContent: doc.textContent,
          ciphertextBase64: encrypted.ciphertextBase64,
          encryptionIvHex: encrypted.ivHex,
          encryptionTagHex: encrypted.tagHex,
        });
      } else {
        // Update ciphertext and tags to ensure unified master key matches
        await db
          .update(schema.vaultDocuments)
          .set({
            ciphertextBase64: encrypted.ciphertextBase64,
            encryptionIvHex: encrypted.ivHex,
            encryptionTagHex: encrypted.tagHex,
            checksumSha256: encrypted.checksumSha256,
            fileSizeBytes: encrypted.fileSizeBytes,
            textContent: doc.textContent,
          })
          .where(eq(schema.vaultDocuments.id, doc.id));
      }
    }
    console.log('[Seed] Encrypted documents verified and synchronized with unified AES-256-GCM.');

    // 4. Check & Seed Activity Logs
    const existingLogs = await db
      .select()
      .from(schema.activityLogs)
      .where(eq(schema.activityLogs.userId, neilId));

    if (existingLogs.length === 0) {
      console.log('[Seed] Seeding audit logs for Neil in Cloud SQL...');
      const sampleLogs = [
        {
          id: 'log-001',
          userId: neilId,
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          action: 'USER_LOGIN',
          details: 'Session started via Cloud SQL & PBKDF2-SHA256 authenticated verification',
          documentTitle: undefined,
          category: undefined,
          ipAddress: '192.168.1.104',
          clientDevice: 'Chrome 122.0 (macOS)',
          status: 'SUCCESS',
        },
        {
          id: 'log-002',
          userId: neilId,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          action: 'DOCUMENT_DECRYPT',
          details: 'Decrypted and verified SHA-256 integrity checksum for review',
          documentTitle: 'Official Transcript of Records (OTR) - 3rd Year',
          category: 'Transcripts',
          ipAddress: '192.168.1.104',
          clientDevice: 'Chrome 122.0 (macOS)',
          status: 'SUCCESS',
        },
        {
          id: 'log-003',
          userId: neilId,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          action: 'DOCUMENT_UPLOAD',
          details: 'Encrypted file with AES-256-GCM at rest and stored in Cloud SQL',
          documentTitle: 'Official Transcript of Records (OTR) - 3rd Year',
          category: 'Transcripts',
          ipAddress: '192.168.1.104',
          clientDevice: 'Chrome 122.0 (macOS)',
          status: 'SUCCESS',
        },
        {
          id: 'log-004',
          userId: neilId,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
          action: 'DOCUMENT_UPLOAD',
          details: 'Uploaded Dean’s Lister Certificate with SHA-256 verification',
          documentTitle: "Dean's Lister Award Certificate - Academic Year 2024-2025",
          category: 'Certificates',
          ipAddress: '192.168.1.104',
          clientDevice: 'Chrome 122.0 (macOS)',
          status: 'SUCCESS',
        },
        {
          id: 'log-005',
          userId: neilId,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
          action: 'DOCUMENT_UPLOAD',
          details: 'Uploaded technical resume to encrypted cloud storage',
          documentTitle: 'Software Engineer & Full-Stack Developer Curriculum Vitae',
          category: 'Resumes',
          ipAddress: '192.168.1.104',
          clientDevice: 'Chrome 122.0 (macOS)',
          status: 'SUCCESS',
        },
      ];

      for (const log of sampleLogs) {
        await db.insert(schema.activityLogs).values(log);
      }
      console.log('[Seed] Audit logs successfully seeded.');
    }
  } catch (error) {
    console.error('[Seed] Error during Cloud SQL seeding:', error);
  }
}
