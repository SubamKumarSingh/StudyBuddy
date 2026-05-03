from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(_request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path("health/", health_check),
    path("admin/", admin.site.urls),

    # APP URLS
    path("api/accounts/", include("accounts.urls")),
    path("api/tracking/", include("tracking.urls")),
    path("api/resources/", include("resources.urls")),
    path("api/ai/", include("ai.urls")),
    path("api/analytics/", include("analytics.urls")),
    path("api/knowledge/", include("knowledge.urls")),
    # AUTHENTICATION URLS
    path("dj-rest-auth/", include("dj_rest_auth.urls")),
    path("dj-rest-auth/registration/", include("dj_rest_auth.registration.urls")),

    # OAuth / Allauth
    path("accounts/", include("allauth.urls")),
]

