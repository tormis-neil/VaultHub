import { VaultDocument, ActivityLog, StudentUser } from '../types';

export const INITIAL_USER: StudentUser = {
  id: 'usr-882194',
  studentId: '2023-01894-MN',
  fullName: 'Neil Mayo Tormis',
  email: 'tormisneilmayo@gmail.com',
  degreeProgram: 'BS Information Technology',
  academicYear: '4th Year - Senior',
  storageQuotaBytes: 500 * 1024 * 1024, // 500 MB Standard Academic Quota
  avatarInitials: 'NT',
};

export const DEMO_USERS: StudentUser[] = [
  INITIAL_USER,
  {
    id: 'usr-994102',
    studentId: '2024-00431-CS',
    fullName: 'Sophia Elena Rivera',
    email: 'sophia.rivera@univ.edu',
    degreeProgram: 'BS Computer Science',
    academicYear: '3rd Year - Junior',
    storageQuotaBytes: 500 * 1024 * 1024,
    avatarInitials: 'SR',
  },
];

export const INITIAL_DOCUMENTS: VaultDocument[] = [
  {
    id: 'doc-001',
    title: 'Official Transcript of Records (OTR) - 3rd Year',
    category: 'Transcripts',
    fileName: 'TOR_3rdYear_Official_Sealed.pdf',
    fileSizeBytes: 2450000, // ~2.45 MB
    fileType: 'application/pdf',
    uploadDate: '2026-09-12T14:32:00Z',
    lastAccessedDate: '2026-09-24T18:20:00Z',
    isStarred: true,
    encryptionMethod: 'AES-256-GCM',
    checksumSHA256: '9b7a48d3c52e89f109281a84f32e91a0b384d726c91a0b384d726c91a0b384d7',
    issuingAuthority: 'Office of the University Registrar',
    academicYear: 'A.Y. 2025-2026',
    status: 'Encrypted',
    description: 'Certified true copy of grades covering 1st to 6th semesters. Issued with university digital dry seal.',
    textContent: `OFFICIAL TRANSCRIPT OF RECORDS
STUDENT NO: 2023-01894-MN
PROGRAM: Bachelor of Science in Information Technology
CAMPUS: Main University Campus

Term: 1st Sem 2025-2026
- IT 401 | Information Assurance & Security 2 | 1.25 | Passed
- IT 402 | Capstone Project & Research 1       | 1.00 | Passed
- IT 403 | Systems Administration & Maint.     | 1.25 | Passed
- IT 404 | Mobile Application Engineering      | 1.50 | Passed
Cumulative GPA: 1.22 (President's Lister Distinction)
Status: Good Standing. No academic deficiencies.`
  },
  {
    id: 'doc-002',
    title: "Dean's List Certificate of Academic Excellence",
    category: 'Certificates',
    fileName: 'Deans_List_Honor_AY2025_Sem2.pdf',
    fileSizeBytes: 1820000, // ~1.82 MB
    fileType: 'application/pdf',
    uploadDate: '2026-08-20T09:15:00Z',
    lastAccessedDate: '2026-09-18T11:45:00Z',
    isStarred: true,
    encryptionMethod: 'AES-256-GCM',
    checksumSHA256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    issuingAuthority: 'College of Computer and Information Sciences',
    academicYear: '2nd Sem 2024-2025',
    status: 'Encrypted',
    description: 'Academic Honor Certificate awarded for maintaining a general weighted average above 1.40.',
    textContent: `COLLEGE OF COMPUTER AND INFORMATION SCIENCES
CERTIFICATE OF ACADEMIC EXCELLENCE
This award is proudly presented to
NEIL MAYO TORMIS
In recognition of outstanding scholastic performance and high academic standing,
earning a place on the DEAN'S LIST for the Second Semester, Academic Year 2024-2025.
Signed: Dr. Roberto V. Mendoza, Dean`
  },
  {
    id: 'doc-003',
    title: 'AWS Certified Cloud Practitioner - Certificate',
    category: 'Certificates',
    fileName: 'AWS_Cloud_Practitioner_Badge.pdf',
    fileSizeBytes: 1250000, // ~1.25 MB
    fileType: 'application/pdf',
    uploadDate: '2026-07-04T16:45:00Z',
    lastAccessedDate: '2026-08-30T10:00:00Z',
    isStarred: false,
    encryptionMethod: 'AES-256-GCM',
    checksumSHA256: '4a6b2c89f1d034e56789abcdef0123456789abcdef0123456789abcdef012345',
    issuingAuthority: 'Amazon Web Services Training & Certification',
    academicYear: 'Issued July 2026',
    status: 'Encrypted',
    description: 'Validation ID: AWS-0928194-CC. Focus on cloud infrastructure, IAM security, and encryption principles.'
  },
  {
    id: 'doc-004',
    title: 'Full-Stack Software Engineering Resume (2026 Edition)',
    category: 'Resumes',
    fileName: 'Neil_Tormis_Resume_SWE_2026.pdf',
    fileSizeBytes: 620000, // ~620 KB
    fileType: 'application/pdf',
    uploadDate: '2026-09-01T11:20:00Z',
    lastAccessedDate: '2026-09-25T14:10:00Z',
    isStarred: true,
    encryptionMethod: 'AES-256-GCM',
    checksumSHA256: '7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
    issuingAuthority: 'Personal Document',
    academicYear: 'Fall 2026',
    status: 'Encrypted',
    description: 'Curated technical CV targeting Graduate Software Engineer and Security Developer roles.',
    textContent: `CURRICULUM VITAE - NEIL MAYO TORMIS
BS Information Technology | University College of Computing
Contact: tormisneilmayo@gmail.com | Portfolio: vaulthub.dev/neil

CORE SKILLS:
- Frontend: React 19, TypeScript, Tailwind CSS, Vite
- Backend & Security: Django REST Framework, Node.js, AES-256 Encryption, Argon2, MySQL
- Tools: Git, Docker, REST APIs, Linux CLI

SELECTED PROJECTS:
1. VaultHub (Student Document Vault System) - End-to-end encrypted academic file storage.
2. Campus Lab Access Manager - Role-based authorization & real-time audit logging.`
  },
  {
    id: 'doc-005',
    title: 'University Student Identification Card (Front & Back)',
    category: 'Identification Cards',
    fileName: 'Univ_ID_2023_01894_MN_Encrypted.png',
    fileSizeBytes: 3100000, // ~3.1 MB
    fileType: 'image/png',
    uploadDate: '2026-05-18T08:00:00Z',
    lastAccessedDate: '2026-07-12T09:30:00Z',
    isStarred: false,
    encryptionMethod: 'AES-256-GCM',
    checksumSHA256: '3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e',
    issuingAuthority: 'University Student Affairs & Security Office',
    academicYear: 'Valid 2023-2027',
    status: 'Encrypted',
    description: 'Official student RFID identification card scan. Enforced with high-grade AES-256 encryption at rest.'
  },
  {
    id: 'doc-006',
    title: 'University Library & Laboratory Clearance Certificate',
    category: 'Clearances',
    fileName: 'Library_and_Lab_Clearance_AY2025.pdf',
    fileSizeBytes: 980000, // ~980 KB
    fileType: 'application/pdf',
    uploadDate: '2026-06-30T10:10:00Z',
    lastAccessedDate: '2026-08-01T15:00:00Z',
    isStarred: false,
    encryptionMethod: 'AES-256-GCM',
    checksumSHA256: '1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809',
    issuingAuthority: 'University Central Library & Physics Department',
    academicYear: 'Term End 2025-2026',
    status: 'Encrypted',
    description: 'Signed clearance verifying return of all academic literature and laboratory testing kits.',
    textContent: `UNIVERSITY STUDENT CLEARANCE CERTIFICATE
ACADEMIC YEAR: 2025-2026
STUDENT: NEIL MAYO TORMIS (2023-01894-MN)

DEPARTMENT CLEARANCES:
1. University Central Library: [CLEARED] - All borrowed textbooks returned.
2. College IT Laboratories: [CLEARED] - Workstation equipment inspected.
3. Accounting & Cashier Office: [CLEARED] - Tuition fees fully settled.
4. Office of Student Affairs: [CLEARED] - Good moral character intact.
Registrar Validation: Verified & Sealed electronically.`
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-09-25T23:45:12Z',
    action: 'USER_LOGIN',
    details: 'User authenticated via Argon2id password verification',
    ipAddress: '192.168.1.104',
    clientDevice: 'Chrome 128 / macOS 15.0',
    status: 'SUCCESS'
  },
  {
    id: 'log-002',
    timestamp: '2026-09-12T14:32:00Z',
    action: 'DOCUMENT_UPLOAD',
    details: 'Encrypted with AES-256-GCM (Payload size: 2.45 MB, SHA-256: 9b7a48d3...)',
    documentTitle: 'Official Transcript of Records (OTR) - 3rd Year',
    category: 'Transcripts',
    ipAddress: '192.168.1.104',
    clientDevice: 'Chrome 128 / macOS 15.0',
    status: 'SUCCESS'
  },
  {
    id: 'log-003',
    timestamp: '2026-09-01T11:20:00Z',
    action: 'DOCUMENT_UPLOAD',
    details: 'Encrypted with AES-256-GCM (Payload size: 620 KB, SHA-256: 7c8d9e0f...)',
    documentTitle: 'Full-Stack Software Engineering Resume (2026 Edition)',
    category: 'Resumes',
    ipAddress: '192.168.1.88',
    clientDevice: 'Firefox 129 / Linux x86_64',
    status: 'SUCCESS'
  },
  {
    id: 'log-004',
    timestamp: '2026-08-20T09:18:22Z',
    action: 'DOCUMENT_DECRYPT',
    details: 'Decrypted session key derived for in-browser visual inspection',
    documentTitle: "Dean's List Certificate of Academic Excellence",
    category: 'Certificates',
    ipAddress: '192.168.1.88',
    clientDevice: 'Firefox 129 / Linux x86_64',
    status: 'SUCCESS'
  },
  {
    id: 'log-005',
    timestamp: '2026-08-20T09:19:04Z',
    action: 'DOCUMENT_DOWNLOAD',
    details: 'Encrypted stream decrypted and written to client buffer as PDF',
    documentTitle: "Dean's List Certificate of Academic Excellence",
    category: 'Certificates',
    ipAddress: '192.168.1.88',
    clientDevice: 'Firefox 129 / Linux x86_64',
    status: 'SUCCESS'
  },
  {
    id: 'log-006',
    timestamp: '2026-07-04T16:45:00Z',
    action: 'DOCUMENT_UPLOAD',
    details: 'Encrypted with AES-256-GCM (Payload size: 1.25 MB, SHA-256: 4a6b2c89...)',
    documentTitle: 'AWS Certified Cloud Practitioner - Certificate',
    category: 'Certificates',
    ipAddress: '112.198.78.22',
    clientDevice: 'Mobile Safari / iOS 19',
    status: 'SUCCESS'
  }
];
