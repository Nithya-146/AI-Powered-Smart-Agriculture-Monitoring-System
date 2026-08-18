import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

CROP_WEATHER_RULES = [
    {
        "crop": "Wheat",
        "temp_min": 10,
        "temp_max": 25,
        "humidity_min": 40,
        "humidity_max": 70,
        "sowing_window": "October - November",
        "description": "Thrives in cool winter temperatures with moderate humidity."
    },
    {
        "crop": "Rice (Paddy)",
        "temp_min": 20,
        "temp_max": 38,
        "humidity_min": 60,
        "humidity_max": 95,
        "sowing_window": "June - July (Kharif)",
        "description": "Requires warm temperature and high humidity/water availability."
    },
    {
        "crop": "Tomato",
        "temp_min": 15,
        "temp_max": 32,
        "humidity_min": 50,
        "humidity_max": 80,
        "sowing_window": "August - October / Jan - Feb",
        "description": "Ideal in mild climates. Vulnerable to frost and high heat humidity fungal diseases."
    },
    {
        "crop": "Potato",
        "temp_min": 12,
        "temp_max": 24,
        "humidity_min": 50,
        "humidity_max": 75,
        "sowing_window": "October - November",
        "description": "Best tuber growth occurs at cool 15-20°C soil temperatures."
    },
    {
        "crop": "Corn (Maize)",
        "temp_min": 18,
        "temp_max": 35,
        "humidity_min": 45,
        "humidity_max": 80,
        "sowing_window": "June - July / Oct - Nov",
        "description": "Adaptable crop, sensitive to severe frost and waterlogging."
    },
    {
        "crop": "Cotton",
        "temp_min": 21,
        "temp_max": 37,
        "humidity_min": 40,
        "humidity_max": 75,
        "sowing_window": "April - May",
        "description": "Requires long frost-free warm period with sunny days during boll opening."
    }
]

class WeatherForecastView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        location_query = request.query_params.get('location', '')
        lat = request.query_params.get('latitude', '28.6139')
        lon = request.query_params.get('longitude', '77.2090')
        location_name = "New Delhi, India"

        # Geocoding lookup if location string provided
        if location_query:
            try:
                geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={location_query}&count=1&language=en&format=json"
                geo_res = requests.get(geo_url, timeout=5).json()
                if geo_res.get('results'):
                    first_res = geo_res['results'][0]
                    lat = first_res['latitude']
                    lon = first_res['longitude']
                    location_name = f"{first_res.get('name')}, {first_res.get('country', '')}"
            except Exception as e:
                print(f"[Weather Geocoding Error]: {e}")

        try:
            forecast_url = (
                f"https://api.open-meteo.com/v1/forecast?"
                f"latitude={lat}&longitude={lon}&"
                f"current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&"
                f"daily=temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration&"
                f"timezone=auto"
            )
            weather_data = requests.get(forecast_url, timeout=8).json()

            current = weather_data.get('current', {})
            current_temp = current.get('temperature_2m', 26.5)
            current_humidity = current.get('relative_humidity_2m', 62)
            current_wind = current.get('wind_speed_10m', 12.0)
            current_precip = current.get('precipitation', 0.0)

            daily = weather_data.get('daily', {})
            daily_max = daily.get('temperature_2m_max', [30.0]*7)
            daily_min = daily.get('temperature_2m_min', [20.0]*7)
            daily_precip = daily.get('precipitation_sum', [0.0]*7)
            daily_et0 = daily.get('et0_fao_evapotranspiration', [4.5]*7)

            # Rule-based crop recommendations
            suitable_crops = []
            for item in CROP_WEATHER_RULES:
                match_score = 100
                # Temperature penalty
                if current_temp < item['temp_min']:
                    match_score -= (item['temp_min'] - current_temp) * 8
                elif current_temp > item['temp_max']:
                    match_score -= (current_temp - item['temp_max']) * 8
                
                # Humidity penalty
                if current_humidity < item['humidity_min']:
                    match_score -= (item['humidity_min'] - current_humidity) * 2
                elif current_humidity > item['humidity_max']:
                    match_score -= (current_humidity - item['humidity_max']) * 2

                score = max(10, min(99, int(match_score)))
                status_label = "Highly Recommended" if score >= 80 else ("Suitable" if score >= 60 else "Risky / Off-season")
                
                suitable_crops.append({
                    "crop": item["crop"],
                    "suitability_score": score,
                    "status": status_label,
                    "sowing_window": item["sowing_window"],
                    "description": item["description"]
                })

            suitable_crops.sort(key=lambda x: x['suitability_score'], reverse=True)

            # Weather Risk Alerts
            alerts = []
            if current_temp > 40:
                alerts.append({"type": "warning", "title": "Extreme Heat Warning", "detail": "Temperatures above 40°C. Increase irrigation frequency to reduce crop heat stress."})
            elif current_temp < 5:
                alerts.append({"type": "danger", "title": "Frost Alert", "detail": "Temperatures near freezing. Provide thermal row covers or smudge burning for sensitive crops."})
            
            if current_humidity > 85:
                alerts.append({"type": "info", "title": "High Humidity Disease Risk", "detail": "Humid conditions favour fungal blights and mildews. Inspect crop foliage daily."})
            
            if sum(daily_precip[:3]) > 30:
                alerts.append({"type": "info", "title": "Heavy Rain Forecast", "detail": "Substantial rainfall expected over next 3 days. Postpone fertilizer/pesticide sprays."})

            return Response({
                "location": location_name,
                "latitude": float(lat),
                "longitude": float(lon),
                "current": {
                    "temperature": current_temp,
                    "humidity": current_humidity,
                    "wind_speed": current_wind,
                    "precipitation": current_precip
                },
                "forecast_7_day": {
                    "time": daily.get('time', []),
                    "temp_max": daily_max,
                    "temp_min": daily_min,
                    "precipitation": daily_precip,
                    "et0_evapotranspiration": daily_et0
                },
                "crop_recommendations": suitable_crops,
                "alerts": alerts
            })
        except Exception as e:
            return Response({"error": f"Failed to fetch weather data: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
