from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("tracking", "0002_learningevent"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("resources", "0003_note"),
    ]

    operations = [
        migrations.CreateModel(
            name="ReviewItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("next_review_at", models.DateTimeField()),
                ("last_reviewed_at", models.DateTimeField(blank=True, null=True)),
                ("review_count", models.PositiveIntegerField(default=0)),
                ("interval_days", models.PositiveIntegerField(default=1)),
                ("ease_factor", models.FloatField(default=2.5)),
                ("mastery_level", models.FloatField(default=0.0)),
                ("last_score", models.FloatField(default=0.0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("pdf", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="review_items", to="resources.pdfresource")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="review_items", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["next_review_at", "-mastery_level", "created_at"],
            },
        ),
        migrations.AddConstraint(
            model_name="reviewitem",
            constraint=models.UniqueConstraint(fields=("user", "pdf"), name="unique_review_item_per_user_pdf"),
        ),
    ]
