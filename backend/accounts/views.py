from django.shortcuts import render

# Create your views here.
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import EmailTokenObtainPairSerializer


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.core.exceptions import ValidationError
from .serializers import UserSerializer
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.serializers import SocialLoginSerializer
from .serializers import GoogleLoginSerializer
from django.contrib.auth import password_validation

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# class GoogleLogin(SocialLoginView):
#     adapter_class = GoogleOAuth2Adapter
#     serializer_class = GoogleLoginSerializer



class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    serializer_class = GoogleLoginSerializer

    def post(self, request, *args, **kwargs):
        print("CUSTOM GOOGLE LOGIN VIEW HIT")
        return super().post(request, *args, **kwargs)


class PasswordManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "has_password": request.user.has_usable_password()
        })

    def post(self, request):
        old_password = request.data.get("old_password", "")
        new_password = request.data.get("new_password", "")

        if not new_password:
            return Response(
                {"detail": "New password is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request.user.has_usable_password():
            if not old_password:
                return Response(
                    {"detail": "Current password is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not request.user.check_password(old_password):
                return Response(
                    {"detail": "Current password is incorrect."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            password_validation.validate_password(new_password, request.user)
        except ValidationError as exc:
            return Response(
                {"detail": exc.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.set_password(new_password)
        request.user.save(update_fields=["password"])

        return Response({
            "detail": "Password saved successfully.",
            "has_password": True,
        })
    
