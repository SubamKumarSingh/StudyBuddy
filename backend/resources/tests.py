from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APITestCase

from resources.models import Note, PDFResource, ResourceInteraction


User = get_user_model()


class ResourceApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="resourceuser",
            email="resource@example.com",
            password="TestPass@123",
        )
        self.other_user = User.objects.create_user(
            username="otherresource",
            email="otherresource@example.com",
            password="TestPass@123",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    @patch("resources.views.index_pdf")
    def test_register_pdf_and_list_registered_pdfs(self, mocked_index_pdf):
        response = self.client.post(
            "/api/resources/pdfs/register/",
            {
                "id": "drive-123",
                "name": "Algorithms.pdf",
                "mimeType": "application/pdf",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        mocked_index_pdf.assert_called_once()

        list_response = self.client.get("/api/resources/pdfs/")
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]["name"], "Algorithms.pdf")

    def test_pdf_open_close_updates_usage_metrics(self):
        pdf = PDFResource.objects.create(
            user=self.user,
            drive_file_id="drive-9",
            mime_type="application/pdf",
            name="Physics Notes",
        )

        open_response = self.client.post(f"/api/resources/pdfs/{pdf.id}/open/", format="json")
        close_response = self.client.post(
            f"/api/resources/pdfs/{pdf.id}/close/",
            {"duration": 600},
            format="json",
        )

        self.assertEqual(open_response.status_code, 200)
        self.assertEqual(close_response.status_code, 200)

        pdf.refresh_from_db()
        self.assertEqual(pdf.view_count, 1)
        self.assertEqual(pdf.total_view_time, 600)
        self.assertEqual(ResourceInteraction.objects.filter(pdf=pdf).count(), 2)

    def test_notes_are_user_scoped_for_listing_and_deletion(self):
        own_note = Note.objects.create(user=self.user, title="Own", content="My note")
        Note.objects.create(user=self.other_user, title="Other", content="Hidden note")

        list_response = self.client.get("/api/resources/notes/")
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]["title"], "Own")

        delete_response = self.client.delete(f"/api/resources/notes/{own_note.id}/")
        self.assertEqual(delete_response.status_code, 204)
        self.assertFalse(Note.objects.filter(id=own_note.id).exists())
