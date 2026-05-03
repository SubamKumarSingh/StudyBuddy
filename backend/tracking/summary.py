from datetime import timedelta
from django.utils import timezone
from .models import StudySession
from .analytics import calculate_effective_time


def get_summary_for_range(user, start_time, end_time):
    sessions = StudySession.objects.filter(
        user=user,
        status="COMPLETED",
        ended_at__gte=start_time,
        ended_at__lte=end_time
    )

    total_effective = 0

    for session in sessions:
        data = calculate_effective_time(session)
        total_effective += data["effective_seconds"]

    return {
        "effective_seconds": total_effective,
        "sessions": sessions.count()
    }
