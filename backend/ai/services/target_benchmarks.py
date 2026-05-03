from __future__ import annotations

from statistics import median

from django.db.models import Avg
from django.utils import timezone

from ai.models import LearningTarget, PopulationBenchmark
from knowledge.models import MCQAttempt
from resources.models import ResourceInteraction


def _percentile(values, percentile):
    if not values:
        return 0
    ordered = sorted(values)
    index = int(round((len(ordered) - 1) * percentile))
    return ordered[index]


def _clamp(value, minimum, maximum):
    return max(minimum, min(maximum, value))


def _safe_median(values):
    return float(median(values)) if values else 0.0


def _build_key(goal_type, subject):
    return f"{(goal_type or 'all').lower()}::{(subject or 'all').strip().lower()}"


def _fallback_benchmark(goal_type="", subject=""):
    avg_duration = (
        ResourceInteraction.objects.filter(event_type="view_closed")
        .aggregate(avg=Avg("duration"))
        .get("avg")
        or 0
    )
    attempts = MCQAttempt.objects.all()
    total_attempts = attempts.count()
    correct_attempts = attempts.filter(is_correct=True).count()
    accuracy = (correct_attempts / total_attempts * 100) if total_attempts else 68.0

    minutes_per_day = _clamp(round((avg_duration / 60) * 0.8) or 30, 20, 90)
    sessions_per_week = 5 if avg_duration < 1800 else 4

    return {
        "benchmark_key": _build_key(goal_type, subject),
        "goal_type": goal_type or "",
        "subject": subject or "",
        "sample_size": total_attempts or ResourceInteraction.objects.filter(
            event_type="view_closed"
        ).count(),
        "median_days_to_completion": 28,
        "median_minutes_per_day": float(minutes_per_day),
        "median_sessions_per_week": float(sessions_per_week),
        "median_mastery_percent": float(accuracy),
        "median_progress_percent": 52.0,
        "completion_rate": 0.52,
        "recommended_minutes_per_day": float(minutes_per_day),
        "recommended_sessions_per_week": float(sessions_per_week),
        "payload": {
            "source": "fallback",
            "avg_session_seconds": int(avg_duration or 0),
            "completion_rate_basis": "global study signals",
        },
    }


def build_population_benchmark(goal_type="", subject=""):
    key = _build_key(goal_type, subject)
    snapshot = PopulationBenchmark.objects.filter(benchmark_key=key).first()

    if snapshot and (timezone.now() - snapshot.updated_at).total_seconds() < 24 * 3600:
        return snapshot

    qs = LearningTarget.objects.filter(status="COMPLETED")

    if goal_type:
        qs = qs.filter(goal_type=goal_type)

    if subject:
        qs = qs.filter(subject__icontains=subject) | qs.filter(scope_label__icontains=subject)

    completed_targets = list(qs)

    if not completed_targets:
        payload = _fallback_benchmark(goal_type, subject)
    else:
        days_to_completion = []
        minutes_per_day = []
        sessions_per_week = []
        mastery_percent = []
        progress_percent = []

        for target in completed_targets:
            if target.completed_at:
                days = max((target.completed_at.date() - target.start_date).days + 1, 1)
            else:
                days = max(target.time_horizon_days or 1, 1)

            days_to_completion.append(days)
            minutes_per_day.append(target.completed_minutes / max(days, 1))
            sessions_per_week.append((target.completed_sessions / max(days, 1)) * 7)
            mastery_percent.append(target.mastery_percent or 0)
            progress_percent.append(target.progress_percent or 100)

        median_days = _safe_median(days_to_completion) or 28
        median_minutes = _safe_median(minutes_per_day) or 30
        median_sessions = _safe_median(sessions_per_week) or 5
        median_mastery = _safe_median(mastery_percent) or 70
        median_progress = _safe_median(progress_percent) or 100
        completion_rate = len(completed_targets) / max(
            LearningTarget.objects.filter(status__in=["ACTIVE", "ON_HOLD", "COMPLETED"]).count(),
            1,
        )

        payload = {
            "source": "completed_targets",
            "days_to_completion": days_to_completion,
            "minutes_per_day": minutes_per_day,
            "sessions_per_week": sessions_per_week,
            "median_days_to_completion": median_days,
            "median_minutes_per_day": median_minutes,
            "median_sessions_per_week": median_sessions,
            "median_mastery_percent": median_mastery,
            "median_progress_percent": median_progress,
        }

    recommended_minutes = _clamp(round(payload["median_minutes_per_day"]) or 30, 20, 120)
    recommended_sessions = _clamp(round(payload["median_sessions_per_week"]) or 5, 3, 7)

    snapshot, _ = PopulationBenchmark.objects.update_or_create(
        benchmark_key=key,
        defaults={
            "goal_type": goal_type or "",
            "subject": subject or "",
            "sample_size": payload["sample_size"] if "sample_size" in payload else len(completed_targets),
            "median_days_to_completion": float(payload["median_days_to_completion"]),
            "median_minutes_per_day": float(payload["median_minutes_per_day"]),
            "median_sessions_per_week": float(payload["median_sessions_per_week"]),
            "median_mastery_percent": float(payload["median_mastery_percent"]),
            "median_progress_percent": float(payload["median_progress_percent"]),
            "completion_rate": float(payload.get("completion_rate", 0.0)),
            "recommended_minutes_per_day": float(recommended_minutes),
            "recommended_sessions_per_week": float(recommended_sessions),
            "payload": payload,
        },
    )
    return snapshot


def benchmark_to_dict(snapshot):
    if not snapshot:
        return None

    updated_at = snapshot.updated_at.isoformat() if snapshot.updated_at else None

    return {
        "benchmark_key": snapshot.benchmark_key,
        "goal_type": snapshot.goal_type,
        "subject": snapshot.subject,
        "sample_size": snapshot.sample_size,
        "median_days_to_completion": snapshot.median_days_to_completion,
        "median_minutes_per_day": snapshot.median_minutes_per_day,
        "median_sessions_per_week": snapshot.median_sessions_per_week,
        "median_mastery_percent": snapshot.median_mastery_percent,
        "median_progress_percent": snapshot.median_progress_percent,
        "completion_rate": snapshot.completion_rate,
        "recommended_minutes_per_day": snapshot.recommended_minutes_per_day,
        "recommended_sessions_per_week": snapshot.recommended_sessions_per_week,
        "payload": snapshot.payload,
        "updated_at": updated_at,
    }
