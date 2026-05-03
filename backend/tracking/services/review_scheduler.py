from datetime import timedelta

from django.utils import timezone

from tracking.models import ReviewItem
from ai.services.target_service import record_target_activity


def _clamp(value, minimum, maximum):
    return max(minimum, min(maximum, value))


def _score_to_initial_interval(score):
    if score >= 0.85:
        return 4
    if score >= 0.7:
        return 2
    return 1


def _adjust_score_from_context(score):
    return _clamp(score, 0.0, 1.0)


def _serialize_review_item(item):
    now = timezone.now()
    seconds_until_due = int((item.next_review_at - now).total_seconds())

    return {
        "id": item.id,
        "pdf_id": item.pdf_id,
        "pdf_title": item.pdf.display_title(),
        "pdf_name": item.pdf.name,
        "next_review_at": item.next_review_at,
        "last_reviewed_at": item.last_reviewed_at,
        "review_count": item.review_count,
        "interval_days": item.interval_days,
        "ease_factor": round(item.ease_factor, 2),
        "mastery_level": round(item.mastery_level * 100),
        "last_score": round(item.last_score * 100),
        "is_due": item.next_review_at <= now,
        "overdue_hours": round(abs(seconds_until_due) / 3600, 1) if seconds_until_due < 0 else 0,
        "due_in_hours": round(seconds_until_due / 3600, 1) if seconds_until_due > 0 else 0,
    }


def get_or_create_review_item(user, pdf):
    review, created = ReviewItem.objects.get_or_create(
        user=user,
        pdf=pdf,
        defaults={
            "next_review_at": timezone.now(),
            "interval_days": 1,
            "ease_factor": 2.5,
            "mastery_level": 0.0,
            "last_score": 0.0,
        },
    )

    if created and review.next_review_at is None:
        review.next_review_at = timezone.now()
        review.save(update_fields=["next_review_at"])

    return review


def record_review_outcome(user, pdf, score, source="study", metadata=None):
    if pdf is None:
        return None

    review = get_or_create_review_item(user, pdf)
    score = _adjust_score_from_context(score)
    now = timezone.now()

    if review.review_count == 0:
        interval_days = _score_to_initial_interval(score)
    else:
        if score >= 0.85:
            interval_days = max(1, round(review.interval_days * review.ease_factor))
        elif score >= 0.65:
            interval_days = max(1, round(review.interval_days * 1.6))
        elif score >= 0.45:
            interval_days = max(1, round(review.interval_days * 1.15))
        else:
            interval_days = 1

    if score >= 0.85:
        ease_factor = _clamp(review.ease_factor + 0.12, 1.3, 3.0)
        mastery_level = _clamp(review.mastery_level + 0.18, 0.0, 1.0)
    elif score >= 0.65:
        ease_factor = _clamp(review.ease_factor + 0.05, 1.3, 3.0)
        mastery_level = _clamp(review.mastery_level + 0.1, 0.0, 1.0)
    elif score >= 0.45:
        ease_factor = _clamp(review.ease_factor - 0.08, 1.3, 3.0)
        mastery_level = _clamp(review.mastery_level + 0.02, 0.0, 1.0)
    else:
        ease_factor = _clamp(review.ease_factor - 0.2, 1.3, 3.0)
        mastery_level = _clamp(review.mastery_level - 0.08, 0.0, 1.0)

    review.last_reviewed_at = now
    review.review_count += 1
    review.interval_days = interval_days
    review.ease_factor = ease_factor
    review.mastery_level = mastery_level
    review.last_score = score
    review.next_review_at = now + timedelta(days=interval_days)
    review.save()

    return review


def record_study_session(user, pdf, duration_seconds):
    if pdf is None:
        return None

    if duration_seconds >= 900:
        score = 0.9
    elif duration_seconds >= 480:
        score = 0.75
    elif duration_seconds >= 180:
        score = 0.55
    else:
        score = 0.35

    review = record_review_outcome(
        user=user,
        pdf=pdf,
        score=score,
        source="study",
        metadata={"duration_seconds": duration_seconds},
    )
    record_target_activity(user, study_minutes=max(duration_seconds // 60, 0))
    return review


def record_quiz_result(user, pdf, is_correct):
    if pdf is None:
        return None

    score = 0.92 if is_correct else 0.4
    review = record_review_outcome(
        user=user,
        pdf=pdf,
        score=score,
        source="quiz",
        metadata={"is_correct": is_correct},
    )
    record_target_activity(user, quiz_score=score)
    return review


def get_review_queue(user, limit=6):
    now = timezone.now()
    items = ReviewItem.objects.filter(user=user).select_related("pdf")

    due_items = items.filter(next_review_at__lte=now).order_by("next_review_at", "-mastery_level")
    upcoming_items = items.filter(next_review_at__gt=now).order_by("next_review_at", "-mastery_level")

    return {
        "due_count": due_items.count(),
        "upcoming_count": upcoming_items.count(),
        "due_items": [_serialize_review_item(item) for item in due_items[:limit]],
        "upcoming_items": [_serialize_review_item(item) for item in upcoming_items[:limit]],
    }
