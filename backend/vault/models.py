"""
VaultHub Data Models

Three core models for Phase 1:
- StudentUser: Custom user extending AbstractUser with academic fields
- VaultDocument: Encrypted document storage with integrity checksums
- ActivityLog: Security audit trail for accountability & non-repudiation
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


class StudentUser(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.
    Adds student-specific fields: student_id, degree_program,
    academic_year, storage_quota_bytes, and avatar_initials.
    Password hashing is handled by Django using Argon2id (configured in settings.py).
    """
    student_id = models.CharField(
        max_length=30,
        unique=True,
        help_text='University student ID number (e.g. 2023-01894-MN)'
    )
    degree_program = models.CharField(
        max_length=100,
        help_text='e.g. BS Information Technology'
    )
    academic_year = models.CharField(
        max_length=50,
        help_text='e.g. 4th Year - Senior'
    )
    storage_quota_bytes = models.BigIntegerField(
        default=500 * 1024 * 1024,  # 500 MB standard academic quota
        help_text='Storage quota in bytes (default 500 MB)'
    )
    avatar_initials = models.CharField(
        max_length=4,
        blank=True,
        help_text='2-letter initials for avatar display'
    )

    class Meta:
        db_table = 'vault_student_user'
        verbose_name = 'Student User'
        verbose_name_plural = 'Student Users'

    def __str__(self):
        return f'{self.get_full_name()} ({self.student_id})'

    def save(self, *args, **kwargs):
        """Auto-generate avatar initials from first and last name if not set."""
        if not self.avatar_initials and self.first_name and self.last_name:
            self.avatar_initials = (self.first_name[0] + self.last_name[0]).upper()
        super().save(*args, **kwargs)


# Predefined document categories matching the frontend types.ts
CATEGORY_CHOICES = [
    ('Transcripts', 'Transcripts'),
    ('Certificates', 'Certificates'),
    ('Resumes', 'Resumes'),
    ('Identification Cards', 'Identification Cards'),
    ('Clearances', 'Clearances'),
]


class VaultDocument(models.Model):
    """
    Represents an encrypted document stored in the vault.

    Security workflow:
    1. On upload: SHA-256 checksum is computed on the ORIGINAL plaintext bytes
    2. Plaintext is encrypted with AES-256-GCM → ciphertext + IV + auth tag
    3. Only ciphertext is written to disk (media/vault_files/)
    4. On download: ciphertext is decrypted and streamed to the authenticated user
    """
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='documents',
        help_text='The student who owns this document'
    )
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    original_filename = models.CharField(
        max_length=255,
        help_text='Original filename before encryption'
    )
    file = models.FileField(
        upload_to='vault_files/',
        help_text='Encrypted file stored on disk'
    )
    file_size_bytes = models.BigIntegerField(
        help_text='Size of the ORIGINAL plaintext file in bytes'
    )
    file_type = models.CharField(
        max_length=100,
        default='application/pdf',
        help_text='MIME type of the original file'
    )
    is_starred = models.BooleanField(default=False)
    encryption_method = models.CharField(
        max_length=20,
        default='AES-256-GCM',
        editable=False
    )
    checksum_sha256 = models.CharField(
        max_length=64,
        help_text='SHA-256 hash of the ORIGINAL plaintext for integrity verification'
    )
    encryption_iv = models.BinaryField(
        max_length=12,
        help_text='AES-GCM 96-bit initialization vector (nonce)'
    )
    encryption_tag = models.BinaryField(
        max_length=16,
        help_text='AES-GCM 128-bit authentication tag'
    )
    issuing_authority = models.CharField(
        max_length=255,
        help_text='Institution or authority that issued the document'
    )
    academic_year = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    last_accessed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'vault_document'
        ordering = ['-uploaded_at']
        verbose_name = 'Vault Document'
        verbose_name_plural = 'Vault Documents'

    def __str__(self):
        return f'{self.title} ({self.category}) - {self.owner.student_id}'


# Activity action types matching the frontend types.ts
ACTION_CHOICES = [
    ('USER_LOGIN', 'User Login'),
    ('USER_LOGOUT', 'User Logout'),
    ('DOCUMENT_UPLOAD', 'Document Upload'),
    ('DOCUMENT_DOWNLOAD', 'Document Download'),
    ('DOCUMENT_DECRYPT', 'Document Decrypt'),
    ('DOCUMENT_DELETE', 'Document Delete'),
]


class ActivityLog(models.Model):
    """
    Immutable audit trail for security accountability and non-repudiation.
    Automatically records all significant vault operations with
    timestamps, client IP addresses, and user-agent strings.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activity_logs',
        help_text='The student who performed the action'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    details = models.TextField(
        help_text='Human-readable description of what happened'
    )
    document_title = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=30, blank=True)
    ip_address = models.GenericIPAddressField(
        default='0.0.0.0',
        help_text='Client IP address at the time of the action'
    )
    client_device = models.CharField(
        max_length=255,
        blank=True,
        help_text='User-Agent string from the client browser'
    )
    status = models.CharField(
        max_length=10,
        choices=[('SUCCESS', 'Success'), ('FLAGGED', 'Flagged')],
        default='SUCCESS'
    )

    class Meta:
        db_table = 'vault_activity_log'
        ordering = ['-timestamp']
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'

    def __str__(self):
        return f'[{self.action}] {self.user.student_id} @ {self.timestamp}'
