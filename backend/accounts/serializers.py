from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework import serializers

from dj_rest_auth.registration.serializers import SocialLoginSerializer
from ai.models import LearningTarget

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):

    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password
        )

        if not user:
            raise serializers.ValidationError({
                "detail": "Invalid email or password"
            })

        attrs['username'] = email

        return super().validate(attrs)

from .models import User


class UserSerializer(serializers.ModelSerializer):
    has_password = serializers.SerializerMethodField()
    has_active_target = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "is_staff",
            "is_superuser",
            "has_password",
            "has_active_target",
        ]

    def get_has_password(self, obj):
        return obj.has_usable_password()

    def get_has_active_target(self, obj):
        return LearningTarget.objects.filter(user=obj, status="ACTIVE").exists()


class GoogleLoginSerializer(SocialLoginSerializer):
    id_token = serializers.CharField(required=True)

    def validate(self, attrs):
        print("CUSTOM GOOGLE LOGIN SERIALIZER HIT")
        attrs['access_token'] = attrs.get('id_token')
        return super().validate(attrs)
