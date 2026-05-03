from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APITestCase

from resources.models import PDFResource
from tracking.models import LearningEvent, ReviewItem, SessionEvent, StudySession


User = get_user_model()


class TrackingApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="tracker",
            email="tracker@example.com",
            password="TestPass@123",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.pdf = PDFResource.objects.create(
            user=self.user,
            drive_file_id="drive-1",
            mime_type="application/pdf",
            name="Discrete Mathematics",
            tags=["math"],
        )

    def test_session_lifecycle_start_pause_resume_end_and_analytics(self):
        start_response = self.client.post("/api/tracking/start/", format="json")
        self.assertEqual(start_response.status_code, 200)

        session_id = start_response.data["session_id"]
        self.assertTrue(
            StudySession.objects.filter(id=session_id, user=self.user, status="ACTIVE").exists()
        )

        self.assertEqual(self.client.post(f"/api/tracking/pause/{session_id}/").status_code, 200)
        self.assertEqual(self.client.post(f"/api/tracking/resume/{session_id}/").status_code, 200)
        self.assertEqual(self.client.post(f"/api/tracking/end/{session_id}/").status_code, 200)

        analytics_response = self.client.get(f"/api/tracking/analytics/{session_id}/")
        self.assertEqual(analytics_response.status_code, 200)
        self.assertIn("effective_seconds", analytics_response.data)
        self.assertEqual(SessionEvent.objects.filter(session_id=session_id).count(), 4)

    def test_duplicate_active_session_is_blocked(self):
        self.client.post("/api/tracking/start/", format="json")

        response = self.client.post("/api/tracking/start/", format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"], "Session already running")

    def test_learning_event_logging_links_owned_session_and_resource(self):
        session = StudySession.objects.create(user=self.user, status="ACTIVE")

        response = self.client.post(
            "/api/tracking/event/",
            {
                "event_type": "RESOURCE_OPEN",
                "session_id": session.id,
                "resource_id": self.pdf.id,
                "page_number": 3,
                "duration": 120,
                "scroll_depth": 0.8,
                "metadata": {"source": "viewer"},
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        event = LearningEvent.objects.get(id=response.data["event_id"])
        self.assertEqual(event.session_id, session.id)
        self.assertEqual(event.resource_id, self.pdf.id)
        self.assertEqual(event.metadata["source"], "viewer")

    def test_review_completion_creates_queue_item(self):
        response = self.client.post(
            f"/api/tracking/reviews/{self.pdf.id}/complete/",
            {"score": 0.9},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(ReviewItem.objects.filter(user=self.user, pdf=self.pdf).exists())

        queue_response = self.client.get("/api/tracking/reviews/queue/")
        self.assertEqual(queue_response.status_code, 200)
        self.assertEqual(queue_response.data["upcoming_count"], 1)

# Create your tests here.
