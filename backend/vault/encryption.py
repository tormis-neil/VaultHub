"""
VaultHub Cryptography Module

Provides AES-256-GCM file encryption/decryption and SHA-256 integrity hashing.

Security design:
- SHA-256 checksum is computed on ORIGINAL plaintext before encryption
- AES-256-GCM provides both confidentiality and authenticity
- Each file gets a unique random 96-bit IV (nonce) — never reused
- The 128-bit authentication tag is stored alongside the IV for decryption
- The master encryption key is loaded from settings (environment variable)
"""

import hashlib
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from django.conf import settings


def _get_encryption_key() -> bytes:
    """
    Retrieve the 32-byte AES-256 key from Django settings.
    The key is stored as a 64-character hex string in the environment.
    """
    hex_key = settings.VAULT_ENCRYPTION_KEY
    if not hex_key or len(hex_key) != 64:
        raise ValueError(
            'VAULT_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). '
            'Generate one with: python -c "import os; print(os.urandom(32).hex())"'
        )
    return bytes.fromhex(hex_key)


def compute_sha256(data: bytes) -> str:
    """
    Compute the SHA-256 cryptographic hash of raw bytes.
    Used to generate integrity checksums of the ORIGINAL plaintext
    before encryption, enabling tamper detection on decryption.

    Args:
        data: Raw plaintext file bytes.

    Returns:
        64-character lowercase hex digest string.
    """
    return hashlib.sha256(data).hexdigest()


def encrypt_file(plaintext: bytes) -> tuple[bytes, bytes, bytes]:
    """
    Encrypt file bytes using AES-256-GCM.

    AES-GCM provides:
    - Confidentiality: ciphertext is indistinguishable from random
    - Authenticity: the auth tag ensures ciphertext hasn't been tampered with

    Args:
        plaintext: Raw file bytes to encrypt.

    Returns:
        Tuple of (ciphertext, iv, tag):
        - ciphertext: Encrypted bytes (same length as plaintext + 16 bytes tag appended by AESGCM)
        - iv: 12-byte random initialization vector (nonce)
        - tag: Extracted from the end of AESGCM output (last 16 bytes)
    """
    key = _get_encryption_key()
    aesgcm = AESGCM(key)

    # Generate a unique 96-bit (12-byte) random nonce for this file
    iv = os.urandom(12)

    # AESGCM.encrypt() returns ciphertext + tag concatenated
    ciphertext_with_tag = aesgcm.encrypt(iv, plaintext, None)

    # The tag is the last 16 bytes of the output
    ciphertext = ciphertext_with_tag[:-16]
    tag = ciphertext_with_tag[-16:]

    return ciphertext, iv, tag


def decrypt_file(ciphertext: bytes, iv: bytes, tag: bytes) -> bytes:
    """
    Decrypt file bytes using AES-256-GCM.

    Verifies the authentication tag to ensure the ciphertext
    has not been tampered with. Raises an exception if verification fails.

    Args:
        ciphertext: Encrypted file bytes (without tag).
        iv: 12-byte initialization vector used during encryption.
        tag: 16-byte authentication tag from encryption.

    Returns:
        Original plaintext file bytes.

    Raises:
        cryptography.exceptions.InvalidTag: If the ciphertext has been tampered with.
    """
    key = _get_encryption_key()
    aesgcm = AESGCM(key)

    # Reconstruct the ciphertext+tag format expected by AESGCM.decrypt()
    ciphertext_with_tag = ciphertext + tag

    plaintext = aesgcm.decrypt(iv, ciphertext_with_tag, None)
    return plaintext
