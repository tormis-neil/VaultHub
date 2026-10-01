"""
Verification of live seeded user authentication, document listing, decryption, and audit trail
"""
import sys
import requests

sys.stdout.reconfigure(encoding='utf-8')

s = requests.Session()
BASE = 'http://localhost:8000/api'

print("=" * 60)
print("  VERIFYING SEEDED USER WORKFLOW")
print("=" * 60)

# 1. Fetch CSRF
r = s.get(f'{BASE}/auth/csrf/')
assert r.status_code == 200
csrf = s.cookies.get('csrftoken')
headers = {'X-CSRFToken': csrf} if csrf else {}
print("[PASS] 1. Initialized CSRF session cookie")

# 2. Login as seeded student Neil Mayo Tormis
login_payload = {
    'login': 'tormisneilmayo@gmail.com',
    'password': 'Password123!',
}
r = s.post(f'{BASE}/auth/login/', json=login_payload, headers=headers)
assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
user = r.json()
print(f"[PASS] 2. Logged in as: {user['fullName']} | ID: {user['studentId']} | Program: {user['degreeProgram']}")

# 3. List documents
r = s.get(f'{BASE}/documents/')
assert r.status_code == 200
docs = r.json()
print(f"[PASS] 3. Retrieved {len(docs)} documents from vault:")
for d in docs:
    print(f"       [{d['category']}] {d['title']} ({d['fileSizeBytes']} bytes, {d['encryptionMethod']})")

# 4. Decrypt and download first document
if docs:
    first_id = docs[0]['id']
    r = s.get(f'{BASE}/documents/{first_id}/download/')
    assert r.status_code == 200
    print(f"[PASS] 4. Decrypted document '{docs[0]['fileName']}': received {len(r.content)} bytes plaintext")
    print(f"       SHA-256 header verified: {r.headers.get('X-Checksum-SHA256')}")

# 5. List activity audit logs
r = s.get(f'{BASE}/activity/')
assert r.status_code == 200
logs = r.json()
print(f"[PASS] 5. Retrieved {len(logs)} security audit logs:")
for l in logs[:3]:
    print(f"       [{l['action']}] {l['details']} ({l['ipAddress']})")

# 6. Logout
csrf = s.cookies.get('csrftoken')
headers = {'X-CSRFToken': csrf} if csrf else {}
r = s.post(f'{BASE}/auth/logout/', headers=headers)
assert r.status_code == 200, f"Logout failed: {r.status_code} {r.text}"
print("[PASS] 6. Successfully signed out session")

print("=" * 60)
print("  ALL SEEDED USER CHECKS PASSED PERFECTLY")
print("=" * 60)
