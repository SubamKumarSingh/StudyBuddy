from googleapiclient.discovery import build
from google.auth.credentials import Credentials as BaseCredentials
from allauth.socialaccount.models import SocialToken


class StaticAccessTokenCredentials(BaseCredentials):
    """
    OAuth credentials using a static access token.
    Refresh is a NO-OP to satisfy googleapiclient.
    """

    def __init__(self, token):
        super().__init__()
        self.token = token

    @property
    def expired(self):
        return False

    @property
    def valid(self):
        return True

    def refresh(self, request):
        # IMPORTANT: do nothing, do not raise
        return None

    def apply(self, headers):
        headers["Authorization"] = f"Bearer {self.token}"


def get_drive_service(user):
    token = SocialToken.objects.filter(
        account__user=user,
        account__provider="google"
    ).first()

    if not token:
        return None

    creds = StaticAccessTokenCredentials(token.token)

    return build(
        "drive",
        "v3",
        credentials=creds,
        cache_discovery=False,
    )