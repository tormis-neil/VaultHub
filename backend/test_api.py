"""
VaultHub Phase 1 - Full API Integration Test

Tests the complete flow:
1. Register a new student (Argon2id password hashing)
2. Login with credentials (session authentication)
3. Get profile (verify user data)
4. Upload a document (SHA-256 + AES-256-GCM encryption)
5. List documents (verify document metadata)
6. Download document (decrypt + integrity check)
7. Star/unstar document (PATCH update)
8. Delete document (removal + audit log)
9. View activity logs (verify all events recorded)
10. Logout (session end)
11. Verify Argon2id hash in database
"""

import os
import sys
import hashlib
import requests

# Fix Windows console encoding
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'http://localhost:8000/api'

# Use a session to persist cookies (session auth + CSRF)
s = requests.Session()

# Track test results
passed = 0
failed = 0
total = 0

def test(name, condition, detail=''):
    global passed, failed, total
    total += 1
    if condition:
        passed += 1
        print(f'  [PASS] {name}')
    else:
        failed += 1
        print(f'  [FAIL] {name} -- {detail}')


def get_csrf():
    """Get CSRF token from cookies after first request."""
    return s.cookies.get('csrftoken', '')


import time
uid = int(time.time()) % 100000
TEST_EMAIL = f'test.student.{uid}@univ.edu'
TEST_ID = f'TST-{uid:05d}-MN'
TEST_PASS = 'SecurePass123!'

# ===========================================================================
print('\n' + '='*60)
print('  VAULTHUB PHASE 1 -- FULL API INTEGRATION TEST')
print('='*60)

# Initialize CSRF cookie
s.get(f'{BASE_URL}/auth/csrf/')

# --------------------------------------------------
# Step 1: Register a new student
# --------------------------------------------------
print('\n[STEP 1] Register new student')
resp = s.post(f'{BASE_URL}/auth/register/', json={
    'firstName': 'Test',
    'lastName': 'Student',
    'email': TEST_EMAIL,
    'password': TEST_PASS,
    'studentId': TEST_ID,
    'degreeProgram': 'BS Information Technology',
    'academicYear': '4th Year - Senior',
}, headers={'X-CSRFToken': get_csrf()})

test('Register returns 201', resp.status_code == 201, f'Got {resp.status_code}: {resp.text[:200]}')

if resp.status_code == 201:
    user_data = resp.json()
    test('Response has studentId', user_data.get('studentId') == TEST_ID)
    test('Response has fullName', user_data.get('fullName') == 'Test Student')
    test('Response has email', user_data.get('email') == TEST_EMAIL)
    test('Response has degreeProgram', user_data.get('degreeProgram') == 'BS Information Technology')
    test('Response has storageQuotaBytes (500MB)', user_data.get('storageQuotaBytes') == 500 * 1024 * 1024)
    test('Response has avatarInitials', user_data.get('avatarInitials') == 'TS')

# --------------------------------------------------
# Step 2: Logout, then Login with credentials
# --------------------------------------------------
print('\n[STEP 2] Logout then Login')
s.post(f'{BASE_URL}/auth/logout/', headers={'X-CSRFToken': get_csrf()})

resp = s.post(f'{BASE_URL}/auth/login/', json={
    'emailOrStudentId': TEST_EMAIL,
    'password': TEST_PASS,
}, headers={'X-CSRFToken': get_csrf()})

test('Login returns 200', resp.status_code == 200, f'Got {resp.status_code}: {resp.text[:200]}')
if resp.status_code == 200:
    test('Login returns user data', resp.json().get('studentId') == TEST_ID)

# Also test login by student ID
s.post(f'{BASE_URL}/auth/logout/', headers={'X-CSRFToken': get_csrf()})
resp2 = s.post(f'{BASE_URL}/auth/login/', json={
    'emailOrStudentId': TEST_ID,
    'password': TEST_PASS,
}, headers={'X-CSRFToken': get_csrf()})
test('Login by student ID works', resp2.status_code == 200, f'Got {resp2.status_code}')

# --------------------------------------------------
# Step 3: Get profile
# --------------------------------------------------
print('\n[STEP 3] Get profile')
resp = s.get(f'{BASE_URL}/auth/me/')
test('Profile GET returns 200', resp.status_code == 200, f'Got {resp.status_code}')
if resp.status_code == 200:
    profile = resp.json()
    test('Profile has correct fields', all(k in profile for k in ['id', 'studentId', 'fullName', 'email', 'degreeProgram', 'academicYear', 'storageQuotaBytes', 'avatarInitials']))

# --------------------------------------------------
# Step 4: Upload a document
# --------------------------------------------------
print('\n[STEP 4] Upload document (SHA-256 + AES-256-GCM)')

# Create a test file in memory
test_content = b'OFFICIAL TRANSCRIPT OF RECORDS\nSTUDENT: Neil Mayo Tormis\nGPA: 1.22\nStatus: Good Standing'
expected_sha256 = hashlib.sha256(test_content).hexdigest()

# Write temp file
with open('_test_upload.pdf', 'wb') as f:
    f.write(test_content)

with open('_test_upload.pdf', 'rb') as f:
    resp = s.post(f'{BASE_URL}/documents/', data={
        'title': 'Official Transcript of Records (OTR)',
        'category': 'Transcripts',
        'issuingAuthority': 'Office of the University Registrar',
        'academicYear': 'A.Y. 2025-2026',
        'description': 'Test upload for integration testing',
        'isStarred': 'true',
    }, files={
        'file': ('TOR_3rdYear.pdf', f, 'application/pdf'),
    }, headers={'X-CSRFToken': get_csrf()})

test('Upload returns 201', resp.status_code == 201, f'Got {resp.status_code}: {resp.text[:300]}')

doc_id = None
if resp.status_code == 201:
    doc = resp.json()
    doc_id = doc.get('id')
    test('Document has id', doc_id is not None)
    test('Title matches', doc.get('title') == 'Official Transcript of Records (OTR)')
    test('Category matches', doc.get('category') == 'Transcripts')
    test('fileName matches', doc.get('fileName') == 'TOR_3rdYear.pdf')
    test('fileSizeBytes matches original', doc.get('fileSizeBytes') == len(test_content))
    test('encryptionMethod is AES-256-GCM', doc.get('encryptionMethod') == 'AES-256-GCM')
    test('checksumSHA256 is real (not mock)', doc.get('checksumSHA256') == expected_sha256)
    test('isStarred is True', doc.get('isStarred') == True)
    test('status is Encrypted', doc.get('status') == 'Encrypted')
    print(f'    SHA-256: {doc.get("checksumSHA256")}')

os.remove('_test_upload.pdf')

# --------------------------------------------------
# Step 5: List documents
# --------------------------------------------------
print('\n[STEP 5] List documents')
resp = s.get(f'{BASE_URL}/documents/')
test('List returns 200', resp.status_code == 200)
if resp.status_code == 200:
    docs = resp.json()
    test('Has 1 document', len(docs) == 1)
    test('Document matches upload', docs[0].get('title') == 'Official Transcript of Records (OTR)')

# --------------------------------------------------
# Step 6: Download document (decrypt + integrity check)
# --------------------------------------------------
print('\n[STEP 6] Download/decrypt document')
if doc_id:
    resp = s.get(f'{BASE_URL}/documents/{doc_id}/download/')
    test('Download returns 200', resp.status_code == 200, f'Got {resp.status_code}: {resp.text[:200]}')
    if resp.status_code == 200:
        downloaded_bytes = resp.content
        test('Decrypted content matches original', downloaded_bytes == test_content)
        test('Content-Disposition has filename', 'TOR_3rdYear.pdf' in resp.headers.get('Content-Disposition', ''))
        # Verify SHA-256 of downloaded content matches
        download_sha = hashlib.sha256(downloaded_bytes).hexdigest()
        test('SHA-256 integrity verified after decrypt', download_sha == expected_sha256)
        print(f'    Downloaded {len(downloaded_bytes)} bytes, SHA-256 verified')

# --------------------------------------------------
# Step 7: Star/unstar document (PATCH)
# --------------------------------------------------
print('\n[STEP 7] Toggle star')
if doc_id:
    resp = s.patch(f'{BASE_URL}/documents/{doc_id}/', json={
        'isStarred': False,
    }, headers={'X-CSRFToken': get_csrf()})
    test('PATCH returns 200', resp.status_code == 200, f'Got {resp.status_code}')
    if resp.status_code == 200:
        test('isStarred now False', resp.json().get('isStarred') == False)

    # Star it back
    resp = s.patch(f'{BASE_URL}/documents/{doc_id}/', json={
        'isStarred': True,
    }, headers={'X-CSRFToken': get_csrf()})
    test('Re-star returns 200', resp.status_code == 200)

# --------------------------------------------------
# Step 8: Activity logs
# --------------------------------------------------
print('\n[STEP 8] Activity logs')
resp = s.get(f'{BASE_URL}/activity/')
test('Activity list returns 200', resp.status_code == 200)
if resp.status_code == 200:
    logs = resp.json()
    test('Has multiple log entries', len(logs) >= 3)
    actions = [l.get('action') for l in logs]
    test('Contains USER_LOGIN', 'USER_LOGIN' in actions)
    test('Contains DOCUMENT_UPLOAD', 'DOCUMENT_UPLOAD' in actions)
    test('Contains DOCUMENT_DOWNLOAD', 'DOCUMENT_DOWNLOAD' in actions)
    test('Logs have ipAddress', all(l.get('ipAddress') for l in logs))
    test('Logs have clientDevice', all(l.get('clientDevice') for l in logs))
    print(f'    Total log entries: {len(logs)}')
    for log in logs[:5]:
        print(f'    [{log.get("action")}] {log.get("details", "")[:60]}')

# --------------------------------------------------
# Step 9: Delete document
# --------------------------------------------------
print('\n[STEP 9] Delete document')
if doc_id:
    resp = s.delete(f'{BASE_URL}/documents/{doc_id}/', headers={'X-CSRFToken': get_csrf()})
    test('Delete returns 204', resp.status_code == 204, f'Got {resp.status_code}')

    # Verify it's gone
    resp = s.get(f'{BASE_URL}/documents/')
    test('Documents list now empty', len(resp.json()) == 0)

    # Check delete was logged
    resp = s.get(f'{BASE_URL}/activity/')
    actions = [l.get('action') for l in resp.json()]
    test('DOCUMENT_DELETE in activity logs', 'DOCUMENT_DELETE' in actions)

# --------------------------------------------------
# Step 10: Logout
# --------------------------------------------------
print('\n[STEP 10] Logout')
resp = s.post(f'{BASE_URL}/auth/logout/', headers={'X-CSRFToken': get_csrf()})
test('Logout returns 200', resp.status_code == 200)

# Verify session is dead
resp = s.get(f'{BASE_URL}/auth/me/')
test('Profile blocked after logout (401/403)', resp.status_code in [401, 403])

# --------------------------------------------------
# Verify Argon2id hashing in database
# --------------------------------------------------
print('\n[STEP 11] Verify Argon2id password hashing')
import django
os.environ['DJANGO_SETTINGS_MODULE'] = 'vaulthub_config.settings'
django.setup()
from vault.models import StudentUser
user = StudentUser.objects.get(student_id=TEST_ID)
test('Password uses argon2 hasher', user.password.startswith('argon2'))
print(f'    Hash prefix: {user.password[:30]}...')


# ===========================================================================
print('\n' + '='*60)
print(f'  RESULTS: {passed}/{total} passed, {failed} failed')
print('='*60 + '\n')

# Cleanup: delete the test user
user.delete()

sys.exit(0 if failed == 0 else 1)
