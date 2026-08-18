from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

class WeatherAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('weather_forecast')

    def test_get_weather_forecast(self):
        response = self.client.get(self.url, {'latitude': '28.6139', 'longitude': '77.2090'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('current', response.data)
        self.assertIn('crop_recommendations', response.data)
        self.assertGreater(len(response.data['crop_recommendations']), 0)
