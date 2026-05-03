from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("resources", "0003_note"),
    ]

    operations = [
        migrations.CreateModel(
            name="StudyPlan",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("target_date", models.DateField()),
                ("status", models.CharField(choices=[("ACTIVE", "Active"), ("COMPLETED", "Completed"), ("ARCHIVED", "Archived")], default="ACTIVE", max_length=20)),
                ("plan_score", models.FloatField(default=0)),
                ("summary", models.TextField(blank=True)),
                ("generation_context", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="study_plans", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-target_date", "-created_at"],
            },
        ),
        migrations.CreateModel(
            name="StudyPlanItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("topic", models.CharField(blank=True, max_length=255)),
                ("task_type", models.CharField(choices=[("REVIEW", "Review"), ("DEEP_STUDY", "Deep Study"), ("QUIZ", "Quiz"), ("RECOVERY", "Recovery")], max_length=20)),
                ("status", models.CharField(choices=[("PENDING", "Pending"), ("IN_PROGRESS", "In Progress"), ("COMPLETED", "Completed"), ("SKIPPED", "Skipped")], default="PENDING", max_length=20)),
                ("estimated_minutes", models.PositiveIntegerField(default=25)),
                ("priority_score", models.FloatField(default=0)),
                ("rationale", models.TextField(blank=True)),
                ("sort_order", models.PositiveIntegerField(default=0)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("pdf", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="study_plan_items", to="resources.pdfresource")),
                ("plan", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="items", to="ai.studyplan")),
            ],
            options={
                "ordering": ["sort_order", "-priority_score", "id"],
            },
        ),
    ]
