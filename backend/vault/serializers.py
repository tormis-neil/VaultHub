"""
VaultHub DRF Serializers

Maps Django snake_case models to camelCase JSON responses
matching the frontend TypeScript contracts in src/types.ts:
- StudentUser  → StudentUserSerializer
- VaultDocument → VaultDocumentSerializer (read) + DocumentUploadSerializer (write)
- ActivityLog  → ActivityLogSerializer (read-only)
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import StudentUser, VaultDocument, ActivityLog


# =============================================================================
# Auth Serializers
# =============================================================================

class RegisterSerializer(serializers.Serializer):
    """
    Handles student registration.
    Accepts camelCase fields from the frontend form, creates the user
    with Argon2id-hashed password via Django's create_user().
    """
    firstName = serializers.CharField(max_length=150, write_only=True)
    lastName = serializers.CharField(max_length=150, write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(min_length=8, write_only=True)
    studentId = serializers.CharField(max_length=30, write_only=True)
    degreeProgram = serializers.CharField(max_length=100, write_only=True)
    academicYear = serializers.CharField(max_length=50, write_only=True)

    def validate_email(self, value):
        if StudentUser.objects.filter(email=value).exists():
            raise serializers.ValidationError('A student with this email already exists.')
        return value

    def validate_studentId(self, value):
        if StudentUser.objects.filter(student_id=value.upper()).exists():
            raise serializers.ValidationError('A student with this ID already exists.')
        return value.upper()

    def create(self, validated_data):
        first_name = validated_data['firstName']
        last_name = validated_data['lastName']
        initials = (first_name[0] + last_name[0]).upper()

        user = StudentUser.objects.create_user(
            username=validated_data['email'],  # Use email as username
            email=validated_data['email'],
            password=validated_data['password'],  # Hashed by Argon2id automatically
            first_name=first_name,
            last_name=last_name,
            student_id=validated_data['studentId'],
            degree_program=validated_data['degreeProgram'],
            academic_year=validated_data['academicYear'],
            avatar_initials=initials,
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Handles student login.
    Accepts email/studentId + password, authenticates via Argon2id verification.
    """
    emailOrStudentId = serializers.CharField(write_only=True, required=False)
    login = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        identifier = (data.get('emailOrStudentId') or data.get('login') or '').strip()
        if not identifier:
            raise serializers.ValidationError('Please enter your student email or ID number.')
        password = data['password']

        # Try to find user by email or student_id
        user = None
        try:
            if '@' in identifier:
                user_obj = StudentUser.objects.get(email=identifier)
            else:
                user_obj = StudentUser.objects.get(student_id=identifier.upper())
            # Authenticate using Django's auth (checks Argon2id hash)
            user = authenticate(username=user_obj.username, password=password)
        except StudentUser.DoesNotExist:
            pass

        if user is None:
            raise serializers.ValidationError('Invalid credentials. Please check your email/ID and password.')

        if not user.is_active:
            raise serializers.ValidationError('This account has been deactivated.')

        data['user'] = user
        return data


# =============================================================================
# User Profile Serializer
# =============================================================================

class StudentUserSerializer(serializers.ModelSerializer):
    """
    Serializes StudentUser for API responses.
    Field names use camelCase to match frontend types.ts StudentUser interface:
      id, studentId, fullName, email, degreeProgram, academicYear,
      storageQuotaBytes, avatarInitials
    """
    id = serializers.CharField(source='pk', read_only=True)
    studentId = serializers.CharField(source='student_id')
    fullName = serializers.SerializerMethodField()
    degreeProgram = serializers.CharField(source='degree_program')
    academicYear = serializers.CharField(source='academic_year')
    storageQuotaBytes = serializers.IntegerField(source='storage_quota_bytes')
    avatarInitials = serializers.CharField(source='avatar_initials')

    class Meta:
        model = StudentUser
        fields = [
            'id', 'studentId', 'fullName', 'email',
            'degreeProgram', 'academicYear', 'storageQuotaBytes', 'avatarInitials',
        ]

    def get_fullName(self, obj):
        return obj.get_full_name()

    def update(self, instance, validated_data):
        """Handle profile updates from the frontend ProfileView."""
        instance.student_id = validated_data.get('student_id', instance.student_id)
        instance.degree_program = validated_data.get('degree_program', instance.degree_program)
        instance.academic_year = validated_data.get('academic_year', instance.academic_year)
        instance.email = validated_data.get('email', instance.email)

        # Handle fullName updates — split into first/last
        if 'email' in validated_data:
            instance.username = validated_data['email']

        instance.save()
        return instance


# =============================================================================
# Document Serializers
# =============================================================================

class VaultDocumentSerializer(serializers.ModelSerializer):
    """
    Read serializer for VaultDocument.
    Maps to the frontend types.ts VaultDocument interface with camelCase keys:
      id, title, category, fileName, fileSizeBytes, fileType, uploadDate,
      lastAccessedDate, isStarred, encryptionMethod, checksumSHA256,
      issuingAuthority, academicYear, status, description
    """
    id = serializers.CharField(source='pk', read_only=True)
    fileName = serializers.CharField(source='original_filename', read_only=True)
    fileSizeBytes = serializers.IntegerField(source='file_size_bytes', read_only=True)
    fileType = serializers.CharField(source='file_type', read_only=True)
    uploadDate = serializers.DateTimeField(source='uploaded_at', read_only=True)
    lastAccessedDate = serializers.DateTimeField(source='last_accessed_at', read_only=True)
    isStarred = serializers.BooleanField(source='is_starred')
    encryptionMethod = serializers.CharField(source='encryption_method', read_only=True)
    checksumSHA256 = serializers.CharField(source='checksum_sha256', read_only=True)
    issuingAuthority = serializers.CharField(source='issuing_authority', read_only=True)
    academicYear = serializers.CharField(source='academic_year', read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = VaultDocument
        fields = [
            'id', 'title', 'category', 'fileName', 'fileSizeBytes', 'fileType',
            'uploadDate', 'lastAccessedDate', 'isStarred', 'encryptionMethod',
            'checksumSHA256', 'issuingAuthority', 'academicYear', 'status',
            'description',
        ]

    def get_status(self, obj):
        """All stored documents are encrypted at rest."""
        return 'Encrypted'


class DocumentUploadSerializer(serializers.Serializer):
    """
    Write serializer for document uploads.
    Accepts the file and metadata from the UploadModal.tsx form.
    The actual encryption + checksum computation happens in the view.
    """
    file = serializers.FileField()
    title = serializers.CharField(max_length=255)
    category = serializers.ChoiceField(choices=[
        'Transcripts', 'Certificates', 'Resumes',
        'Identification Cards', 'Clearances',
    ])
    issuingAuthority = serializers.CharField(max_length=255)
    academicYear = serializers.CharField(max_length=50, required=False, default='')
    description = serializers.CharField(required=False, default='')
    isStarred = serializers.BooleanField(required=False, default=False)


class DocumentUpdateSerializer(serializers.Serializer):
    """Handles partial updates (star/unstar, title edits)."""
    isStarred = serializers.BooleanField(required=False)
    title = serializers.CharField(max_length=255, required=False)


# =============================================================================
# Activity Log Serializer
# =============================================================================

class ActivityLogSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for ActivityLog.
    Maps to the frontend types.ts ActivityLog interface with camelCase keys:
      id, timestamp, action, details, documentTitle, category,
      ipAddress, clientDevice, status
    """
    id = serializers.CharField(source='pk', read_only=True)
    documentTitle = serializers.CharField(source='document_title', read_only=True)
    ipAddress = serializers.CharField(source='ip_address', read_only=True)
    clientDevice = serializers.CharField(source='client_device', read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'timestamp', 'action', 'details',
            'documentTitle', 'category', 'ipAddress', 'clientDevice', 'status',
        ]
