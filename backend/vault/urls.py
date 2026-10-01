"""
VaultHub App URL Configuration

API endpoint routing for the vault app:
- /api/auth/register/           → RegisterView
- /api/auth/login/              → LoginView
- /api/auth/logout/             → LogoutView
- /api/auth/me/                 → ProfileView (GET, PUT, DELETE)
- /api/documents/               → DocumentListCreateView (GET, POST)
- /api/documents/<id>/          → DocumentDetailView (GET, PATCH, DELETE)
- /api/documents/<id>/download/ → DocumentDownloadView (GET)
- /api/activity/                → ActivityLogListView (GET)
"""

from django.urls import path
from . import views

urlpatterns = [
    # Auth endpoints
    path('auth/csrf/', views.CSRFTokenView.as_view(), name='auth-csrf'),
    path('auth/register/', views.RegisterView.as_view(), name='auth-register'),
    path('auth/login/', views.LoginView.as_view(), name='auth-login'),
    path('auth/logout/', views.LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', views.ProfileView.as_view(), name='auth-profile'),

    # Document endpoints
    path('documents/', views.DocumentListCreateView.as_view(), name='document-list-create'),
    path('documents/<int:pk>/', views.DocumentDetailView.as_view(), name='document-detail'),
    path('documents/<int:pk>/download/', views.DocumentDownloadView.as_view(), name='document-download'),

    # Activity log endpoint
    path('activity/', views.ActivityLogListView.as_view(), name='activity-list'),
]
