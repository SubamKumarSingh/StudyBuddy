from .model_loader import (
    focus_model,
    engagement_model,
    difficulty_model
)

from .feature_builder import FEATURE_COLUMNS


def predict_behavior(features):
    row = [features.get(column, 0) for column in FEATURE_COLUMNS]
    X = [row]

    result = {}

    # ---------- FOCUS ----------
    if focus_model:
        focus = focus_model.predict(X)[0]
    else:
        focus = min(features.get("attention_ratio", 0.5), 1)

    result["focus_score"] = float(focus)

    # ---------- ENGAGEMENT ----------
    if engagement_model:
        engagement = engagement_model.predict(X)[0]
    else:
        engagement = min(features.get("engagement_proxy", 0.5), 1)

    result["engagement_score"] = float(engagement)

    # ---------- DIFFICULTY ----------
    if difficulty_model:
        difficulty = difficulty_model.predict(X)[0]
    else:
        difficulty = min(features.get("avg_page_time", 0) / 120, 1)

    result["difficulty_score"] = float(difficulty)

    return result
