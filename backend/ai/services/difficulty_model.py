from django.db.models import Avg

from resources.models import PDFResource

from ml.predict import predict_behavior


def estimate_difficulty(pdf: PDFResource):

    interactions = pdf.interactions.filter(event_type="view_closed")

    if not interactions.exists():
        return {
            "difficulty": 0.3,
            "explanation": "Not enough data yet."
        }

    avg_duration = interactions.aggregate(
        avg=Avg("duration")
    )["avg"] or 0

    views = interactions.count()

    heuristic_difficulty = 0

    if avg_duration > 1800:
        heuristic_difficulty += 0.4
    elif avg_duration > 900:
        heuristic_difficulty += 0.25

    if views > 3:
        heuristic_difficulty += 0.3

    if pdf.tags and "exam" in pdf.tags:
        heuristic_difficulty += 0.2

    heuristic_difficulty = min(heuristic_difficulty, 1.0)

    # ---------- ML DIFFICULTY ----------

    features = {

        "duration": avg_duration,
        "avg_page_time": avg_duration,
        "scroll_completion": 0.7,
        "tab_switch_rate": 1,
        "attention_ratio": 0.6

    }

    ml_prediction = predict_behavior(features)

    ml_difficulty = ml_prediction["difficulty_score"]

    final_difficulty = (0.7 * heuristic_difficulty + 0.3 * ml_difficulty)

    explanation = (
        f"Average reading session is {int(avg_duration/60)} minutes. "
        f"Opened {views} times."
    )

    return {
        "difficulty": round(final_difficulty, 2),
        "explanation": explanation
    }