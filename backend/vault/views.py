"""
VaultHub API Views

All endpoints for Phase 1:
- Auth: Register, Login, Logout, Profile (GET/PUT/DELETE)
- Documents: List/Create, Detail/Update/Delete, Download (decrypt)
- Activity: List audit logs

Every significant action automatically creates an ActivityLog entry
with client IP and User-Agent for security accountability.
"""

from django.contrib.auth import login, logout
from django.core.files.base import ContentFile
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse

from .models import StudentUser, VaultDocument, ActivityLog
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    StudentUserSerializer,
    VaultDocumentSerializer,
    DocumentUploadSerializer,
    DocumentUpdateSerializer,
    ActivityLogSerializer,
)
from .encryption import compute_sha256, encrypt_file, decrypt_file


# =============================================================================
# Helpers
# =============================================================================

def get_client_ip(request):
    """Extract client IP from request, handling proxy headers."""
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '0.0.0.0')


def get_client_device(request):
    """Extract User-Agent string from request."""
    return request.META.get('HTTP_USER_AGENT', 'Unknown')


def create_log(user, action, details, document_title='', category='', request=None):
    """Create an immutable audit log entry."""
    ActivityLog.objects.create(
        user=user,
        action=action,
        details=details,
        document_title=document_title,
        category=category,
        ip_address=get_client_ip(request) if request else '0.0.0.0',
        client_device=get_client_device(request) if request else 'System',
        status='SUCCESS',
    )


def format_bytes(size_bytes):
    """Format bytes into human-readable string (matches frontend formatBytes)."""
    if size_bytes == 0:
        return '0 B'
    units = ['B', 'KB', 'MB', 'GB']
    i = 0
    size = float(size_bytes)
    while size >= 1024 and i < len(units) - 1:
        size /= 1024
        i += 1
    return f'{size:.1f} {units[i]}'


# =============================================================================
# Auth Views
# =============================================================================

@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFTokenView(APIView):
    """GET /api/auth/csrf/ — Returns CSRF token and sets csrftoken cookie."""
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'detail': 'CSRF cookie set'})


class RegisterView(APIView):
    """POST /api/auth/register/ — Create a new student account."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Log the user in immediately after registration
        login(request, user)

        create_log(
            user, 'USER_LOGIN',
            f'New student account registered ({user.student_id}) with 500 MB quota',
            request=request,
        )

        return Response(
            StudentUserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """POST /api/auth/login/ — Authenticate with Argon2id verification."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        login(request, user)

        create_log(
            user, 'USER_LOGIN',
            f'Student {user.student_id} signed in with Argon2 verification',
            request=request,
        )

        return Response(StudentUserSerializer(user).data)


class LogoutView(APIView):
    """POST /api/auth/logout/ — End session, log the event."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        create_log(
            request.user, 'USER_LOGOUT',
            f'Signed out for {request.user.student_id}',
            request=request,
        )
        logout(request)
        return Response({'detail': 'Signed out successfully.'})


class ProfileView(APIView):
    """
    GET /api/auth/me/    — Return current user profile
    PUT /api/auth/me/    — Update profile fields
    DELETE /api/auth/me/ — Delete account and all documents
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(StudentUserSerializer(request.user).data)

    def put(self, request):
        serializer = StudentUserSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        create_log(
            request.user, 'USER_LOGIN',
            f'Student profile updated for {request.user.student_id}',
            request=request,
        )

        return Response(serializer.data)

    def delete(self, request):
        user = request.user
        create_log(
            user, 'USER_LOGOUT',
            f'Student account {user.student_id} deleted',
            request=request,
        )
        user.delete()
        return Response(
            {'detail': 'Account deleted.'},
            status=status.HTTP_204_NO_CONTENT,
        )


# =============================================================================
# Document Views
# =============================================================================

class DocumentListCreateView(APIView):
    """
    GET  /api/documents/  — List all documents for the authenticated user
    POST /api/documents/  — Upload a new document (encrypt + hash + store)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        docs = VaultDocument.objects.filter(owner=request.user)
        serializer = VaultDocumentSerializer(docs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DocumentUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        uploaded_file = data['file']
        plaintext_bytes = uploaded_file.read()

        # 1. Compute SHA-256 integrity checksum on original plaintext
        checksum = compute_sha256(plaintext_bytes)

        # 2. Encrypt with AES-256-GCM
        ciphertext, iv, tag = encrypt_file(plaintext_bytes)

        # 3. Save encrypted bytes to disk via Django FileField
        encrypted_content = ContentFile(ciphertext)
        doc = VaultDocument(
            owner=request.user,
            title=data['title'],
            category=data['category'],
            original_filename=uploaded_file.name,
            file_size_bytes=len(plaintext_bytes),
            file_type=uploaded_file.content_type or 'application/octet-stream',
            is_starred=data.get('isStarred', False),
            checksum_sha256=checksum,
            encryption_iv=iv,
            encryption_tag=tag,
            issuing_authority=data['issuingAuthority'],
            academic_year=data.get('academicYear', ''),
            description=data.get('description', ''),
        )
        doc.file.save(f'enc_{uploaded_file.name}', encrypted_content, save=True)

        # 4. Audit log
        create_log(
            request.user, 'DOCUMENT_UPLOAD',
            f'Uploaded and encrypted with AES-256 ({format_bytes(len(plaintext_bytes))})',
            document_title=doc.title,
            category=doc.category,
            request=request,
        )

        return Response(
            VaultDocumentSerializer(doc).data,
            status=status.HTTP_201_CREATED,
        )


class DocumentDetailView(APIView):
    """
    GET    /api/documents/<id>/  — Get document metadata
    PATCH  /api/documents/<id>/  — Update metadata (star/unstar, title)
    DELETE /api/documents/<id>/  — Delete document from vault
    """
    permission_classes = [IsAuthenticated]

    def _get_document(self, request, pk):
        """Get document owned by the current user, or None."""
        try:
            return VaultDocument.objects.get(pk=pk, owner=request.user)
        except VaultDocument.DoesNotExist:
            return None

    def get(self, request, pk):
        doc = self._get_document(request, pk)
        if not doc:
            return Response(
                {'detail': 'Document not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(VaultDocumentSerializer(doc).data)

    def patch(self, request, pk):
        doc = self._get_document(request, pk)
        if not doc:
            return Response(
                {'detail': 'Document not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = DocumentUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if 'isStarred' in serializer.validated_data:
            doc.is_starred = serializer.validated_data['isStarred']
        if 'title' in serializer.validated_data:
            doc.title = serializer.validated_data['title']

        doc.save()
        return Response(VaultDocumentSerializer(doc).data)

    def delete(self, request, pk):
        doc = self._get_document(request, pk)
        if not doc:
            return Response(
                {'detail': 'Document not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        title = doc.title
        category = doc.category
        size = doc.file_size_bytes

        # Delete the encrypted file from disk
        if doc.file:
            doc.file.delete(save=False)
        doc.delete()

        create_log(
            request.user, 'DOCUMENT_DELETE',
            f'Removed file from vault and freed {format_bytes(size)}',
            document_title=title,
            category=category,
            request=request,
        )

        return Response(status=status.HTTP_204_NO_CONTENT)


class DocumentDownloadView(APIView):
    """
    GET /api/documents/<id>/download/ — Decrypt and stream file to client.

    This is the critical security endpoint:
    1. Reads encrypted ciphertext from disk
    2. Decrypts with AES-256-GCM using stored IV and auth tag
    3. Verifies SHA-256 checksum matches original plaintext (tamper detection)
    4. Streams decrypted bytes to the authenticated user
    5. Logs the download event
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            doc = VaultDocument.objects.get(pk=pk, owner=request.user)
        except VaultDocument.DoesNotExist:
            return Response(
                {'detail': 'Document not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Read encrypted file from disk
        doc.file.open('rb')
        ciphertext = doc.file.read()
        doc.file.close()

        # Decrypt with AES-256-GCM
        try:
            plaintext = decrypt_file(
                ciphertext,
                bytes(doc.encryption_iv),
                bytes(doc.encryption_tag),
            )
        except Exception:
            return Response(
                {'detail': 'Decryption failed. File may have been tampered with.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Verify SHA-256 integrity
        computed_hash = compute_sha256(plaintext)
        if computed_hash != doc.checksum_sha256:
            return Response(
                {'detail': 'Integrity check failed. SHA-256 checksum mismatch — possible tampering detected.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Update last accessed timestamp
        doc.last_accessed_at = timezone.now()
        doc.save(update_fields=['last_accessed_at'])

        # Audit log
        create_log(
            request.user, 'DOCUMENT_DOWNLOAD',
            'Decrypted and downloaded by student',
            document_title=doc.title,
            category=doc.category,
            request=request,
        )

        # Stream decrypted file to client
        response = HttpResponse(plaintext, content_type=doc.file_type)
        response['Content-Disposition'] = f'attachment; filename="{doc.original_filename}"'
        response['Content-Length'] = len(plaintext)
        response['X-Checksum-SHA256'] = doc.checksum_sha256
        response['X-Encryption-Method'] = 'AES-256-GCM'
        return response


# =============================================================================
# Activity Log View
# =============================================================================

class ActivityLogListView(APIView):
    """GET /api/activity/ — List audit logs for the authenticated user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logs = ActivityLog.objects.filter(user=request.user)
        serializer = ActivityLogSerializer(logs, many=True)
        return Response(serializer.data)
