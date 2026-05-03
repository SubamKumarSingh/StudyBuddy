from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APITestCase


User = get_user_model()


class AccountApiTests(APITestCase):
    def setUp(self):
        self.password = "TestPass@123"
        self.user = User.objects.create_user(
            username="learner",
            email="learner@example.com",
            password=self.password,
        )
        self.client = APIClient()

    def test_email_login_returns_jwt_tokens(self):
        response = self.client.post(
            "/api/accounts/login/",
            {"email": self.user.email, "password": self.password},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_rejects_invalid_password(self):
        response = self.client.post(
            "/api/accounts/login/",
            {"email": self.user.email, "password": "wrong-pass"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.data)

    def test_me_and_password_management_flow(self):
        self.client.force_authenticate(user=self.user)

        me_response = self.client.get("/api/accounts/me/")
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.data["email"], self.user.email)
        self.assertTrue(me_response.data["has_password"])

        password_response = self.client.post(
            "/api/accounts/password/",
            {
                "old_password": self.password,
                "new_password": "BetterPass@456",
            },
            format="json",
        )

        self.assertEqual(password_response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("BetterPass@456"))
