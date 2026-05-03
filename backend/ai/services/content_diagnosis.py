from django.db.models import Avg
from resources.models import PDFResource
from ml.predict import predict_behavior


def diagnose_content(pdf: PDFResource):
    interactions = pdf.interactions.filter(event_type="view_closed")

    avg_duration = interactions.aggregate(
        avg=Avg("duration")
    )["avg"] or 0

    views = interactions.count()

    base_difficulty = min(avg_duration / 1800, 1)

    features = {
    "duration": avg_duration,
    "avg_page_time": avg_duration,
    "scroll_completion": min(avg_duration / 1800, 1),
    "tab_switch_rate": 0.2,
    "page_revisit_rate": views / 5,
    "attention_ratio": 0.5
    }

    ml = predict_behavior(features)

    ml_difficulty = ml["difficulty_score"]

    # ---------- DIFFICULTY (FUZZY) ----------
    difficulty_degree = (
        0.6 * base_difficulty +
        0.4 * ml_difficulty
    )


    if difficulty_degree < 0.35:
        difficulty = "low"
    elif difficulty_degree < 0.7:
        difficulty = "medium"
    else:
        difficulty = "high"

    # ---------- IMPORTANCE ----------
    importance_degree = 0.9 if pdf.tags and "exam" in pdf.tags else 0.4
    importance = "critical" if importance_degree > 0.7 else "normal"

    # ---------- NEGLECT ----------
    neglect_degree = 0.0
    if pdf.last_viewed_at:
        days = (pdf.last_viewed_at.date() - pdf.created_at.date()).days
        neglect_degree = min(days / 7, 1.0)

    if neglect_degree > 0.6:
        neglect = "high"
    elif neglect_degree > 0.3:
        neglect = "medium"
    else:
        neglect = "none"

    return {
        "difficulty": difficulty,
        "difficulty_degree": round(difficulty_degree, 2),
        "importance": importance,
        "importance_degree": round(importance_degree, 2),
        "neglect": neglect,
        "neglect_degree": round(neglect_degree, 2),
        "views": views,
        "avg_duration": int(avg_duration),
    }