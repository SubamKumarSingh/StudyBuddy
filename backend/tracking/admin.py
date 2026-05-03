# Register your models here.
from django.contrib import admin
from .models import StudySession, SessionEvent


@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "started_at", "ended_at")
    list_filter = ("status",)
    search_fields = ("user__email",)


@admin.register(SessionEvent)
class SessionEventAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "event_type", "timestamp")
    list_filter = ("event_type",)
    search_fields = ("session__user__email",)
