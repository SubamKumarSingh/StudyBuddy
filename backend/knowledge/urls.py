from django.urls import path
from .views import AIDashboardView, ChatTutorView, GlobalChatView, MCQGenerationView, MCQHistoryView, SubmitMCQView, TutorChatView


urlpatterns = [

    path("chat/",ChatTutorView.as_view()),
    path("dashboard/", AIDashboardView.as_view()),
    path("chat/global/", GlobalChatView.as_view()),
    path("chat/tutor/", TutorChatView.as_view()),
    path("mcq/generate/", MCQGenerationView.as_view()),
    path("mcq/submit/", SubmitMCQView.as_view()),
    path("mcq/history/", MCQHistoryView.as_view()),

]