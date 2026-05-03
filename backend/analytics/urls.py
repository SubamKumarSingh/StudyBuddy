from django.urls import path
from .views import (
    SessionFeaturesView,
    StudyTimeView,
    FocusAnalyticsView,
    ContentAnalyticsView,
    GlobalAnalyticsView,
    StudyHeatmapView,
    FocusHistoryView,
    AIInsightsView
)

urlpatterns = [
    path("study-time/", StudyTimeView.as_view()),
    path("focus/", FocusAnalyticsView.as_view()),
    path("content/", ContentAnalyticsView.as_view()),
    path("global/", GlobalAnalyticsView.as_view()),
    path("heatmap/", StudyHeatmapView.as_view()),
    path("focus-history/", FocusHistoryView.as_view()),
    path("insights/", AIInsightsView.as_view()),
    path("session-features/<int:session_id>/",SessionFeaturesView.as_view()),
]
