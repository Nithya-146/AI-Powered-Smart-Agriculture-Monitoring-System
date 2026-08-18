from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from pests.models import PestCalendar

class PestsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        PestCalendar.objects.create(
            crop="Tomato",
            pest_name="Test Whitefly",
            start_month=1,
            end_month=12,
            risk_level="High",
            symptoms="Yellowing",
            prevention_measures="Sticky traps"
        )

    def test_active_pests(self):
        url = reverse('active_pests')
        response = self.client.get(url, {'crop': 'Tomato', 'month': '8'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
