"""
VaultHub Step 6 Verification Script
Tests that backend responses match the frontend TypeScript types in src/types.ts
and the expected signatures in src/api/*.ts
"""

import sys
import requests

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'http://localhost:8000/api'
s = requests.Session()

passed = 0
failed = 0

def test(name, condition, detail=''):
    global passed, failed
    if condition:
        passed += 1
        print(f"  [PASS] {name}")
    else:
        failed += 1
        print(f"  [FAIL] {name} -- {detail}")

print("\n" + "="*60)
print("  STEP 6 CONTRACT VALIDATION -- FRONTEND API MATCHING")
print("="*60)

# 1. CSRF Cookie initialization (src/api/client.ts: ensureCsrfToken)
print("\n[TEST 1] CSRF Cookie Endpoint (src/api/client.ts)")
r = s.get(f"{BASE_URL}/auth/csrf/")
test("GET /auth/csrf/ returns 200", r.status_code == 200)
csrf_cookie = s.cookies.get("csrftoken")
test("csrftoken cookie is present in session", bool(csrf_cookie), f"cookie={csrf_cookie}")

headers = {'X-CSRFToken': csrf_cookie} if csrf_cookie else {}

# 2. Register Student (src/api/auth.ts: authApi.register)
print("\n[TEST 2] Register Contract (src/api/auth.ts: RegisterPayload -> StudentUser)")
import time
uid = int(time.time()) % 100000
reg_payload = {
    "firstName": "Frontend",
    "lastName": "Tester",
    "email": f"frontend.tester.{uid}@univ.edu",
    "password": "SecurePassword123!",
    "studentId": f"FE-{uid:05d}-MN",
    "degreeProgram": "BS Computer Science",
    "academicYear": "3rd Year",
}
r = s.post(f"{BASE_URL}/auth/register/", json=reg_payload, headers=headers)
test("Registration returns 201", r.status_code == 201, f"status={r.status_code}, text={r.text}")
user = r.json() if r.status_code == 201 else {}

# Verify StudentUser TypeScript interface properties
expected_user_keys = {'id', 'studentId', 'fullName', 'email', 'degreeProgram', 'academicYear', 'storageQuotaBytes', 'avatarInitials'}
test("User response has all StudentUser keys", expected_user_keys.issubset(user.keys()), f"keys={list(user.keys())}")
test("fullName is computed correctly", user.get('fullName') == 'Frontend Tester')
test("avatarInitials matches", user.get('avatarInitials') == 'FT')
test("storageQuotaBytes is integer (500MB)", isinstance(user.get('storageQuotaBytes'), int) and user.get('storageQuotaBytes') > 0)

# 3. Profile Endpoint (src/api/auth.ts: authApi.getProfile)
print("\n[TEST 3] Get Profile Contract (src/api/auth.ts: getProfile -> StudentUser)")
r = s.get(f"{BASE_URL}/auth/me/")
test("GET /auth/me/ returns 200", r.status_code == 200)
test("Profile matches registered studentId", r.json().get('studentId') == reg_payload['studentId'])

# 4. Upload Document (src/api/documents.ts: documentsApi.uploadDocument)
print("\n[TEST 4] Upload Document Contract (src/api/documents.ts: DocumentUploadParams -> VaultDocument)")
csrf_cookie = s.cookies.get("csrftoken")
headers = {'X-CSRFToken': csrf_cookie} if csrf_cookie else {}

file_content = b"%PDF-1.4 Mock Official Transcript Content with AES-256 integrity check"
files = {'file': ('official_transcript.pdf', file_content, 'application/pdf')}
data = {
    'title': 'Official University Transcript',
    'category': 'Transcripts',
    'issuingAuthority': 'Office of the University Registrar',
    'academicYear': 'A.Y. 2025-2026',
    'description': 'Certified true copy for board exam verification',
    'isStarred': 'true',
}
r = s.post(f"{BASE_URL}/documents/", files=files, data=data, headers=headers)
test("Upload returns 201", r.status_code == 201, f"status={r.status_code}, text={r.text}")
doc = r.json() if r.status_code == 201 else {}

# Verify VaultDocument TypeScript interface properties
expected_doc_keys = {
    'id', 'title', 'category', 'fileName', 'fileSizeBytes', 'fileType',
    'uploadDate', 'lastAccessedDate', 'isStarred', 'encryptionMethod',
    'checksumSHA256', 'issuingAuthority', 'academicYear', 'status', 'description'
}
test("Document response has all VaultDocument keys", expected_doc_keys.issubset(doc.keys()), f"keys={list(doc.keys())}")
test("encryptionMethod is AES-256-GCM", doc.get('encryptionMethod') == 'AES-256-GCM')
test("checksumSHA256 is 64-char hex", len(doc.get('checksumSHA256', '')) == 64)
test("status is Encrypted", doc.get('status') == 'Encrypted')
test("fileSizeBytes matches plaintext", doc.get('fileSizeBytes') == len(file_content))

doc_id = doc.get('id')

# 5. List Documents (src/api/documents.ts: documentsApi.getDocuments)
print("\n[TEST 5] List Documents Contract (src/api/documents.ts: getDocuments -> VaultDocument[])")
r = s.get(f"{BASE_URL}/documents/")
test("GET /documents/ returns 200", r.status_code == 200)
docs_list = r.json() if r.status_code == 200 else []
test("Returns array with uploaded document", isinstance(docs_list, list) and len(docs_list) >= 1)

# 6. Update Document (src/api/documents.ts: documentsApi.updateDocument)
print("\n[TEST 6] Update Document Contract (src/api/documents.ts: updateDocument -> VaultDocument)")
r = s.patch(f"{BASE_URL}/documents/{doc_id}/", json={'isStarred': False}, headers=headers)
test("PATCH /documents/<id>/ returns 200", r.status_code == 200)
test("isStarred successfully toggled to False", r.json().get('isStarred') is False)

# 7. Download Document (src/api/documents.ts: documentsApi.downloadDocument)
print("\n[TEST 7] Download Document Contract (src/api/documents.ts: downloadDocument -> Blob)")
r = s.get(f"{BASE_URL}/documents/{doc_id}/download/")
test("Download returns 200", r.status_code == 200)
test("Decrypted content matches original bytes", r.content == file_content)
disp = r.headers.get('Content-Disposition', '')
test("Content-Disposition contains original filename", 'official_transcript.pdf' in disp, f"header={disp}")
test("X-Checksum-SHA256 header matches document checksum", r.headers.get('X-Checksum-SHA256') == doc.get('checksumSHA256'))

# 8. Activity Logs (src/api/activity.ts: activityApi.getActivityLogs)
print("\n[TEST 8] Activity Logs Contract (src/api/activity.ts: getActivityLogs -> ActivityLog[])")
r = s.get(f"{BASE_URL}/activity/")
test("GET /activity/ returns 200", r.status_code == 200)
logs = r.json() if r.status_code == 200 else []
expected_log_keys = {'id', 'timestamp', 'action', 'details', 'documentTitle', 'category', 'ipAddress', 'clientDevice', 'status'}
test("Returns array of ActivityLog items", isinstance(logs, list) and len(logs) > 0)
if logs:
    test("Log item has all ActivityLog keys", expected_log_keys.issubset(logs[0].keys()), f"keys={list(logs[0].keys())}")

# 9. Clean up document (src/api/documents.ts: documentsApi.deleteDocument)
print("\n[TEST 9] Delete Document Contract (src/api/documents.ts: deleteDocument)")
r = s.delete(f"{BASE_URL}/documents/{doc_id}/", headers=headers)
test("DELETE /documents/<id>/ returns 204", r.status_code == 204)

# 10. Logout (src/api/auth.ts: authApi.logout)
print("\n[TEST 10] Logout Contract (src/api/auth.ts: logout)")
r = s.post(f"{BASE_URL}/auth/logout/", headers=headers)
test("POST /auth/logout/ returns 200", r.status_code == 200)

print("\n" + "="*60)
print(f"  STEP 6 RESULTS: {passed} passed, {failed} failed")
print("="*60)
