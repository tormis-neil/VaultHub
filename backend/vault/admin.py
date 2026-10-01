from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import StudentUser, VaultDocument, ActivityLog


@admin.register(StudentUser)
class StudentUserAdmin(UserAdmin):
    """Admin view for StudentUser with custom fields."""
    list_display = ('username', 'student_id', 'email', 'degree_program', 'academic_year', 'is_active')
    search_fields = ('username', 'student_id', 'email', 'first_name', 'last_name')
    list_filter = ('degree_program', 'academic_year', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Student Information', {
            'fields': ('student_id', 'degree_program', 'academic_year', 'storage_quota_bytes', 'avatar_initials'),
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Student Information', {
            'fields': ('student_id', 'degree_program', 'academic_year'),
        }),
    )


@admin.register(VaultDocument)
class VaultDocumentAdmin(admin.ModelAdmin):
    """Admin view for VaultDocument."""
    list_display = ('title', 'category', 'owner', 'file_size_bytes', 'is_starred', 'uploaded_at')
    list_filter = ('category', 'is_starred', 'encryption_method')
    search_fields = ('title', 'original_filename', 'issuing_authority')
    readonly_fields = ('checksum_sha256', 'encryption_method', 'encryption_iv', 'encryption_tag', 'uploaded_at')


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    """Admin view for ActivityLog - read-only audit trail."""
    list_display = ('timestamp', 'user', 'action', 'document_title', 'ip_address', 'status')
    list_filter = ('action', 'status')
    search_fields = ('details', 'document_title', 'user__student_id')
    readonly_fields = ('timestamp', 'user', 'action', 'details', 'document_title', 'category', 'ip_address', 'client_device', 'status')

    def has_add_permission(self, request):
        return False  # Logs are system-generated only

    def has_change_permission(self, request, obj=None):
        return False  # Logs are immutable
