 # VaultHub — Manual Testing Guide & Test Execution Specification
**Document Version:** 1.0.0  
**Phase:** Phase 1 — Security and Document Management Implementation  
**Standard:** IEEE 829 / ISTQB Compliant Test Case Format  
**Target Environment:** Local Development (Frontend: React 19 + Vite @ port 3000 | Backend: Django REST Framework @ port 8000 | Database: MySQL)

---

## 1. Quick Start: How to Run the Website

To run the complete VaultHub system on your machine, you need **two terminal windows**: one for the **Django Backend** and one for the **React Frontend**.

### Prerequisites Check
- **Python:** 3.10+ (Verified: Python 3.13 installed)
- **Node.js:** v18.0+ or v20.0+ LTS with `npm` (Required for running the React frontend)
  - *If Node.js is not yet installed:* Open PowerShell as Administrator and run:
    ```powershell
    winget install OpenJS.NodeJS.LTS
    ```
    *Or download directly from [nodejs.org](https://nodejs.org).* Once installed, restart your terminal.

---

### Step A: Start the Backend (Terminal 1)

1. Open your terminal in the project directory:
   ```powershell
   cd "c:\software projects\vaulthub\backend"
   ```
2. Activate your Python environment (if using a virtualenv) and ensure dependencies are installed:
   ```powershell
   pip install -r requirements.txt
   ```
3. Run database migrations:
   ```powershell
   python manage.py migrate
   ```
4. Seed demo users and initial documents (optional, if fresh database):
   ```powershell
   python seed_demo.py
   ```
5. Start the Django API server on port 8000:
   ```powershell
   python manage.py runserver 8000
   ```
   > **Status Check:** Backend will be listening at `http://127.0.0.1:8000/`. You can open `http://127.0.0.1:8000/api/auth/csrf/` in your browser to verify it responds with `{"status":"ok","csrftoken":"..."}`.

---

### Step B: Start the Frontend (Terminal 2)

1. Open a second terminal in the project root:
   ```powershell
   cd "c:\software projects\vaulthub"
   ```
2. Install frontend dependencies (first time only):
   ```powershell
   npm install
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
4. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 2. Seeded Test Credentials

The database contains pre-configured test student accounts for immediate testing:

| User Role / Name | Student ID | Email / Username | Password | Enrolled Program |
| :--- | :--- | :--- | :--- | :--- |
| **Neil Mayo Tormis** (Primary Senior) | `2023-01894-MN` | `tormisneilmayo@gmail.com` | `Password123!` | BS Information Technology |
| **Sophia Elena Rivera** (Junior) | `2024-00431-CS` | `sophia.rivera@univ.edu` | `Password123!` | BS Computer Science |

---

## 3. Test Execution Matrix

### Module 1: Authentication & Credential Security (Argon2id)

#### TC-AUTH-01: Successful Login with Email & Argon2id Verification
- **Objective:** Verify a student can log in using their registered email and password.
- **Preconditions:** Django server running at port 8000; frontend at port 3000.
- **Steps:**
  1. Navigate to `http://localhost:3000`.
  2. In the Login form, enter `tormisneilmayo@gmail.com`.
  3. Enter password `Password123!`.
  4. Click **Sign In to Vault**.
- **Expected Result:**
  - Login succeeds without errors.
  - User is redirected to the main Vault dashboard.
  - Top header displays "Neil Mayo Tormis" with badge "2023-01894-MN".
  - Toast message appears: "Welcome back, Neil Mayo Tormis!".
  - Session cookie `sessionid` and `csrftoken` are stored in browser storage.

#### TC-AUTH-02: Successful Login with Student ID Number
- **Objective:** Verify students can authenticate using their institutional Student ID instead of email.
- **Steps:**
  1. Sign out if logged in.
  2. In the Login form, enter `2023-01894-MN`.
  3. Enter password `Password123!`.
  4. Click **Sign In to Vault**.
- **Expected Result:**
  - Login succeeds. Dashboard displays student's documents and storage quota.

#### TC-AUTH-03: Login Rejection with Incorrect Password
- **Objective:** Verify brute-force/invalid authentication attempts are rejected.
- **Steps:**
  1. On the login screen, enter `tormisneilmayo@gmail.com`.
  2. Enter incorrect password `WrongPassword999!`.
  3. Click **Sign In to Vault**.
- **Expected Result:**
  - Login is denied (HTTP 400 Bad Request).
  - An alert message displays: *"Invalid credentials. Please check your email/ID and password."*
  - User remains unauthenticated on the login page.

#### TC-AUTH-04: New Student Registration & Quota Provisioning
- **Objective:** Verify that registering a new account provisions a 500 MB quota and hashes the password with Argon2id.
- **Steps:**
  1. On the login screen, click **Create Account**.
  2. Fill in:
     - **First Name:** `Juan`
     - **Last Name:** `Dela Cruz`
     - **Student ID:** `2025-99881-IT`
     - **Degree Program:** `BS Information Technology`
     - **Academic Year:** `1st Year - Freshman`
     - **Email:** `juan.delacruz@univ.edu`
     - **Password:** `StudentPass2026!`
  3. Click **Register Account**.
- **Expected Result:**
  - Registration completes (HTTP 201 Created).
  - User is immediately signed in as "Juan Dela Cruz".
  - Storage Gauge displays `0 B used of 500 MB (0%)`.
  - Document vault is empty with prompt to upload first file.
  - Avatar initials display `JD`.

#### TC-AUTH-05: Secure Session Logout & Cache Clearance
- **Objective:** Ensure session termination clears client state and invalidates Django session.
- **Steps:**
  1. From the dashboard, click the student profile avatar in the top right.
  2. Click **Sign Out**.
- **Expected Result:**
  - User is redirected back to `AuthPage`.
  - Client state documents and logs are wiped from memory.
  - Browser network tab confirms `POST /api/auth/logout/` returned 200.
  - Refreshing the page does NOT automatically log the user back in.

---

### Module 2: Document Management & AES-256-GCM Cryptography

#### TC-DOC-01: Document Upload with SHA-256 Integrity & AES-256-GCM Encryption
- **Objective:** Verify an uploaded academic file is checksummed and encrypted at rest.
- **Preconditions:** Logged in as Neil Mayo Tormis.
- **Steps:**
  1. Click the **+ Upload Document** button in the header or sidebar.
  2. Select any local test file (e.g., a PDF, PNG, or TXT file).
  3. Provide metadata:
     - **Document Title:** `Capstone Project Proposal Draft`
     - **Category:** `Transcripts` (or `Certificates`, `Resumes`, `Identification Cards`, `Clearances`)
     - **Issuing Authority:** `College of Computer Studies`
     - **Academic Year:** `AY 2025-2026`
     - Check **Mark as starred / important**.
  4. Click **Encrypt & Save to Vault**.
- **Expected Result:**
  - Upload completes successfully (HTTP 201 Created).
  - Toast displays: *"Capstone Project Proposal Draft encrypted & stored in your vault."*
  - Document appears at the top of the Document List with:
    - Status badge: `Encrypted`
    - Encryption method: `AES-256-GCM`
    - Gold star icon enabled.
  - Storage gauge increases by the exact file size.

#### TC-DOC-02: Verification of Encrypted Bytes on Disk (Ciphertext at Rest)
- **Objective:** Verify that the stored file in the filesystem is NOT readable plaintext.
- **Steps:**
  1. In Windows Explorer or PowerShell, navigate to:
     `c:\software projects\vaulthub\backend\media\vault_files\`
  2. Open the most recently created file in a text editor (e.g., Notepad).
- **Expected Result:**
  - The file contents are binary gibberish/ciphertext.
  - Plaintext text from the original file cannot be found.
  - Proves AES-256-GCM encryption at rest is strictly active.

#### TC-DOC-03: Cryptographic Integrity Verification (SHA-256 Checksum)
- **Objective:** Ensure the SHA-256 checksum displayed in the UI matches the original unencrypted file.
- **Steps:**
  1. On the newly uploaded file, click the **Preview / Details (eye icon)**.
  2. Inspect the **Security Details** section in the modal.
- **Expected Result:**
  - **Algorithm:** AES-256-GCM.
  - **SHA-256 Hash:** 64-character hexadecimal checksum is displayed.
  - Running `Get-FileHash -Algorithm SHA256 <original_file>` in PowerShell matches this exact hash.

#### TC-DOC-04: Document Decryption & Secure Plaintext Download
- **Objective:** Verify that authorized download streams decrypted plaintext with matching hash.
- **Steps:**
  1. Click the **Download (arrow-down icon)** on the uploaded document.
  2. Save the file to your computer.
  3. Open the downloaded file.
- **Expected Result:**
  - File opens cleanly and is 100% identical to the original unencrypted file.
  - Network inspect confirms headers:
    - `Content-Disposition: attachment; filename="..."`
    - `X-Checksum-SHA256: <original_hash>`
    - `X-Encryption-Method: AES-256-GCM`
  - A toast displays: *"Decrypted and downloaded [filename]"*.

#### TC-DOC-05: Toggle Starred / Important Tag
- **Objective:** Verify documents can be dynamically flagged and filtered.
- **Steps:**
  1. In the document list, click the Star icon on any document to unstar it.
  2. Click the sidebar filter **Starred Documents**.
- **Expected Result:**
  - Star icon immediately reflects toggled state (filled gold vs outline).
  - Starred Documents view only lists documents where `isStarred == true`.
  - Reloading the page retains the updated star state (persisted via `PATCH /api/documents/<id>/`).

#### TC-DOC-06: Document Deletion & Immediate Quota Reclaim
- **Objective:** Verify deleting a document purges ciphertext and restores storage quota.
- **Steps:**
  1. Note your current storage consumed (e.g., `2.4 MB`).
  2. Click the **Delete (trash icon)** on a document.
  3. In the confirmation dialog, click **Permanently Delete**.
- **Expected Result:**
  - Confirmation modal closes.
  - Document is removed from the vault table.
  - Storage gauge drops immediately by the deleted document's size.
  - File is deleted from disk in `media/vault_files/`.

---

### Module 3: Security Audit Trail & Accountability

#### TC-AUD-01: Audit Log Generation for Security Events
- **Objective:** Verify every sensitive action creates an immutable audit record.
- **Steps:**
  1. In the sidebar, click **Security Logs** (or Audit Trail).
  2. Inspect the latest log entries.
- **Expected Result:**
  - All recent actions appear with accurate timestamps and details:
    - `[USER_LOGIN]` — Student signed in with Argon2 verification.
    - `[DOCUMENT_UPLOAD]` — Uploaded and encrypted with AES-256 (with file size).
    - `[DOCUMENT_DOWNLOAD]` — Decrypted and downloaded by student.
    - `[DOCUMENT_DELETE]` — Deleted document from vault.
    - `[USER_LOGOUT]` — Signed out session.
  - Each log displays the client IP address (`127.0.0.1` locally) and user agent/device.

---

### Module 4: Access Control & Data Isolation

#### TC-SEC-01: Data Isolation Between Different Students
- **Objective:** Verify Student A cannot see, access, or download Student B's documents.
- **Steps:**
  1. Log in as Neil (`tormisneilmayo@gmail.com`) and note the document list.
  2. Log out.
  3. Log in as Sophia (`sophia.rivera@univ.edu`, password: `Password123!`).
- **Expected Result:**
  - Sophia's vault only displays Sophia's documents.
  - None of Neil's documents or audit log entries appear in Sophia's dashboard.
  - Direct HTTP `GET /api/documents/<neils_doc_id>/` returns `404 Not Found`.

#### TC-SEC-02: Unauthorized API Access Protection
- **Objective:** Verify protected endpoints reject unauthenticated requests.
- **Steps:**
  1. Open a private / incognito browser window.
  2. Directly open: `http://127.0.0.1:8000/api/documents/`.
- **Expected Result:**
  - Server returns `403 Forbidden` or `401 Unauthorized` with:
    `{"detail":"Authentication credentials were not provided."}`.

---

## 4. Manual Test Execution Sign-off Sheet

| Test Case ID | Test Case Title | Tester Name | Date Executed | Status (PASS/FAIL) | Notes / Observations |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Login with Email (Argon2id) | | | | |
| **TC-AUTH-02** | Login with Student ID | | | | |
| **TC-AUTH-03** | Login Rejection (Bad Password) | | | | |
| **TC-AUTH-04** | Student Registration & Quota | | | | |
| **TC-AUTH-05** | Secure Session Logout | | | | |
| **TC-DOC-01** | Upload with AES-256-GCM | | | | |
| **TC-DOC-02** | Ciphertext Verification on Disk | | | | |
| **TC-DOC-03** | SHA-256 Checksum Validation | | | | |
| **TC-DOC-04** | Decryption & Plaintext Download | | | | |
| **TC-DOC-05** | Star / Important Toggle | | | | |
| **TC-DOC-06** | Deletion & Quota Reclaim | | | | |
| **TC-AUD-01** | Security Audit Trail Entries | | | | |
| **TC-SEC-01** | Student Data Isolation | | | | |
| **TC-SEC-02** | Unauthenticated Access Block | | | | |

---

## 5. Automated Test Verification Summary

To execute the automated regression test suite alongside manual testing, run these commands in the terminal:

```powershell
# 1. Frontend-Backend Contract Integration Tests (28 tests)
python backend/test_frontend_contracts.py

# 2. Comprehensive Security, Cryptography & Auth API Tests (45 tests)
python backend/test_api.py

# 3. Seeded Demo User End-to-End Workflow Verification
python backend/test_seeded_flow.py
```
**Current Automated Test Score:** **73 / 73 PASS (100%)**
