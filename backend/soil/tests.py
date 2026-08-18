from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from soil.models import SoilReading

class SoilAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.list_url = '/api/soil/readings/'

    def test_soil_reading_crud(self):
        payload = {
            "field_name": "Test Field Delta",
            "nitrogen": 170.0,
            "phosphorus": 32.0,
            "potassium": 210.0,
            "ph": 6.8,
            "moisture": 55.0,
            "organic_carbon": 1.05
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('health_score', response.data)
        self.assertGreaterEqual(response.data['health_score'], 80.0)

        get_resp = self.client.get(self.list_url)
        self.assertEqual(get_resp.status_code, status.HTTP_200_OK)
