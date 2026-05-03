from django.conf import settings
from django.db import models
from resources.models import PDFResource

User = settings.AUTH_USER_MODEL


class StudySession(models.Model):

    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("PAUSED", "Paused"),
        ("IDLE", "Idle"),
        ("COMPLETED", "Completed"),
        ("ABANDONED", "Abandoned"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ACTIVE"
    )

    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    last_heartbeat = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user} - {self.status}"


class SessionEvent(models.Model):

    EVENT_CHOICES = [
        ("START", "Start"),
        ("PAUSE", "Pause"),
        ("RESUME", "Resume"),
        ("IDLE_START", "Idle Start"),
        ("IDLE_END", "Idle End"),
        ("END", "End"),
        ("HEARTBEAT", "Heartbeat"),
    ]

    session = models.ForeignKey(
        StudySession,
        related_name="events",
        on_delete=models.CASCADE
    )

    event_type = models.CharField(
        max_length=20,
        choices=EVENT_CHOICES
    )

    timestamp = models.DateTimeField(auto_now_add=True)

    metadata = models.JSONField(null=True, blank=True)


# NEW MODEL (ML BEHAVIOR DATASET)

class LearningEvent(models.Model):

    EVENT_TYPES = [
        ("RESOURCE_OPEN", "Resource Open"),
        ("RESOURCE_CLOSE", "Resource Close"),

        ("PAGE_VIEW", "Page View"),
        ("PAGE_LEAVE", "Page Leave"),

        ("SCROLL", "Scroll"),

        ("TAB_HIDDEN", "Tab Hidden"),
        ("TAB_VISIBLE", "Tab Visible"),

        ("NOTE_CREATED", "Note Created"),
        ("HIGHLIGHT", "Highlight"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    session = models.ForeignKey(
        StudySession,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    resource = models.ForeignKey(
        PDFResource,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    event_type = models.CharField(
        max_length=30,
        choices=EVENT_TYPES
    )

    page_number = models.IntegerField(
        null=True,
        blank=True
    )

    duration = models.FloatField(
        null=True,
        blank=True
    )

    scroll_depth = models.FloatField(
        null=True,
        blank=True
    )

    metadata = models.JSONField(
        default=dict,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["event_type"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.event_type} - {self.user}"


class ReviewItem(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="review_items"
    )
    pdf = models.ForeignKey(
        PDFResource,
        on_delete=models.CASCADE,
        related_name="review_items"
    )
    next_review_at = models.DateTimeField()
    last_reviewed_at = models.DateTimeField(null=True, blank=True)
    review_count = models.PositiveIntegerField(default=0)
    interval_days = models.PositiveIntegerField(default=1)
    ease_factor = models.FloatField(default=2.5)
    mastery_level = models.FloatField(default=0.0)
    last_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["next_review_at", "-mastery_level", "created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "pdf"],
                name="unique_review_item_per_user_pdf",
            )
        ]

    def __str__(self):
        return f"{self.user} - {self.pdf.display_title()}"
