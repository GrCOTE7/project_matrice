"""URL configuration for project_matrice core back-office."""

from django.conf import settings
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "Project Matrice Admin (DEV)"

urlpatterns = [
    path("admin/", admin.site.urls),
]

if settings.DEBUG:
    urlpatterns += [path("__reload__/", include("django_browser_reload.urls"))]
