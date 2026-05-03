from datetime import timedelta
from django.utils import timezone
from django.db import models

from resources.models import ResourceInteraction
from ml.predict import predict_behavior


def diagnose_learner(user):
    now = timezone.now()
    last_14_days = now - timedelta(days=14)

    interactions = ResourceInteraction.objects.filter(
        user=user,
        event_type="view_closed"
    )

    if not interactions.exists():
        return {
            "status": "new",
            "focus_level": "unknown",
            "focus_degree": 0.0,
            "fatigue": "unknown",
            "fatigue_degree": 0.0,
            "consistency": 0.0,
            "avg_session": 0,
        }

    # ---------- CONSISTENCY ----------
    active_days = (
        interactions
        .filter(timestamp__gte=last_14_days)
        .values("timestamp__date")
        .distinct()
        .count()
    )
    consistency_ratio = min(active_days / 14, 1.0)

    # ---------- ENGAGEMENT ----------
    avg_session = interactions.aggregate(
        avg=models.Avg("duration")
    )["avg"] or 0

    # ---------- BASE FOCUS ESTIMATE ----------
    base_focus = min(avg_session / 1800, 1) * consistency_ratio
    
    features = {
        "duration": avg_session,
        "avg_page_time": avg_session,
        "scroll_completion": min(avg_session / 1800, 1),
        "tab_switch_rate": 0.2,
        "page_revisit_rate": 0.1,
        "attention_ratio": base_focus
    }

    ml = predict_behavior(features)

    engagement_ml = ml["engagement_score"]

    # ---------- FOCUS (FUZZY) ----------
    focus_degree = (
        0.5 * base_focus +
        0.5 * engagement_ml
    )


    if focus_degree < 0.3:
        focus_level = "low"
    elif focus_degree < 0.65:
        focus_level = "moderate"
    else:
        focus_level = "high"

    # ---------- FATIGUE (FUZZY) ----------
    recent = interactions.order_by("-timestamp")[:5]
    short_sessions = sum(
        1 for i in recent if i.duration and i.duration < 600
    )

    fatigue_degree = min(short_sessions / 5, 1.0)

    fatigue = "high" if fatigue_degree > 0.6 else "low"

    return {
        "status": "active",
        "focus_level": focus_level,
        "focus_degree": round(focus_degree, 2),
        "fatigue": fatigue,
        "fatigue_degree": round(fatigue_degree, 2),
        "consistency": round(consistency_ratio, 2),
        "avg_session": int(avg_session),
    }