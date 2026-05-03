from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL


class PDFResource(models.Model):
    # ---- Ownership ----
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="pdf_resources"
    )

    # ---- Google Drive identity ----
    drive_file_id = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100)

    # ---- Display & user meaning ----
    name = models.CharField(max_length=255)
    title_override = models.CharField(
        max_length=255,
        blank=True,
        help_text="User-defined title"
    )
    notes = models.TextField(
        blank=True,
        help_text="User notes / intent"
    )
    tags = models.JSONField(
        default=list,
        blank=True,
        help_text="User-defined tags"
    )

    # ---- Passive engagement analytics ----
    view_count = models.PositiveIntegerField(default=0)
    total_view_time = models.PositiveIntegerField(
        default=0,
        help_text="Total time viewed in seconds"
    )
    last_viewed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    # ---- Lifecycle ----
    created_at = models.DateTimeField(auto_now_add=True)

    # ---- Helpers ----
    def display_title(self):
        return self.title_override or self.name

    def __str__(self):
        return f"{self.display_title()}"
    

class ResourceInteraction(models.Model):
    """
    Atomic interaction events.
    This is the foundation of learner state estimation.
    """

    EVENT_CHOICES = [
        ("view_opened", "View Opened"),
        ("view_closed", "View Closed"),
        ("metadata_updated", "Metadata Updated"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="resource_interactions"
    )
    pdf = models.ForeignKey(
        PDFResource,
        on_delete=models.CASCADE,
        related_name="interactions"
    )

    event_type = models.CharField(
        max_length=32,
        choices=EVENT_CHOICES
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    # Optional but AI-critical
    duration = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Seconds (for view_closed)"
    )

    def __str__(self):
        return f"{self.user} | {self.event_type} | {self.pdf_id}"
    




class Note(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notes"
    )

    title = models.CharField(max_length=255, default="Quick Note")
    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user}"