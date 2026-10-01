# VaultHub — Cryptographic Security & Cloud SQL Manual Testing Guide
**Project Name:** VaultHub (Academic Student Cryptographic Document Storage)  
**Target Environment:** React 19 + TypeScript + Node.js Express + Google Cloud SQL (PostgreSQL 18.6)  
**Security Standards:** NIST SP 800-38D (AES-256-GCM), FIPS 180-4 (SHA-256), NIST SP 800-132 (PBKDF2)  
**Document Purpose:** Presentation, Instructor Evaluation, and Technical Defense Guide  

---

## 1. Google Cloud SQL Infrastructure & Database Overview

VaultHub does not use client-side mockups or fake local tables. It connects directly to an active **Google Cloud SQL relational PostgreSQL instance** running in the Google Cloud Platform (GCP).

### Cloud SQL Instance Specifications
| Parameter | Value |
| :--- | :--- |
| **GCP Project ID** | `subtle-unison-vvr20` |
| **GCP Project Number** | `38132910031` |
| **Cloud Region** | `asia-southeast1` |
| **Cloud SQL Instance ID** | `ai-studio-7f61e4e0` |
| **Database Engine** | PostgreSQL 18.6 (x86_64 Debian) |
| **Database Name** | `cloud_sql_development_database` |
| **Database App User** | `ai_studio_app_user` |
| **Tables Provisioned** | `users`, `vault_documents`, `activity_logs` |

---

## 2. How to View the Cloud SQL Database Directly

You have **two authentic methods** to show the live database to your instructor:

### Method A: Google Cloud Console (Cloud SQL Studio Web UI)
This opens Google's official cloud database management interface in your browser:
1. Open [https://console.cloud.google.com/](https://console.cloud.google.com/) and sign in with your Google account (`tormisneilmayo@gmail.com`).
2. In the top project selector dropdown, choose project: **`subtle-unison-vvr20`**.
3. In the navigation menu or search bar, search for **Cloud SQL** (or **SQL**).
4. Click on instance: **`ai-studio-7f61e4e0`**.
5. In the left menu, click **Cloud SQL Studio**.
6. Sign in:
   - **Database:** `cloud_sql_development_database`
   - **User:** `ai_studio_app_user` (or `postgres`)
7. Expand `cloud_sql_development_database` $\to$ `public` $\to$ `Tables` to view:
   - `users`
   - `vault_documents`
   - `activity_logs`
8. In the Query Editor, paste and click **Run**:
   ```sql
   SELECT id, student_id, full_name, email, password_hash, password_salt FROM users;
   ```

### Method B: Terminal CLI Database Commands (Instant & Interactive)
From your terminal root, run these built-in database commands:
* **View Stored Student Accounts & Salted PBKDF2 Hashes:**
  ```bash
  npm run db:users
  ```
* **View Encrypted Documents, Nonces (IVs), MAC Tags & Ciphertext:**
  ```bash
  npm run db:documents
  ```
* **Run Any Custom SQL Query Against Cloud SQL:**
  ```bash
  npm run db:query "SELECT id, title, file_size_bytes, checksum_sha256 FROM vault_documents;"
  ```

---

## 3. Document Encryption: AES-256-GCM (Authenticated Encryption)

### A. What Information is Encrypted vs. Plaintext?
* **Encrypted at Rest:** The **entire raw binary payload (file bytes)** of the document (`ciphertextBase64`).
  * *Why:* Contains confidential grades, personal identifying information (PII), academic honors, clearances, and registrar signatures. If the database or physical server is stolen, an adversary cannot read a single byte without the symmetric key.
* **Stored in Plaintext (Metadata):** `title`, `category`, `fileName`, `fileSizeBytes`, `fileType`, and `uploadDate`.
  * *Why:* The relational database index requires metadata in plaintext to sort, filter, paginate, and search documents without having to decrypt all files in the vault on every request.
* **Cryptographic Vectors Stored with File:**
  * **IV (Nonce):** 12 bytes (96 bits) in hex (`encryption_iv_hex`).
  * **Authentication Tag:** 16 bytes (128 bits) in hex (`encryption_tag_hex`).

---

### B. Exact File & Line of Code for Encryption
* **Source File:** `src/utils/crypto.ts`
* **Function:** `encryptDocument(plaintext: Buffer): EncryptedPayload`
* **Lines of Code (Lines 38 to 56):**

```typescript
export function encryptDocument(plaintext: Buffer): EncryptedPayload {
  // 1. Generate a 12-byte (96-bit) cryptographically random nonce
  const iv = crypto.randomBytes(12);

  // 2. Initialize AES-256-GCM cipher with master key and nonce
  const cipher = crypto.createCipheriv('aes-256-gcm', MASTER_KEY, iv);

  // 3. Encrypt file plaintext stream into binary ciphertext
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  // 4. Extract the 16-byte (128-bit) Galois MAC authentication tag
  const tag = cipher.getAuthTag();

  // 5. Compute SHA-256 hash of plaintext for integrity verification
  const checksum = computeSha256(plaintext);

  return {
    ciphertextBase64: ciphertext.toString('base64'),
    ivHex: iv.toString('hex'),
    tagHex: tag.toString('hex'),
    checksumSha256: checksum,
    fileSizeBytes: plaintext.length,
  };
}
```

#### Line-by-Line Technical Explanation:
1. `crypto.randomBytes(12)`: Generates a 96-bit random vector using the OS cryptographic entropy pool. Under GCM mode, reusing an IV with the same key breaks confidentiality; therefore, every single document gets a completely unique IV.
2. `crypto.createCipheriv('aes-256-gcm', MASTER_KEY, iv)`: Instantiates a hardware-accelerated AES cipher operating in Galois/Counter Mode with 256-bit key length.
3. `Buffer.concat([cipher.update(plaintext), cipher.final()])`: Performs block-by-block authenticated encryption.
4. `cipher.getAuthTag()`: Computes the 128-bit authentication tag using Galois field multiplication ($\text{GF}(2^{128})$). This tag guarantees that any modification to the ciphertext during storage will be detected upon decryption.
5. In `server.ts` (Lines 660–676), `encryptDocument(fileBuffer)` is called upon file upload, and the resulting `ciphertextBase64`, `encryptionIvHex`, and `encryptionTagHex` are persisted to Cloud SQL table `vault_documents`.

---

## 4. Document Decryption & Tamper Verification

### A. Exact File & Line of Code for Decryption
* **Source File:** `src/utils/crypto.ts`
* **Function:** `decryptDocument(ciphertextInput, ivHex, tagHex): Buffer`
* **Lines of Code (Lines 58 to 73):**

```typescript
export function decryptDocument(
  ciphertextInput: Buffer | string,
  ivHex: string,
  tagHex: string
): Buffer {
  const ciphertext = typeof ciphertextInput === 'string'
    ? Buffer.from(ciphertextInput, 'base64')
    : ciphertextInput;
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  // 1. Initialize AES-256-GCM decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', MASTER_KEY, iv);

  // 2. Enforce authentication tag verification
  decipher.setAuthTag(tag);

  // 3. Decrypt ciphertext and verify MAC authentication tag
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
```

#### How Decryption Works During Download:
1. In `server.ts` (Lines 813–845), when an authenticated student requests `GET /api/documents/:id/download/`:
2. Cloud SQL retrieves `ciphertext_base64`, `encryption_iv_hex`, and `encryption_tag_hex`.
3. `decryptDocument()` is executed.
4. If **any single bit** of the ciphertext or tag was tampered with in Cloud SQL, `decipher.final()` immediately throws an `Unsupported state or unable to authenticate data` error and halts with zero data leakage.
5. The server recalculates `computeSha256(plaintext)` and verifies that it exactly equals `checksum_sha256`.
6. The clean decrypted file is streamed to the browser with headers:
   - `Content-Disposition: attachment; filename="..."`
   - `X-Checksum-SHA256: <64-char-hex>`
   - `X-Encryption-Method: AES-256-GCM`

---

## 5. Cryptographic Hashing: Document Integrity & User Passwords

Hashing is a **one-way, irreversible mathematical function**. VaultHub implements two distinct hashing mechanisms:

### Mechanism 1: Document Integrity Fingerprinting (SHA-256)
* **What is hashed:** The raw plaintext bytes of the uploaded file.
* **Source File:** `src/utils/crypto.ts` (Lines 20 to 24)
* **Lines of Code:**
  ```typescript
  export function computeSha256(data: Buffer | string): string {
    const buf = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
    return crypto.createHash('sha256').update(buf).digest('hex');
  }
  ```
* **Where Stored in Database:** Column `checksum_sha256` in table `vault_documents`.
* **How to Inspect:**
  Run `npm run db:documents` $\to$ examine the `sha256_hash` column.

---

### Mechanism 2: Salted User Password Hashing (PBKDF2-SHA256)
* **What is hashed:** The student's login password combined with a 128-bit random salt.
* **Why PBKDF2:** Plaintext passwords must never be stored. PBKDF2 applies 100,000 iterations of SHA-256 to drastically increase brute-force and dictionary attack costs.
* **Source File:** `src/utils/crypto.ts` (Lines 78 to 106)
* **Lines of Code:**
  ```typescript
  export function hashPassword(password: string, saltHex?: string): HashedPasswordResult {
    // 16-byte (128-bit) cryptographically random salt per user
    const salt = saltHex ? Buffer.from(saltHex, 'hex') : crypto.randomBytes(16);
    
    // PBKDF2 with 100,000 iterations of SHA-256 producing a 256-bit key
    const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

    return {
      hashHex: derivedKey.toString('hex'),
      saltHex: salt.toString('hex'),
    };
  }

  export function verifyPassword(password: string, storedHashHex: string, storedSaltHex: string): boolean {
    const { hashHex } = hashPassword(password, storedSaltHex);
    // Constant-time buffer comparison to prevent timing side-channel attacks
    return crypto.timingSafeEqual(Buffer.from(hashHex, 'hex'), Buffer.from(storedHashHex, 'hex'));
  }
  ```
* **Where Stored in Database:** Columns `password_hash` and `password_salt` in table `users`.
* **How to Inspect:**
  Run `npm run db:users` $\to$ examine `password_hash_sample` and `password_salt`.

---

## 6. Step-by-Step Test Execution Specification

### Test Case 1: Salted Password Authentication in Cloud SQL
* **Objective:** Verify that passwords in Cloud SQL are stored as PBKDF2 salted hashes, not plaintext.
* **Execution:**
  1. Open terminal and run:
     ```bash
     npm run db:users
     ```
  2. **Expected Result:**
     - `Neil Mayo Tormis` has a 64-character hex hash starting with `9c0904...` and a 32-character hex salt `595c04...`.
     - Plaintext passwords like `"Password123!"` are nowhere in the database.
  3. Sign in to the web app using `tormisneilmayo@gmail.com` and `Password123!`.
  4. **Expected Result:** Authentication succeeds; audit log records `USER_LOGIN (PBKDF2-SHA256 verification)`.

---

### Test Case 2: Document Upload, AES-256-GCM Encryption & Cloud SQL Storage
* **Objective:** Verify that uploaded documents are encrypted into random ciphertext before writing to PostgreSQL.
* **Execution:**
  1. In the web portal, click **Upload Document**.
  2. Select any PDF, DOCX, or text file.
  3. Enter document title (e.g. `Capstone Final Draft.pdf`), choose category `Academic Clearance`, and click **Encrypt & Store Document**.
  4. In your terminal, run:
     ```bash
     npm run db:documents
     ```
  5. **Expected Result:**
     - The document appears in Cloud SQL.
     - `nonce_iv_12b` shows a unique 24-character hex string.
     - `mac_tag_16b` shows a 32-character hex authentication tag.
     - `ciphertext_sample` shows random base64 ciphertext (e.g., `4hfx5T/iqMC...`).

---

### Test Case 3: Decryption on Download & Integrity Check
* **Objective:** Verify that downloading decrypts the file and validates the SHA-256 checksum.
* **Execution:**
  1. On the dashboard, locate `Official Transcript of Records (OTR) - 3rd Year`.
  2. Click the **Download** icon.
  3. **Expected Result:**
     - Browser downloads `TOR_3rdYear_Official_Sealed.pdf` (HTTP 200).
     - Open the downloaded file: the transcript grades, student number (`2023-01894-MN`), and text are 100% intact and readable.
     - Open browser DevTools $\to$ Network tab $\to$ click the download request $\to$ Response Headers:
       - `X-Encryption-Method: AES-256-GCM`
       - `X-Checksum-SHA256: ef76a423dc42f0d6...`

---

### Test Case 4: Live Student Profile Update in Cloud SQL
* **Objective:** Verify that profile field updates update live in Cloud SQL PostgreSQL.
* **Execution:**
  1. Click **Profile** in the web sidebar.
  2. Click the edit icon next to **Academic Year** or **Degree Program**.
  3. Change the field and click the checkmark to save.
  4. In your terminal, run:
     ```bash
     npm run db:users
     ```
  5. **Expected Result:** The updated degree program or year is immediately reflected in the Cloud SQL `users` table.

---

### Test Case 5: Tamper-Evident Security Audit Logs
* **Objective:** Verify that all user actions are permanently logged to Cloud SQL with IP addresses and cryptographic actions.
* **Execution:**
  1. In your terminal, run:
     ```bash
     npm run db:query "SELECT action, status, document_title, timestamp FROM activity_logs ORDER BY timestamp DESC LIMIT 5;"
     ```
  2. **Expected Result:**
     - Returns a live table of audit logs (`USER_LOGIN`, `DOCUMENT_UPLOAD`, `DOCUMENT_DECRYPT`) stored in Cloud SQL table `activity_logs`.
