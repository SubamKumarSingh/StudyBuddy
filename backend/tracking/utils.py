from .models import StudySession

def get_active_session(user):
    return StudySession.objects.filter(
        user=user,
        status__in=["ACTIVE", "PAUSED", "IDLE"]
    ).first()
