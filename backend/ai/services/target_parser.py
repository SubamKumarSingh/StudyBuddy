from __future__ import annotations

import json
import os
import re
from datetime import timedelta

from django.conf import settings
from django.utils import timezone


def _clean_subject(value):
    value = (value or "").strip(" .,!?:;")
    return value[:255]


def _first_match(pattern, text):
    match = re.search(pattern, text, flags=re.IGNORECASE)
    return match.group(1) if match else None


def _parse_duration_days(text):
    match = re.search(
        r"(\d+)\s*(day|days|week|weeks|month|months)",
        text,
        flags=re.IGNORECASE,
    )
    if not match:
        return None

    value = int(match.group(1))
    unit = match.group(2).lower()
    if "month" in unit:
        return max(1, value * 30)
    if "week" in unit:
        return max(1, value * 7)
    return max(1, value)


def _parse_minutes_per_day(text):
    match = re.search(
        r"(\d+)\s*(minute|minutes|min|mins|hour|hours)\s*(?:a|per)\s*(day|session|week)",
        text,
        flags=re.IGNORECASE,
    )
    if not match:
        return None

    value = int(match.group(1))
    unit = match.group(2).lower()
    cadence = match.group(3).lower()
    minutes = value * 60 if "hour" in unit else value

    if cadence == "week":
        return max(5, round(minutes / 7))
    return max(5, minutes)


def _parse_percentage_target(text):
    match = re.search(r"(\d{2,3})\s*%", text)
    return float(match.group(1)) if match else None


def _infer_goal_type(text):
    lowered = text.lower()
    if any(word in lowered for word in ["habit", "routine", "daily", "consistently"]):
        return "habit_goal"
    if any(word in lowered for word in ["project", "build", "ship", "launch"]):
        return "project_goal"
    if any(word in lowered for word in ["master", "understand", "learn", "improve", "score"]):
        return "mastery_goal"
    if any(word in lowered for word in ["finish", "complete", "by", "before", "deadline"]):
        return "deadline_goal"
    return "custom_goal"


def _normalize_goal_type(value, fallback):
    allowed = {
        "deadline_goal",
        "habit_goal",
        "mastery_goal",
        "project_goal",
        "custom_goal",
    }
    if value in allowed:
        return value
    return fallback


def _infer_subject(text):
    subject = _first_match(
        r"(?:study|learn|master|finish|complete|improve|practice|prepare for|work on)\s+(?:my\s+)?(.+?)(?:\s+by\s+|\s+within\s+|\s+in\s+|\s+for\s+|\s+to\s+|$)",
        text,
    )
    if subject:
        return _clean_subject(subject)

    quoted = _first_match(r"['\"]([^'\"]+)['\"]", text)
    if quoted:
        return _clean_subject(quoted)

    return ""


def _build_title(subject, goal_type):
    if subject:
        return subject.title()
    return goal_type.replace("_", " ").title()


def _build_summary(subject, goal_type, horizon_days, metric_label):
    pieces = []
    if subject:
        pieces.append(f"Focus on {subject}")
    pieces.append(goal_type.replace("_", " "))
    if metric_label:
        pieces.append(f"success metric: {metric_label}")
    if horizon_days:
        pieces.append(f"time horizon: {horizon_days} days")
    return ". ".join(pieces).strip(". ")


def _attempt_llm_parse(raw_text):
    api_key = getattr(settings, "OPENAI_API_KEY", None)
    model = os.getenv("OPENAI_TARGET_MODEL", "gpt-4.1-mini")
    if not api_key:
        return None

    try:
        from openai import OpenAI
    except Exception:
        return None

    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=model,
            temperature=0.2,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Convert a learner's natural language target into strict JSON. "
                        "Return keys: title, goal_type, subject, scope_label, goal_summary, "
                        "success_metric_label, target_value, target_unit, time_horizon_days, "
                        "recommended_minutes_per_day, recommended_sessions_per_week, ai_confidence."
                    ),
                },
                {
                    "role": "user",
                    "content": raw_text,
                },
            ],
        )
        content = response.choices[0].message.content or ""
        content = content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content
            if content.endswith("```"):
                content = content[:-3]
        content = content.strip()
        return json.loads(content)
    except Exception:
        return None


def parse_learning_target(raw_text):
    raw_text = (raw_text or "").strip()
    if not raw_text:
        raise ValueError("Target text is required.")

    llm = _attempt_llm_parse(raw_text) or {}

    subject = _clean_subject(llm.get("subject") or _infer_subject(raw_text))
    goal_type = _normalize_goal_type(llm.get("goal_type"), _infer_goal_type(raw_text))
    horizon_days = llm.get("time_horizon_days") or _parse_duration_days(raw_text)
    minutes_per_day = llm.get("recommended_minutes_per_day") or _parse_minutes_per_day(raw_text)
    metric_value = llm.get("target_value") or _parse_percentage_target(raw_text)

    try:
        horizon_days = int(horizon_days) if horizon_days is not None else None
    except (TypeError, ValueError):
        horizon_days = None

    try:
        minutes_per_day = int(float(minutes_per_day)) if minutes_per_day is not None else None
    except (TypeError, ValueError):
        minutes_per_day = None

    try:
        metric_value = float(metric_value) if metric_value is not None else None
    except (TypeError, ValueError):
        metric_value = None
    metric_unit = llm.get("target_unit") or ("percent" if metric_value is not None else "")
    target_date = timezone.localdate() + timedelta(days=horizon_days) if horizon_days else None

    if not minutes_per_day:
        minutes_per_day = 30 if goal_type != "habit_goal" else 45

    sessions_per_week = llm.get("recommended_sessions_per_week")
    if not sessions_per_week:
        sessions_per_week = 5 if minutes_per_day >= 30 else 4

    try:
        sessions_per_week = int(float(sessions_per_week))
    except (TypeError, ValueError):
        sessions_per_week = 5

    title = _clean_subject(llm.get("title") or _build_title(subject, goal_type))
    scope_label = _clean_subject(llm.get("scope_label") or raw_text[:120])
    metric_label = llm.get("success_metric_label") or (
        "daily consistency" if goal_type == "habit_goal" else ("quiz accuracy" if metric_unit == "percent" else "")
    )

    if not llm.get("goal_summary"):
        goal_summary = _build_summary(subject, goal_type, horizon_days, metric_label)
    else:
        goal_summary = llm["goal_summary"]

    confidence = llm.get("ai_confidence")
    if confidence is None:
        confidence = 0.42
        if subject:
            confidence += 0.18
        if horizon_days:
            confidence += 0.14
        if metric_value is not None:
            confidence += 0.16
        confidence = min(confidence, 0.92)

    return {
        "raw_text": raw_text,
        "title": title,
        "goal_type": goal_type,
        "subject": subject,
        "scope_label": scope_label,
        "goal_summary": goal_summary,
        "success_metric_label": metric_label,
        "target_value": metric_value,
        "target_unit": metric_unit,
        "time_horizon_days": horizon_days,
        "target_date": target_date,
        "recommended_minutes_per_day": int(minutes_per_day),
        "recommended_sessions_per_week": int(sessions_per_week),
        "ai_confidence": round(float(confidence), 2),
        "source_type": "AI" if llm else "HYBRID",
        "interpretation": {
            "llm": llm,
            "heuristic": {
                "subject": subject,
                "goal_type": goal_type,
                "time_horizon_days": horizon_days,
                "recommended_minutes_per_day": minutes_per_day,
                "recommended_sessions_per_week": sessions_per_week,
            },
        },
    }
