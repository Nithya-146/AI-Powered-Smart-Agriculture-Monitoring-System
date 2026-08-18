from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

class IrrigationAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.calc_url = reverse('irrigation_calculate')
        self.history_url = reverse('irrigation_history')

    def test_calculate_irrigation(self):
        payload = {
            "crop_type": "Tomato",
            "soil_type": "Loam",
            "growth_stage": "Mid-Season (Flowering/Fruiting)",
            "field_area_m2": 500.0,
            "soil_moisture_pct": 40.0,
            "eto_mm": 5.0,
            "forecast_rainfall_mm": 0.0
        }
        response = self.client.post(self.calc_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('total_water_liters', response.data)
        self.assertGreater(response.data['total_water_liters'], 0)

    def test_irrigation_history(self):
        response = self.client.get(self.history_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
