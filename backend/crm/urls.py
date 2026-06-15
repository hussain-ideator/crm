"""URL configuration for the crm project.

Domain app routes are mounted under ``/api/<app>/`` as each app is built
(see ``backend/README.md``). The cross-cutting routes wired up here are: the
admin, JWT auth, and the OpenAPI schema + docs.
"""

from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # Auth (JWT)
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # OpenAPI schema + docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    # Domain app routes
    path("api/auth/", include("apps.accounts.urls")),
    path("api/companies/", include("apps.companies.urls")),
    path("api/contacts/", include("apps.contacts.urls")),
    path("api/", include("apps.leads.urls")),
    path("api/", include("apps.deals.urls")),
    path("api/", include("apps.activities.urls")),
]

if settings.DEBUG:
    urlpatterns += [path("__debug__/", include("debug_toolbar.urls"))]
