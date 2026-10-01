"""
VaultHub Project URL Configuration

Routes:
- /admin/  → Django admin interface
- /api/    → All VaultHub REST API endpoints (vault app)
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('vault.urls')),
]
