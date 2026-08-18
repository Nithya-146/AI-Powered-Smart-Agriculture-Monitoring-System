from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

class ChatbotAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_chatbot_interaction(self):
        url = reverse('chatbot_chat')
        payload = {"message": "How do I fix yellow leaves in tomato?", "conversation_id": "test_conv_1"}
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('bot_response', response.data)
        self.assertIn('Nitrogen', response.data['bot_response'])
