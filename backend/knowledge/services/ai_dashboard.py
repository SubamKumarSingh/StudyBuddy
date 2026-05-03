from ai.services.focus_model import compute_focus_state
from ai.services.learner_diagnosis import diagnose_learner
from ai.services.pedagogy import pedagogical_engine

from .performance_analyzer import analyze_performance


def build_dashboard(user):

    focus = compute_focus_state(user)

    learner = diagnose_learner(user)

    pedagogy = pedagogical_engine(user)

    performance = analyze_performance(user)

    return {
        "focus": focus,
        "learner": learner,
        "pedagogy": pedagogy,
        "performance": performance
    }