"""
VaultHub Seed Script: Seed demo users and initial documents with real AES-256-GCM encryption
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vaulthub_config.settings')
django.setup()

from django.core.files.base import ContentFile
from vault.models import StudentUser, VaultDocument, ActivityLog
from vault.encryption import compute_sha256, encrypt_file

def seed():
    print("--- Seeding VaultHub Demo Data ---")

    # 1. Seed Neil Mayo Tormis
    user1, created1 = StudentUser.objects.get_or_create(
        email='tormisneilmayo@gmail.com',
        defaults={
            'username': 'tormisneilmayo@gmail.com',
            'first_name': 'Neil Mayo',
            'last_name': 'Tormis',
            'student_id': '2023-01894-MN',
            'degree_program': 'BS Information Technology',
            'academic_year': '4th Year - Senior',
            'storage_quota_bytes': 500 * 1024 * 1024,
            'avatar_initials': 'NT',
        }
    )
    user1.set_password('Password123!')
    user1.student_id = '2023-01894-MN'
    user1.degree_program = 'BS Information Technology'
    user1.academic_year = '4th Year - Senior'
    user1.avatar_initials = 'NT'
    user1.save()
    print(f"User 1: {user1.email} ({user1.student_id}) - Ready")

    # 2. Seed Sophia Elena Rivera
    user2, created2 = StudentUser.objects.get_or_create(
        email='sophia.rivera@univ.edu',
        defaults={
            'username': 'sophia.rivera@univ.edu',
            'first_name': 'Sophia Elena',
            'last_name': 'Rivera',
            'student_id': '2024-00431-CS',
            'degree_program': 'BS Computer Science',
            'academic_year': '3rd Year - Junior',
            'storage_quota_bytes': 500 * 1024 * 1024,
            'avatar_initials': 'SR',
        }
    )
    user2.set_password('Password123!')
    user2.student_id = '2024-00431-CS'
    user2.degree_program = 'BS Computer Science'
    user2.academic_year = '3rd Year - Junior'
    user2.avatar_initials = 'SR'
    user2.save()
    print(f"User 2: {user2.email} ({user2.student_id}) - Ready")

    # 3. Seed Initial Documents for Neil Mayo Tormis if none exist
    if not VaultDocument.objects.filter(owner=user1).exists():
        docs_to_seed = [
            {
                'title': 'Official Transcript of Records (OTR) - 3rd Year',
                'category': 'Transcripts',
                'filename': 'TOR_3rdYear_Official_Sealed.pdf',
                'content': b"%PDF-1.4 Official Transcript of Records for Neil Mayo Tormis (2023-01894-MN)\nCumulative GPA: 1.22\nPresident's Lister Distinction\nAll 1st-6th semester subjects PASSED.",
                'file_type': 'application/pdf',
                'is_starred': True,
                'issuing_authority': 'Office of the University Registrar',
                'academic_year': 'A.Y. 2025-2026',
                'description': 'Certified true copy of grades covering 1st to 6th semesters with university digital dry seal.',
            },
            {
                'title': "Dean's List Certificate of Academic Excellence",
                'category': 'Certificates',
                'filename': 'Deans_List_Honor_AY2025_Sem2.pdf',
                'content': b"%PDF-1.4 Certificate of Academic Excellence awarded to Neil Mayo Tormis for Dean's List distinction.",
                'file_type': 'application/pdf',
                'is_starred': True,
                'issuing_authority': 'College of Computer and Information Sciences',
                'academic_year': '2nd Sem 2024-2025',
                'description': 'Academic Honor Certificate awarded for maintaining general weighted average above 1.40.',
            },
            {
                'title': 'AWS Certified Cloud Practitioner - Certificate',
                'category': 'Certificates',
                'filename': 'AWS_Cloud_Practitioner_Badge.pdf',
                'content': b"%PDF-1.4 AWS Certification Validation ID: AWS-0928194-CC. Awarded to Neil Mayo Tormis.",
                'file_type': 'application/pdf',
                'is_starred': False,
                'issuing_authority': 'Amazon Web Services Training & Certification',
                'academic_year': 'Issued July 2026',
                'description': 'Validation ID: AWS-0928194-CC. Focus on cloud infrastructure, IAM security, and encryption principles.',
            },
            {
                'title': 'Full-Stack Software Engineering Resume (2026 Edition)',
                'category': 'Resumes',
                'filename': 'Neil_Tormis_Resume_SWE_2026.pdf',
                'content': b"%PDF-1.4 Curriculum Vitae of Neil Mayo Tormis. Core Skills: React 19, TypeScript, Django, AES-256.",
                'file_type': 'application/pdf',
                'is_starred': True,
                'issuing_authority': 'Personal Document',
                'academic_year': 'Fall 2026',
                'description': 'Curated technical CV targeting Graduate Software Engineer and Security Developer roles.',
            },
            {
                'title': 'University Student Identification Card (Front & Back)',
                'category': 'Identification Cards',
                'filename': 'Univ_ID_2023_01894_MN_Encrypted.png',
                'content': b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR Mock student ID card PNG data for 2023-01894-MN",
                'file_type': 'image/png',
                'is_starred': False,
                'issuing_authority': 'University Student Affairs & Security Office',
                'academic_year': 'Valid 2023-2027',
                'description': 'Official student RFID identification card scan. Enforced with high-grade AES-256 encryption at rest.',
            },
            {
                'title': 'University Library & Laboratory Clearance Certificate',
                'category': 'Clearances',
                'filename': 'Library_and_Lab_Clearance_AY2025.pdf',
                'content': b"%PDF-1.4 University Library and Physics Laboratory signed clearance. No liabilities recorded.",
                'file_type': 'application/pdf',
                'is_starred': False,
                'issuing_authority': 'University Central Library & Physics Department',
                'academic_year': 'Term End 2025-2026',
                'description': 'Signed clearance verifying return of all academic literature and laboratory testing kits.',
            },
        ]

        for item in docs_to_seed:
            raw_bytes = item['content']
            checksum = compute_sha256(raw_bytes)
            ciphertext, iv, tag = encrypt_file(raw_bytes)

            doc = VaultDocument(
                owner=user1,
                title=item['title'],
                category=item['category'],
                original_filename=item['filename'],
                file_size_bytes=len(raw_bytes),
                file_type=item['file_type'],
                is_starred=item['is_starred'],
                checksum_sha256=checksum,
                encryption_iv=iv,
                encryption_tag=tag,
                issuing_authority=item['issuing_authority'],
                academic_year=item['academic_year'],
                description=item['description'],
            )
            doc.file.save(f"enc_{item['filename']}", ContentFile(ciphertext), save=True)
            print(f"  + Seeded Document: {doc.title} (Encrypted with AES-256-GCM)")

        # Create initial activity logs
        ActivityLog.objects.create(
            user=user1,
            action='USER_LOGIN',
            details='Student 2023-01894-MN signed in with Argon2 verification',
            ip_address='127.0.0.1',
            client_device='Chrome 128 / Windows',
            status='SUCCESS',
        )
        ActivityLog.objects.create(
            user=user1,
            action='DOCUMENT_UPLOAD',
            details='Uploaded and encrypted with AES-256 (2.4 MB)',
            document_title='Official Transcript of Records (OTR) - 3rd Year',
            category='Transcripts',
            ip_address='127.0.0.1',
            client_device='Chrome 128 / Windows',
            status='SUCCESS',
        )
        print("Initial activity logs created.")

    print("--- Seeding Completed Successfully ---")

if __name__ == '__main__':
    seed()
