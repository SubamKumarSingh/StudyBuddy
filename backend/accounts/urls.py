
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import EmailTokenObtainPairView, GoogleLogin, PasswordManagementView
from .views import me

urlpatterns = [
    path('login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', me),
    path("google/", GoogleLogin.as_view(), name="google_login"),
    path("password/", PasswordManagementView.as_view(), name="password_management"),
]

