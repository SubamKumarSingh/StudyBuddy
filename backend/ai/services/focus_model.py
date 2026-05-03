from datetime import timedelta
from django.utils import timezone
from django.db import models

from resources.models import ResourceInteraction

from ml.predict import predict_behavior
from analytics.services.behavior_features import compute_attention_ratio


def compute_focus_state(user):

    now = timezone.now()
    seven_days_ago = now - timedelta(days=7)

    interactions = ResourceInteraction.objects.filter(
        user=user,
        event_type="view_closed"
    )

    if not interactions.exists():
        return {
            "focus_score": 0,
            "consistency": 0,
            "engagement": 0,
            "recency": 0,
            "explanation": "No study activity yet."
        }

    active_days = (
        interactions
        .filter(timestamp__gte=seven_days_ago)
        .values("timestamp__date")
        .distinct()
        .count()
    )

    consistency = min(active_days / 7, 1.0)

    avg_duration = (
        interactions
        .exclude(duration__isnull=True)
        .aggregate(avg=models.Avg("duration"))["avg"] or 0
    )

    engagement = min(avg_duration / 1800, 1.0)

    last_interaction = interactions.latest("timestamp").timestamp

    hours_since = (now - last_interaction).total_seconds() / 3600

    if hours_since < 24:
        recency = 1.0
    elif hours_since < 72:
        recency = 0.7
    elif hours_since < 168:
        recency = 0.4
    else:
        recency = 0.1

    # ---------- ML PREDICTION ----------
    scroll_completion = min(avg_duration / 1800, 1)
    tab_switch_rate = 0.2
    page_revisit_rate = 0.1

    attention_ratio = compute_attention_ratio(
        scroll_completion,
        tab_switch_rate
    )

    features = {
        "duration": avg_duration,
        "avg_page_time": avg_duration,
        "scroll_completion": scroll_completion,
        "tab_switch_rate": tab_switch_rate,
        "page_revisit_rate": page_revisit_rate,
        "attention_ratio": attention_ratio
    }

    ml_prediction = predict_behavior(features)

    ml_focus = ml_prediction["focus_score"]


    focus_score = round(
        (0.3 * consistency +
         0.3 * engagement +
         0.2 * recency +
         0.2 * ml_focus) * 100
    )

    explanation = (
        f"You studied on {active_days} of the last 7 days. "
        f"Your average reading session is {int(avg_duration / 60)} minutes. "
        f"Your last study was {int(hours_since)} hours ago."
    )

    return {
        "focus_score": focus_score,
        "consistency": round(consistency * 100),
        "engagement": round(engagement * 100),
        "recency": round(recency * 100),
        "explanation": explanation
    }