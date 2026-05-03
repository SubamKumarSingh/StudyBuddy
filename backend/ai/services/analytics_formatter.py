def difficulty_label(score):
    if score < 0.3:
        return "Easy"
    elif score < 0.6:
        return "Moderate"
    elif score < 0.8:
        return "Challenging"
    return "Very Challenging"


def focus_label(score):
    if score < 30:
        return "Low"
    elif score < 60:
        return "Developing"
    elif score < 80:
        return "Good"
    return "Excellent"


def fatigue_label(score):
    if score < 0.3:
        return "High Energy"
    elif score < 0.6:
        return "Normal"
    else:
        return "Fatigued"


def format_focus_state(focus_state):

    return {
        "focus_label": focus_label(focus_state["focus_score"]),
        "focus_score": focus_state["focus_score"],
        "consistency": focus_state["consistency"],
        "engagement": focus_state["engagement"],
        "recency": focus_state["recency"],
        "explanation": focus_state["explanation"],
    }


def format_content_diagnosis(content):

    label = difficulty_label(content["difficulty_degree"])

    return {
        "difficulty_label": label,
        "difficulty_percent": int(content["difficulty_degree"] * 100),

        "views": content["views"],
        "avg_duration": content["avg_duration"],

        "reasons": [
            f"Average reading session: {int(content['avg_duration']/60)} minutes",
            f"Opened {content['views']} times",
        ]
    }