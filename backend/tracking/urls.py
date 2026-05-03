from django.urls import path
from .views import *

urlpatterns = [
    path("start/", start_session),
    path("pause/<int:session_id>/", pause_session),
    path("resume/<int:session_id>/", resume_session),
    path("end/<int:session_id>/", end_session),
    path("active/", active_session),
    path("idle-start/<int:session_id>/", idle_start),
    path("idle-end/<int:session_id>/", idle_end),
    path("heartbeat/<int:session_id>/", heartbeat),
    path("analytics/<int:session_id>/", session_analytics),
    path("summary/", study_summary),
    path("event/", LearningEventView.as_view()),
    path("reviews/queue/", ReviewQueueView.as_view()),
    path("reviews/<int:pdf_id>/complete/", ReviewCompleteView.as_view()),


]
