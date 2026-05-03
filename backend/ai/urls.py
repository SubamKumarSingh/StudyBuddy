from django.urls import path
from .views import (
    FocusStateView,
    GenerateStudyPlanView,
    LearningTargetCompleteView,
    LearningTargetCreateView,
    LearningTargetInterpretView,
    LearningTargetMilestoneActionView,
    LearningTargetOverviewView,
    PedagogicalDecisionView,
    PopulationBenchmarkView,
    StudyPlanItemActionView,
    TodayStudyPlanView,
)

urlpatterns = [
    path("focus-state/", FocusStateView.as_view()),
    path("decision/", PedagogicalDecisionView.as_view()),
    path("study-plan/", TodayStudyPlanView.as_view()),
    path("study-plan/generate/", GenerateStudyPlanView.as_view()),
    path("study-plan/items/<int:item_id>/action/", StudyPlanItemActionView.as_view()),
    path("targets/", LearningTargetCreateView.as_view()),
    path("targets/current/", LearningTargetOverviewView.as_view()),
    path("targets/interpret/", LearningTargetInterpretView.as_view()),
    path("targets/<int:target_id>/complete/", LearningTargetCompleteView.as_view()),
    path(
        "targets/milestones/<int:milestone_id>/action/",
        LearningTargetMilestoneActionView.as_view(),
    ),
    path("targets/benchmark/", PopulationBenchmarkView.as_view()),
    # path("coach/", StudyCoachView.as_view()),
    # path("recommendation/", RecommendationView.as_view())
]
