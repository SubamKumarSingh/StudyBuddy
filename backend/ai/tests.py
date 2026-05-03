from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APITestCase

from ai.models import LearningTarget
from knowledge.models import MCQAttempt
from resources.models import PDFResource


User = get_user_model()


class AIApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="planner",
            email="planner@example.com",
            password="TestPass@123",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.pdf = PDFResource.objects.create(
            user=self.user,
            drive_file_id="drive-55",
            mime_type="application/pdf",
            name="Calculus Revision",
            tags=["calculus", "exam"],
        )

    def test_learning_target_create_overview_and_complete(self):
        create_response = self.client.post(
            "/api/ai/targets/",
            {"raw_text": "Improve calculus to 85% in 3 weeks by studying 45 minutes a day"},
            format="json",
        )

        self.assertEqual(create_response.status_code, 201)
        target_id = create_response.data["id"]

        overview_response = self.client.get("/api/ai/targets/current/")
        self.assertEqual(overview_response.status_code, 200)
        self.assertTrue(overview_response.data["has_target"])
        self.assertEqual(overview_response.data["target"]["id"], target_id)

        complete_response = self.client.post(f"/api/ai/targets/{target_id}/complete/", format="json")
        self.assertEqual(complete_response.status_code, 200)

        target = LearningTarget.objects.get(id=target_id)
        self.assertEqual(target.status, "COMPLETED")

    def test_study_plan_generation_and_item_completion(self):
        response = self.client.post("/api/ai/study-plan/generate/", format="json")

        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data["items"]), 1)

        item_id = response.data["items"][0]["id"]
        action_response = self.client.post(
            f"/api/ai/study-plan/items/{item_id}/action/",
            {"action": "complete"},
            format="json",
        )

        self.assertEqual(action_response.status_code, 200)
        self.assertEqual(action_response.data["plan"]["items"][0]["status"], "COMPLETED")

    def test_submit_mcq_updates_history_summary(self):
        submit_response = self.client.post(
            "/api/knowledge/mcq/submit/",
            {
                "pdf_name": self.pdf.name,
                "topic": "calculus",
                "question": "What is the derivative of x^2?",
                "selected": "2x",
                "correct": "2x",
            },
            format="json",
        )

        self.assertEqual(submit_response.status_code, 200)
        self.assertTrue(MCQAttempt.objects.filter(user=self.user, topic="calculus").exists())

        history_response = self.client.get("/api/knowledge/mcq/history/")
        self.assertEqual(history_response.status_code, 200)
        self.assertEqual(history_response.data["summary"]["total"], 1)
        self.assertEqual(history_response.data["summary"]["accuracy"], 100)
