from collections import defaultdict
from datetime import date

from django.db.models import Avg, Count, Q
from django.utils import timezone

from knowledge.models import MCQAttempt
from resources.models import PDFResource, ResourceInteraction

from ai.models import StudyPlan, StudyPlanItem
from ai.services.content_diagnosis import diagnose_content
from ai.services.focus_model import compute_focus_state
from ai.services.target_service import get_active_target


def get_or_create_today_plan(user, force_refresh=False):
    today = timezone.localdate()
    plan = (
        StudyPlan.objects.filter(user=user, target_date=today)
        .prefetch_related("items", "items__pdf")
        .order_by("-created_at")
        .first()
    )

    if plan and not force_refresh and plan.items.exists():
        return plan

    if plan and force_refresh:
        if plan.status == "COMPLETED":
            plan.status = "ACTIVE"
            plan.save(update_fields=["status", "updated_at"])
        plan.items.all().delete()
    elif not plan:
        plan = StudyPlan.objects.create(user=user, target_date=today)

    build_plan_for_user(user, plan)
    plan.refresh_from_db()
    return plan


def build_plan_for_user(user, plan):
    focus = compute_focus_state(user)
    weak_topics = _get_weak_topics(user)
    target = get_active_target(user)
    pdfs = list(PDFResource.objects.filter(user=user).order_by("-last_viewed_at", "-created_at"))

    if not pdfs:
        if target:
            plan.summary = (
                f'Your target "{target.title}" is active. Add a PDF so the planner can turn it into study blocks.'
            )
        else:
            plan.summary = "Add a PDF to start building personalized study plans."
        plan.plan_score = 0
        plan.generation_context = {
            "focus_score": focus["focus_score"],
            "weak_topics": weak_topics,
            "target": _target_context(target),
            "generated_for": str(plan.target_date),
        }
        plan.save(update_fields=["summary", "plan_score", "generation_context", "updated_at"])
        return plan

    plan.items.all().delete()

    scored_resources = []
    for pdf in pdfs:
        diagnosis = diagnose_content(pdf)
        score = _score_resource(pdf, diagnosis, weak_topics, focus, target)
        scored_resources.append(
            {
                "pdf": pdf,
                "diagnosis": diagnosis,
                "score": score,
            }
        )

    scored_resources.sort(key=lambda item: item["score"], reverse=True)

    items = _build_plan_items(scored_resources, weak_topics, focus)
    for index, item in enumerate(items):
        StudyPlanItem.objects.create(plan=plan, sort_order=index, **item)

    plan.plan_score = round(sum(item["priority_score"] for item in items), 2)
    plan.summary = _build_plan_summary(focus, weak_topics, items, target)
    plan.generation_context = {
        "focus_score": focus["focus_score"],
        "weak_topics": weak_topics,
        "target": _target_context(target),
        "generated_for": str(plan.target_date),
        "resource_scores": [
            {
                "pdf_id": entry["pdf"].id,
                "title": entry["pdf"].display_title(),
                "score": round(entry["score"], 2),
            }
            for entry in scored_resources[:5]
        ],
    }
    plan.save(update_fields=["plan_score", "summary", "generation_context", "updated_at"])
    return plan


def update_plan_item_status(item, action):
    now = timezone.now()
    if action == "start":
        item.status = "IN_PROGRESS"
        item.completed_at = None
    elif action == "complete":
        item.status = "COMPLETED"
        item.completed_at = now
    elif action == "skip":
        item.status = "SKIPPED"
        item.completed_at = None
    else:
        raise ValueError("Unsupported action")

    item.save(update_fields=["status", "completed_at", "updated_at"])
    _refresh_plan_status(item.plan)
    return item


def _refresh_plan_status(plan):
    total = plan.items.count()
    completed = plan.items.filter(status="COMPLETED").count()
    if total and completed == total:
        plan.status = "COMPLETED"
    else:
        plan.status = "ACTIVE"
    plan.save(update_fields=["status", "updated_at"])


def _get_weak_topics(user):
    attempts = (
        MCQAttempt.objects.filter(user=user)
        .values("topic")
        .annotate(total=Count("id"), correct=Count("id", filter=Q(is_correct=True)))
    )

    weak_topics = []
    for row in attempts:
        if not row["topic"]:
            continue
        accuracy = (row["correct"] / row["total"]) * 100 if row["total"] else 0
        if accuracy < 70:
            weak_topics.append(
                {
                    "topic": row["topic"],
                    "accuracy": int(accuracy),
                    "attempts": row["total"],
                }
            )
    return sorted(weak_topics, key=lambda item: (item["accuracy"], -item["attempts"]))


def _score_resource(pdf, diagnosis, weak_topics, focus, target=None):
    weak_topic_bonus = 0
    matched_topic = _match_weak_topic(pdf, weak_topics)
    if matched_topic:
        weak_topic_bonus = 0.2

    recency_penalty = 0
    if pdf.last_viewed_at:
        hours_since = max((timezone.now() - pdf.last_viewed_at).total_seconds() / 3600, 1)
        recency_penalty = min(hours_since / 240, 1)
    else:
        recency_penalty = 1

    engagement_factor = max(0.25, focus["engagement"] / 100)
    target_bonus = 0.18 if _matches_target(pdf, target) else 0

    return (
        diagnosis["importance_degree"] * 0.35
        + diagnosis["neglect_degree"] * 0.25
        + diagnosis["difficulty_degree"] * 0.2
        + weak_topic_bonus
        + target_bonus
        + recency_penalty * 0.1
        + (1 - engagement_factor) * 0.1
    )


def _build_plan_items(scored_resources, weak_topics, focus):
    items = []
    primary = scored_resources[0]
    primary_pdf = primary["pdf"]
    primary_diagnosis = primary["diagnosis"]

    primary_task_type = "DEEP_STUDY" if focus["focus_score"] >= 55 else "REVIEW"
    items.append(
        {
            "pdf": primary_pdf,
            "title": _title_for_task(primary_task_type, primary_pdf),
            "description": _description_for_resource(primary_pdf, primary_diagnosis, weak_topics),
            "topic": _match_weak_topic(primary_pdf, weak_topics) or "",
            "task_type": primary_task_type,
            "estimated_minutes": 40 if primary_task_type == "DEEP_STUDY" else 25,
            "priority_score": round(primary["score"] * 100, 1),
            "rationale": _resource_rationale(primary_pdf, primary_diagnosis, focus, weak_topics),
        }
    )

    if len(scored_resources) > 1:
        secondary = scored_resources[1]
        items.append(
            {
                "pdf": secondary["pdf"],
                "title": f"Review {secondary['pdf'].display_title()}",
                "description": "Do a lighter pass focused on recall, summaries, and key definitions.",
                "topic": _match_weak_topic(secondary["pdf"], weak_topics) or "",
                "task_type": "REVIEW",
                "estimated_minutes": 20,
                "priority_score": round(secondary["score"] * 85, 1),
                "rationale": _resource_rationale(secondary["pdf"], secondary["diagnosis"], focus, weak_topics),
            }
        )

    if weak_topics:
        topic = weak_topics[0]
        items.append(
            {
                "pdf": _find_pdf_for_topic(scored_resources, topic["topic"]),
                "title": f"Quiz yourself on {topic['topic']}",
                "description": "Run a short MCQ round and check whether the weak area is improving.",
                "topic": topic["topic"],
                "task_type": "QUIZ",
                "estimated_minutes": 15,
                "priority_score": max(55, 100 - topic["accuracy"]),
                "rationale": f"This topic is currently at {topic['accuracy']}% accuracy across {topic['attempts']} attempts.",
            }
        )

    if focus["focus_score"] < 45:
        items.append(
            {
                "pdf": None,
                "title": "Reset with a short recovery block",
                "description": "Take a brief break, then return for a focused 10-minute recap before deeper work.",
                "topic": "",
                "task_type": "RECOVERY",
                "estimated_minutes": 10,
                "priority_score": 45,
                "rationale": "Recent focus signals are low, so a lighter restart should improve follow-through.",
            }
        )

    return items[:4]


def _find_pdf_for_topic(scored_resources, topic):
    topic_lower = topic.lower()
    for entry in scored_resources:
        pdf = entry["pdf"]
        tags = [str(tag).lower() for tag in (pdf.tags or [])]
        if topic_lower in pdf.display_title().lower() or topic_lower in tags:
            return pdf
    return scored_resources[0]["pdf"] if scored_resources else None


def _match_weak_topic(pdf, weak_topics):
    title = pdf.display_title().lower()
    tags = [str(tag).lower() for tag in (pdf.tags or [])]
    for topic in weak_topics:
        topic_name = topic["topic"].lower()
        if topic_name in title or topic_name in tags:
            return topic["topic"]
    return None


def _title_for_task(task_type, pdf):
    if task_type == "DEEP_STUDY":
        return f"Deep study {pdf.display_title()}"
    return f"Revisit {pdf.display_title()}"


def _description_for_resource(pdf, diagnosis, weak_topics):
    weak_topic = _match_weak_topic(pdf, weak_topics)
    if weak_topic:
        return f"Focus on the sections tied to {weak_topic} and capture a few quick notes as you go."
    if diagnosis["neglect"] == "high":
        return "This resource has been neglected recently, so use today to rebuild familiarity and momentum."
    if diagnosis["difficulty"] == "high":
        return "Move slowly through the difficult sections and summarize each major concept in your own words."
    return "Use this block to strengthen recall and push the material closer to automatic understanding."


def _resource_rationale(pdf, diagnosis, focus, weak_topics):
    reasons = []
    reasons.append(f"{pdf.display_title()} has {diagnosis['difficulty']} difficulty")
    if diagnosis["importance"] == "critical":
        reasons.append("it is tagged as exam-relevant")
    if diagnosis["neglect"] != "none":
        reasons.append(f"neglect level is {diagnosis['neglect']}")
    matched_topic = _match_weak_topic(pdf, weak_topics)
    if matched_topic:
        reasons.append(f"it overlaps with your weak topic {matched_topic}")
    reasons.append(f"current focus score is {focus['focus_score']}")
    return ", ".join(reasons) + "."


def _build_plan_summary(focus, weak_topics, items, target=None):
    if not items:
        return "No plan items were generated."

    if target:
        return (
            f'Today advances "{target.title}": your focus score is {focus["focus_score"]} '
            f"and the planner picked {len(items)} blocks that match your target."
        )

    if weak_topics:
        return (
            f"Today favors structured revision: your focus score is {focus['focus_score']} "
            f"and {weak_topics[0]['topic']} is still a weak topic."
        )

    return (
        f"Today favors consistent momentum: your focus score is {focus['focus_score']} "
        "so the plan mixes one priority resource with a lighter reinforcement task."
    )


def _target_context(target):
    if not target:
        return None

    return {
        "id": target.id,
        "title": target.title,
        "goal_type": target.goal_type,
        "subject": target.subject,
        "scope_label": target.scope_label,
        "progress_percent": round(target.progress_percent, 1),
        "recommended_minutes_per_day": target.recommended_minutes_per_day,
        "recommended_sessions_per_week": target.recommended_sessions_per_week,
        "target_date": target.target_date,
    }


def _matches_target(pdf, target):
    if not target or not pdf:
        return False

    subject = (target.subject or target.scope_label or "").lower()
    if not subject:
        return False

    title = pdf.display_title().lower()
    tags = [str(tag).lower() for tag in (pdf.tags or [])]

    if subject in title:
        return True

    return any(subject in tag or tag in subject for tag in tags)
