from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User

class AccountsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('auth_register')
        self.login_url = reverse('token_obtain_pair')

    def test_user_registration(self):
        payload = {
            "username": "testfarmer",
            "email": "farmer@example.com",
            "password": "SecurePassword123!",
            "first_name": "Ramesh",
            "last_name": "Kumar"
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['username'], 'testfarmer')

    def test_user_login(self):
        User.objects.create_user(username="farmer2", password="Password123!")
        payload = {"username": "farmer2", "password": "Password123!"}
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
