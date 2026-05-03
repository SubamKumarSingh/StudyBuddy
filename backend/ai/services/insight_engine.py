def generate_insights(focus, resources):

    insights = []

    if focus["focus_score"] < 40:
        insights.append(
            "Your focus score is currently low. Consider shorter study sessions."
        )

    if focus["consistency"] < 40:
        insights.append(
            "You study irregularly. Daily sessions improve retention."
        )

    hard_resources = [
        r for r in resources
        if r["difficulty_degree"] > 0.7
    ]

    if hard_resources:
        insights.append(
            "Some materials appear challenging. Try reviewing them in smaller sections."
        )

    if not insights:
        insights.append(
            "Your study habits look healthy. Keep maintaining consistency."
        )

    return insights