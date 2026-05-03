import os

from allauth.account.adapter import DefaultAccountAdapter


class CustomAccountAdapter(DefaultAccountAdapter):
    def is_safe_url(self, url):
        if not url:
            return False

        allowed_prefixes = {
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        }

        frontend_url = os.getenv("FRONTEND_URL")
        if frontend_url:
            allowed_prefixes.add(frontend_url.rstrip("/"))

        normalized_url = url.rstrip("/")
        return any(
            normalized_url == prefix or normalized_url.startswith(f"{prefix}/")
            for prefix in allowed_prefixes
        )
