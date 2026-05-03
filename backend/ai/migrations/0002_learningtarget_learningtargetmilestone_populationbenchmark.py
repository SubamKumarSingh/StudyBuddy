from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("ai", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="LearningTarget",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("raw_text", models.TextField()),
                ("title", models.CharField(max_length=255)),
                ("goal_type", models.CharField(choices=[("deadline_goal", "Deadline Goal"), ("habit_goal", "Habit Goal"), ("mastery_goal", "Mastery Goal"), ("project_goal", "Project Goal"), ("custom_goal", "Custom Goal")], default="custom_goal", max_length=32)),
                ("status", models.CharField(choices=[("ACTIVE", "Active"), ("ON_HOLD", "On Hold"), ("COMPLETED", "Completed"), ("ARCHIVED", "Archived")], default="ACTIVE", max_length=20)),
                ("source_type", models.CharField(choices=[("AI", "AI"), ("MANUAL", "Manual"), ("HYBRID", "Hybrid")], default="AI", max_length=20)),
                ("subject", models.CharField(blank=True, max_length=255)),
                ("scope_label", models.CharField(blank=True, max_length=255)),
                ("goal_summary", models.TextField(blank=True)),
                ("success_metric_label", models.CharField(blank=True, max_length=255)),
                ("target_value", models.FloatField(blank=True, null=True)),
                ("current_value", models.FloatField(default=0)),
                ("target_unit", models.CharField(blank=True, max_length=32)),
                ("time_horizon_days", models.PositiveIntegerField(blank=True, null=True)),
                ("start_date", models.DateField(default=django.utils.timezone.localdate)),
                ("target_date", models.DateField(blank=True, null=True)),
                ("ai_confidence", models.FloatField(default=0)),
                ("estimated_total_minutes", models.PositiveIntegerField(default=0)),
                ("completed_minutes", models.PositiveIntegerField(default=0)),
                ("completed_sessions", models.PositiveIntegerField(default=0)),
                ("progress_percent", models.FloatField(default=0)),
                ("mastery_percent", models.FloatField(default=0)),
                ("pace_multiplier", models.FloatField(default=1.0)),
                ("recommended_minutes_per_day", models.PositiveIntegerField(default=30)),
                ("recommended_sessions_per_week", models.PositiveIntegerField(default=5)),
                ("benchmark_context", models.JSONField(blank=True, default=dict)),
                ("interpretation", models.JSONField(blank=True, default=dict)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="learning_targets", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-updated_at", "-created_at"],
            },
        ),
        migrations.CreateModel(
            name="PopulationBenchmark",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("benchmark_key", models.CharField(max_length=255, unique=True)),
                ("goal_type", models.CharField(blank=True, max_length=32)),
                ("subject", models.CharField(blank=True, max_length=255)),
                ("sample_size", models.PositiveIntegerField(default=0)),
                ("median_days_to_completion", models.FloatField(default=0)),
                ("median_minutes_per_day", models.FloatField(default=0)),
                ("median_sessions_per_week", models.FloatField(default=0)),
                ("median_mastery_percent", models.FloatField(default=0)),
                ("median_progress_percent", models.FloatField(default=0)),
                ("completion_rate", models.FloatField(default=0)),
                ("recommended_minutes_per_day", models.FloatField(default=0)),
                ("recommended_sessions_per_week", models.FloatField(default=0)),
                ("payload", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["-updated_at", "benchmark_key"],
            },
        ),
        migrations.CreateModel(
            name="LearningTargetMilestone",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("sort_order", models.PositiveIntegerField(default=0)),
                ("due_date", models.DateField(blank=True, null=True)),
                ("planned_minutes", models.PositiveIntegerField(default=0)),
                ("status", models.CharField(choices=[("PENDING", "Pending"), ("IN_PROGRESS", "In Progress"), ("COMPLETED", "Completed"), ("SKIPPED", "Skipped")], default="PENDING", max_length=20)),
                ("progress_percent", models.FloatField(default=0)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("target", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="milestones", to="ai.learningtarget")),
            ],
            options={
                "ordering": ["sort_order", "id"],
            },
        ),
    ]
