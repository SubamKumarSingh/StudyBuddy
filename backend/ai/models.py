from django.conf import settings
from django.db import models
from django.utils import timezone

from resources.models import PDFResource


class StudyPlan(models.Model):
    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("COMPLETED", "Completed"),
        ("ARCHIVED", "Archived"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="study_plans",
    )
    target_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ACTIVE",
    )
    plan_score = models.FloatField(default=0)
    summary = models.TextField(blank=True)
    generation_context = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-target_date", "-created_at"]

    def __str__(self):
        return f"{self.user} - {self.target_date} - {self.status}"


class StudyPlanItem(models.Model):
    TASK_TYPE_CHOICES = [
        ("REVIEW", "Review"),
        ("DEEP_STUDY", "Deep Study"),
        ("QUIZ", "Quiz"),
        ("RECOVERY", "Recovery"),
    ]

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
        ("SKIPPED", "Skipped"),
    ]

    plan = models.ForeignKey(
        StudyPlan,
        on_delete=models.CASCADE,
        related_name="items",
    )
    pdf = models.ForeignKey(
        PDFResource,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="study_plan_items",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    topic = models.CharField(max_length=255, blank=True)
    task_type = models.CharField(max_length=20, choices=TASK_TYPE_CHOICES)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING",
    )
    estimated_minutes = models.PositiveIntegerField(default=25)
    priority_score = models.FloatField(default=0)
    rationale = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "-priority_score", "id"]

    def __str__(self):
        return f"{self.plan_id} - {self.title}"


class LearningTarget(models.Model):
    GOAL_TYPE_CHOICES = [
        ("deadline_goal", "Deadline Goal"),
        ("habit_goal", "Habit Goal"),
        ("mastery_goal", "Mastery Goal"),
        ("project_goal", "Project Goal"),
        ("custom_goal", "Custom Goal"),
    ]

    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("ON_HOLD", "On Hold"),
        ("COMPLETED", "Completed"),
        ("ARCHIVED", "Archived"),
    ]

    SOURCE_CHOICES = [
        ("AI", "AI"),
        ("MANUAL", "Manual"),
        ("HYBRID", "Hybrid"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="learning_targets",
    )
    raw_text = models.TextField()
    title = models.CharField(max_length=255)
    goal_type = models.CharField(
        max_length=32,
        choices=GOAL_TYPE_CHOICES,
        default="custom_goal",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ACTIVE",
    )
    source_type = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default="AI",
    )
    subject = models.CharField(max_length=255, blank=True)
    scope_label = models.CharField(max_length=255, blank=True)
    goal_summary = models.TextField(blank=True)
    success_metric_label = models.CharField(max_length=255, blank=True)
    target_value = models.FloatField(null=True, blank=True)
    current_value = models.FloatField(default=0)
    target_unit = models.CharField(max_length=32, blank=True)
    time_horizon_days = models.PositiveIntegerField(null=True, blank=True)
    start_date = models.DateField(default=timezone.localdate)
    target_date = models.DateField(null=True, blank=True)
    ai_confidence = models.FloatField(default=0)
    estimated_total_minutes = models.PositiveIntegerField(default=0)
    completed_minutes = models.PositiveIntegerField(default=0)
    completed_sessions = models.PositiveIntegerField(default=0)
    progress_percent = models.FloatField(default=0)
    mastery_percent = models.FloatField(default=0)
    pace_multiplier = models.FloatField(default=1.0)
    recommended_minutes_per_day = models.PositiveIntegerField(default=30)
    recommended_sessions_per_week = models.PositiveIntegerField(default=5)
    benchmark_context = models.JSONField(default=dict, blank=True)
    interpretation = models.JSONField(default=dict, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-created_at"]

    def __str__(self):
        return f"{self.user} - {self.title}"


class LearningTargetMilestone(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
        ("SKIPPED", "Skipped"),
    ]

    target = models.ForeignKey(
        LearningTarget,
        on_delete=models.CASCADE,
        related_name="milestones",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    due_date = models.DateField(null=True, blank=True)
    planned_minutes = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING",
    )
    progress_percent = models.FloatField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.target_id} - {self.title}"


class PopulationBenchmark(models.Model):
    benchmark_key = models.CharField(max_length=255, unique=True)
    goal_type = models.CharField(max_length=32, blank=True)
    subject = models.CharField(max_length=255, blank=True)
    sample_size = models.PositiveIntegerField(default=0)
    median_days_to_completion = models.FloatField(default=0)
    median_minutes_per_day = models.FloatField(default=0)
    median_sessions_per_week = models.FloatField(default=0)
    median_mastery_percent = models.FloatField(default=0)
    median_progress_percent = models.FloatField(default=0)
    completion_rate = models.FloatField(default=0)
    recommended_minutes_per_day = models.FloatField(default=0)
    recommended_sessions_per_week = models.FloatField(default=0)
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "benchmark_key"]

    def __str__(self):
        return self.benchmark_key
