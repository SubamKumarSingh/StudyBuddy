from __future__ import annotations

from datetime import timedelta

from django.db.models import Count
from django.utils import timezone

from ai.models import LearningTarget, LearningTargetMilestone
from ai.services.focus_model import compute_focus_state
from ai.services.target_benchmarks import benchmark_to_dict, build_population_benchmark
from ai.services.target_parser import parse_learning_target


def get_active_target(user):
    return (
        LearningTarget.objects.filter(user=user, status="ACTIVE")
        .prefetch_related("milestones")
        .order_by("-updated_at")
        .first()
    )


def list_user_targets(user):
    return (
        LearningTarget.objects.filter(user=user)
        .prefetch_related("milestones")
        .order_by("-updated_at", "-created_at")
    )


def get_target_overview(user):
    target = get_active_target(user)
    if not target:
        benchmark = build_population_benchmark()
        return {
            "has_target": False,
            "target": None,
            "benchmark": benchmark_to_dict(benchmark),
            "needs_onboarding": True,
        }

    benchmark = build_population_benchmark(target.goal_type, target.subject)
    return {
        "has_target": True,
        "target": serialize_learning_target(target),
        "benchmark": benchmark_to_dict(benchmark),
        "needs_onboarding": False,
    }


def serialize_learning_target(target):
    if not target:
        return None

    milestones = list(target.milestones.all())
    next_milestone = next(
        (
            milestone
            for milestone in milestones
            if milestone.status in {"PENDING", "IN_PROGRESS"}
        ),
        None,
    )

    return {
        "id": target.id,
        "raw_text": target.raw_text,
        "title": target.title,
        "goal_type": target.goal_type,
        "status": target.status,
        "source_type": target.source_type,
        "subject": target.subject,
        "scope_label": target.scope_label,
        "goal_summary": target.goal_summary,
        "success_metric_label": target.success_metric_label,
        "target_value": target.target_value,
        "current_value": target.current_value,
        "target_unit": target.target_unit,
        "time_horizon_days": target.time_horizon_days,
        "start_date": target.start_date.isoformat() if target.start_date else None,
        "target_date": target.target_date.isoformat() if target.target_date else None,
        "ai_confidence": target.ai_confidence,
        "estimated_total_minutes": target.estimated_total_minutes,
        "completed_minutes": target.completed_minutes,
        "completed_sessions": target.completed_sessions,
        "progress_percent": round(target.progress_percent, 1),
        "mastery_percent": round(target.mastery_percent, 1),
        "pace_multiplier": round(target.pace_multiplier, 2),
        "recommended_minutes_per_day": target.recommended_minutes_per_day,
        "recommended_sessions_per_week": target.recommended_sessions_per_week,
        "benchmark_context": target.benchmark_context,
        "interpretation": target.interpretation,
        "completed_at": target.completed_at.isoformat() if target.completed_at else None,
        "created_at": target.created_at.isoformat() if target.created_at else None,
        "updated_at": target.updated_at.isoformat() if target.updated_at else None,
        "milestones": [
            {
                "id": milestone.id,
                "title": milestone.title,
                "description": milestone.description,
                "sort_order": milestone.sort_order,
                "due_date": milestone.due_date.isoformat() if milestone.due_date else None,
                "planned_minutes": milestone.planned_minutes,
                "status": milestone.status,
                "progress_percent": milestone.progress_percent,
                "completed_at": milestone.completed_at.isoformat() if milestone.completed_at else None,
                "metadata": milestone.metadata,
            }
            for milestone in milestones
        ],
        "next_milestone": {
            "id": next_milestone.id,
            "title": next_milestone.title,
            "description": next_milestone.description,
            "sort_order": next_milestone.sort_order,
            "due_date": next_milestone.due_date.isoformat() if next_milestone.due_date else None,
            "planned_minutes": next_milestone.planned_minutes,
            "status": next_milestone.status,
            "progress_percent": next_milestone.progress_percent,
            "completed_at": next_milestone.completed_at.isoformat() if next_milestone.completed_at else None,
            "metadata": next_milestone.metadata,
        }
        if next_milestone
        else None,
    }


def _subject_matches_pdf(target, pdf):
    if not target or not pdf:
        return False

    subject = (target.subject or target.scope_label or "").lower()
    title = (pdf.display_title() or "").lower()
    tags = [str(tag).lower() for tag in (pdf.tags or [])]

    if not subject:
        return False

    if subject in title:
        return True

    return any(subject in tag or tag in subject for tag in tags)


def build_target_milestones(target, benchmark=None):
    target.milestones.all().delete()
    benchmark = benchmark or build_population_benchmark(target.goal_type, target.subject)

    horizon = max(target.time_horizon_days or 28, 7)
    start = target.start_date or timezone.localdate()
    titles = [
        "Start strong",
        "Build the base",
        "Pressure test understanding",
        "Lock in mastery",
    ]

    descriptions = [
        "Get oriented and complete the first focused block.",
        "Cover the key material with steady practice.",
        "Check weak spots with retrieval and review.",
        "Finish with a consolidation pass and self-check.",
    ]

    created = []
    for index, title in enumerate(titles):
        due_offset = round(((index + 1) / len(titles)) * horizon)
        milestone = LearningTargetMilestone.objects.create(
            target=target,
            title=f"{title}: {target.subject or target.title}",
            description=descriptions[index],
            sort_order=index,
            due_date=start + timedelta(days=max(due_offset, 1)),
            planned_minutes=max(
                10,
                round(
                    (benchmark.recommended_minutes_per_day or target.recommended_minutes_per_day)
                    * (1 + (index * 0.18))
                ),
            ),
            metadata={
                "benchmark_key": benchmark.benchmark_key if benchmark else "",
                "benchmark_minutes_per_day": benchmark.recommended_minutes_per_day if benchmark else 0,
            },
        )
        created.append(milestone)

    return created


def _apply_pace_adjustment(target, benchmark, current_progress):
    if not target.time_horizon_days:
        return

    elapsed_days = max((timezone.localdate() - target.start_date).days + 1, 1)
    expected_progress = min((elapsed_days / target.time_horizon_days) * 100, 100)
    pace_ratio = current_progress / max(expected_progress, 1)

    if pace_ratio < 0.8:
        target.pace_multiplier = max(0.75, round(target.pace_multiplier * 0.95, 2))
    elif pace_ratio > 1.2:
        target.pace_multiplier = min(1.3, round(target.pace_multiplier * 1.03, 2))

    baseline_minutes = benchmark.recommended_minutes_per_day if benchmark else target.recommended_minutes_per_day
    target.recommended_minutes_per_day = max(20, round(baseline_minutes * target.pace_multiplier))
    target.recommended_sessions_per_week = max(
        3,
        min(7, round((benchmark.recommended_sessions_per_week if benchmark else target.recommended_sessions_per_week) * target.pace_multiplier)),
    )
    target.estimated_total_minutes = max(
        target.estimated_total_minutes,
        target.recommended_minutes_per_day * max(target.time_horizon_days or 28, 7),
    )


def _recompute_progress(target):
    if target.target_value and target.target_value > 0:
        progress = min((target.current_value / target.target_value) * 100, 100)
    elif target.estimated_total_minutes > 0:
        progress = min((target.completed_minutes / target.estimated_total_minutes) * 100, 100)
    else:
        progress = 0

    if target.milestones.exists():
        completed_milestones = target.milestones.filter(status="COMPLETED").count()
        milestone_progress = (completed_milestones / target.milestones.count()) * 100
        progress = max(progress, milestone_progress)

    target.progress_percent = round(progress, 1)
    if target.target_unit == "percent":
        target.mastery_percent = round(target.current_value, 1)


def create_or_update_target_from_text(user, raw_text, replace_current=True):
    parsed = parse_learning_target(raw_text)
    benchmark = build_population_benchmark(parsed["goal_type"], parsed["subject"])
    try:
        current_focus = compute_focus_state(user)
        focus_score = current_focus.get("focus_score", 50)
    except Exception:
        focus_score = 50
    focus_multiplier = max(0.85, min(1.15, 0.85 + (focus_score / 200)))

    target = get_active_target(user)
    if not target or replace_current:
        if target:
            target.status = "ARCHIVED"
            target.save(update_fields=["status", "updated_at"])
        target = LearningTarget.objects.create(
            user=user,
            raw_text=parsed["raw_text"],
            title=parsed["title"],
            goal_type=parsed["goal_type"],
            status="ACTIVE",
            source_type=parsed["source_type"],
            subject=parsed["subject"],
            scope_label=parsed["scope_label"],
            goal_summary=parsed["goal_summary"],
            success_metric_label=parsed["success_metric_label"],
            target_value=parsed["target_value"],
            current_value=0,
            target_unit=parsed["target_unit"],
            time_horizon_days=parsed["time_horizon_days"] or 28,
            start_date=timezone.localdate(),
            target_date=parsed["target_date"] or (timezone.localdate() + timedelta(days=28)),
            ai_confidence=parsed["ai_confidence"],
            estimated_total_minutes=0,
            completed_minutes=0,
            completed_sessions=0,
            progress_percent=0,
            mastery_percent=0,
            pace_multiplier=round(focus_multiplier, 2),
            recommended_minutes_per_day=max(
                20,
                round((benchmark.recommended_minutes_per_day or parsed["recommended_minutes_per_day"]) * focus_multiplier),
            ),
            recommended_sessions_per_week=max(
                3,
                round((benchmark.recommended_sessions_per_week or parsed["recommended_sessions_per_week"]) * focus_multiplier),
            ),
            benchmark_context=benchmark_to_dict(benchmark) or {},
            interpretation=parsed["interpretation"],
        )
    else:
        target.raw_text = parsed["raw_text"]
        target.title = parsed["title"]
        target.goal_type = parsed["goal_type"]
        target.source_type = parsed["source_type"]
        target.subject = parsed["subject"]
        target.scope_label = parsed["scope_label"]
        target.goal_summary = parsed["goal_summary"]
        target.success_metric_label = parsed["success_metric_label"]
        target.target_value = parsed["target_value"]
        target.target_unit = parsed["target_unit"]
        target.time_horizon_days = parsed["time_horizon_days"] or target.time_horizon_days or 28
        target.target_date = parsed["target_date"] or (timezone.localdate() + timedelta(days=target.time_horizon_days or 28))
        target.ai_confidence = parsed["ai_confidence"]
        target.status = "ACTIVE"
        target.benchmark_context = benchmark_to_dict(benchmark) or {}
        target.interpretation = parsed["interpretation"]
        target.pace_multiplier = round(focus_multiplier, 2)
        target.recommended_minutes_per_day = max(
            20,
            round((benchmark.recommended_minutes_per_day or parsed["recommended_minutes_per_day"]) * focus_multiplier),
        )
        target.recommended_sessions_per_week = max(
            3,
            round((benchmark.recommended_sessions_per_week or parsed["recommended_sessions_per_week"]) * focus_multiplier),
        )
        target.completed_minutes = target.completed_minutes or 0
        target.completed_sessions = target.completed_sessions or 0
        target.current_value = target.current_value or 0
        target.save()
        target.milestones.all().delete()

    target.estimated_total_minutes = max(
        target.recommended_minutes_per_day * max(target.time_horizon_days or 28, 7),
        target.estimated_total_minutes,
    )
    _apply_pace_adjustment(target, benchmark, target.progress_percent or 0)
    target.benchmark_context = benchmark_to_dict(benchmark) or {}
    _recompute_progress(target)
    target.save()

    build_target_milestones(target, benchmark)
    target.refresh_from_db()
    return target


def record_target_activity(user, study_minutes=0, quiz_score=None):
    target = get_active_target(user)
    if not target:
        return None

    if study_minutes:
        target.completed_minutes += int(study_minutes)
        target.completed_sessions += 1
        if not target.target_value or target.target_unit != "percent":
            target.current_value = target.completed_minutes

    if quiz_score is not None:
        score_percent = max(0, min(100, float(quiz_score) * 100))
        if target.current_value and target.target_unit == "percent":
            target.current_value = round((target.current_value * 0.7) + (score_percent * 0.3), 1)
        else:
            target.current_value = round(score_percent, 1)
        target.mastery_percent = round((target.mastery_percent * 0.7) + (score_percent * 0.3), 1)

    benchmark = build_population_benchmark(target.goal_type, target.subject)
    _apply_pace_adjustment(target, benchmark, target.progress_percent or 0)
    _recompute_progress(target)

    if target.progress_percent >= 100 and target.status == "ACTIVE":
        target.status = "COMPLETED"
        target.completed_at = timezone.now()

    target.save()
    return target


def complete_target(target):
    target.status = "COMPLETED"
    target.progress_percent = max(target.progress_percent, 100)
    target.completed_at = timezone.now()
    target.save(update_fields=["status", "progress_percent", "completed_at", "updated_at"])
    return target
