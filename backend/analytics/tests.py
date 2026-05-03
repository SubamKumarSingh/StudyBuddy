from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient, APITestCase

from resources.models import PDFResource, ResourceInteraction


User = get_user_model()


class AnalyticsApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="analyst",
            email="analyst@example.com",
            password="TestPass@123",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.pdf = PDFResource.objects.create(
            user=self.user,
            drive_file_id="drive-analytics",
            mime_type="application/pdf",
            name="Linear Algebra",
        )

    def test_study_time_endpoint_aggregates_recent_view_minutes(self):
        interaction = ResourceInteraction.objects.create(
            user=self.user,
            pdf=self.pdf,
            event_type="view_closed",
            duration=600,
        )
        interaction.timestamp = timezone.now() - timedelta(days=1)
        interaction.save(update_fields=["timestamp"])

        response = self.client.get("/api/analytics/study-time/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 7)
        self.assertIn(10, [row["minutes"] for row in response.data])

# Create your tests here.
