def score_strategies(learner, content):
    """
    Returns weighted scores for each pedagogical strategy.
    """

    scores = {
        "explore": 0.0,
        "review_light": 0.0,
        "guided_revision": 0.0,
        "deep_study": 0.0,
        "revise_priority": 0.0,
    }

    # ---------- BASED ON LEARNER ----------
    scores["review_light"] += learner["fatigue_degree"]
    scores["deep_study"] += learner["focus_degree"] * (1 - learner["fatigue_degree"])
    scores["guided_revision"] += learner["focus_degree"] * 0.6

    # ---------- BASED ON CONTENT ----------
    scores["deep_study"] += content["difficulty_degree"]
    scores["revise_priority"] += (
        content["importance_degree"] * content["neglect_degree"]
    )
    scores["guided_revision"] += content["difficulty_degree"] * 0.5

    # ---------- NORMALIZE ----------
    return scores