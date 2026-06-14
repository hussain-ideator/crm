from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import AuthenticationFailed

_INVALID_CREDENTIALS_MSG = "No active account found with the given credentials"


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get("request"),
            username=attrs["email"],
            password=attrs["password"],
        )
        if user is None:
            # Identical message for wrong-password AND unknown-email (FR-004).
            raise AuthenticationFailed(_INVALID_CREDENTIALS_MSG)
        attrs["user"] = user
        return attrs
