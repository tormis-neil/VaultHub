import crypto from 'crypto';

// =============================================================================
// Deterministic Master Key Derivation (AES-256-GCM)
// =============================================================================

const ENCRYPTION_SECRET =
  process.env.VAULT_ENCRYPTION_KEY || 'vaulthub-master-secret-key-salt-2026';

// Derives a pristine 256-bit (32-byte) symmetric key using scrypt KDF
export const MASTER_KEY = crypto.scryptSync(
  ENCRYPTION_SECRET,
  'vaulthub-fixed-salt-kdf-2026',
  32
);

// =============================================================================
// Cryptographic Hashing (SHA-256 for Document Integrity)
// =============================================================================

export function computeSha256(data: Buffer | string): string {
  const buf = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
  return crypto.createHash('sha256').update(buf).digest('hex');
}

// =============================================================================
// Authenticated Encryption & Decryption (AES-256-GCM)
// =============================================================================

export interface EncryptedPayload {
  ciphertextBase64: string;
  ivHex: string;
  tagHex: string;
  checksumSha256: string;
  fileSizeBytes: number;
}

export function encryptDocument(plaintext: Buffer): EncryptedPayload {
  // 12-byte (96-bit) cryptographically random nonce recommended for GCM
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', MASTER_KEY, iv);

  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag(); // 16-byte (128-bit) MAC authentication tag
  const checksum = computeSha256(plaintext);

  return {
    ciphertextBase64: ciphertext.toString('base64'),
    ivHex: iv.toString('hex'),
    tagHex: tag.toString('hex'),
    checksumSha256: checksum,
    fileSizeBytes: plaintext.length,
  };
}

export function decryptDocument(
  ciphertextInput: Buffer | string,
  ivHex: string,
  tagHex: string
): Buffer {
  const ciphertext =
    typeof ciphertextInput === 'string'
      ? Buffer.from(ciphertextInput, 'base64')
      : ciphertextInput;
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', MASTER_KEY, iv);
  decipher.setAuthTag(tag); // Enforces 128-bit MAC verification

  // If ciphertext or tag has been tampered with by even 1 bit, decipher.final() throws an error
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

// =============================================================================
// Password Hashing (PBKDF2-SHA256 with Unique Salt)
// =============================================================================

export interface HashedPasswordResult {
  hashHex: string;
  saltHex: string;
}

export function hashPassword(
  password: string,
  saltHex?: string
): HashedPasswordResult {
  const salt = saltHex ? Buffer.from(saltHex, 'hex') : crypto.randomBytes(16);
  // PBKDF2 with 100,000 iterations of SHA-256 (NIST standard)
  const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

  return {
    hashHex: derivedKey.toString('hex'),
    saltHex: salt.toString('hex'),
  };
}

export function verifyPassword(
  password: string,
  storedHashHex: string,
  storedSaltHex: string
): boolean {
  try {
    const { hashHex } = hashPassword(password, storedSaltHex);
    // Constant-time buffer comparison to prevent timing side-channel attacks
    return crypto.timingSafeEqual(
      Buffer.from(hashHex, 'hex'),
      Buffer.from(storedHashHex, 'hex')
    );
  } catch {
    return false;
  }
}
