def assess_readiness(learner):
    """
    Determines what kind of learning is appropriate NOW.
    """

    if learner["status"] == "new":
        return "onboarding"

    if learner["fatigue"] == "high":
        return "restorative"

    if learner["focus_level"] == "low":
        return "light"

    if learner["focus_level"] == "moderate":
        return "reinforcement"

    return "deep"