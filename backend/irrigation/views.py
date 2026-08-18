from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny
from .models import IrrigationCalculation
from .serializers import IrrigationCalculationSerializer

# FAO Crop Coefficients (Kc)
KC_TABLE = {
    "Wheat": {"Initial": 0.4, "Mid-Season (Flowering/Fruiting)": 1.15, "Late Season (Maturity)": 0.4},
    "Rice (Paddy)": {"Initial": 1.05, "Mid-Season (Flowering/Fruiting)": 1.20, "Late Season (Maturity)": 0.90},
    "Tomato": {"Initial": 0.6, "Mid-Season (Flowering/Fruiting)": 1.15, "Late Season (Maturity)": 0.80},
    "Potato": {"Initial": 0.5, "Mid-Season (Flowering/Fruiting)": 1.15, "Late Season (Maturity)": 0.75},
    "Corn (Maize)": {"Initial": 0.3, "Mid-Season (Flowering/Fruiting)": 1.20, "Late Season (Maturity)": 0.60},
    "Cotton": {"Initial": 0.35, "Mid-Season (Flowering/Fruiting)": 1.15, "Late Season (Maturity)": 0.70},
}

SOIL_WATER_CAPACITY = {
    "Sandy": 50,    # mm water holding capacity per meter soil
    "Loam": 140,
    "Clay": 180,
    "Silt": 160
}

class CalculateIrrigationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        crop = request.data.get('crop_type', 'Tomato')
        soil_type = request.data.get('soil_type', 'Loam')
        stage = request.data.get('growth_stage', 'Mid-Season (Flowering/Fruiting)')
        field_area = float(request.data.get('field_area_m2', 1000.0))
        soil_moisture = float(request.data.get('soil_moisture_pct', 45.0))
        eto = float(request.data.get('eto_mm', 4.5))
        forecast_rain = float(request.data.get('forecast_rainfall_mm', 0.0))

        # Determine Kc factor
        crop_kc_dict = KC_TABLE.get(crop, KC_TABLE["Tomato"])
        kc = crop_kc_dict.get(stage, 1.0)

        # ETc calculation: Crop Evapotranspiration
        etc_mm = eto * kc

        # Effective rainfall (approx 70% of total rainfall is effective)
        effective_rain = forecast_rain * 0.70

        # Soil moisture deficit calculation
        target_moisture = 65.0 # Optimal target moisture %
        capacity = SOIL_WATER_CAPACITY.get(soil_type, 140)
        moisture_deficit_pct = max(0.0, target_moisture - soil_moisture)
        moisture_deficit_mm = (moisture_deficit_pct / 100.0) * (capacity * 0.3) # Root zone depth ~0.3m

        # Net daily water requirement in mm (1 mm = 1 L/m2)
        net_water_mm = etc_mm + moisture_deficit_mm - effective_rain
        net_water_mm = max(0.0, round(net_water_mm, 2))

        total_liters = round(net_water_mm * field_area, 1)

        # Calculate drip irrigation time (assuming standard 4 L/hr per m2 emitter density)
        drip_minutes = int((net_water_mm / 4.0) * 60) if net_water_mm > 0 else 0

        calculation = IrrigationCalculation.objects.create(
            user=request.user if request.user.is_authenticated else None,
            crop_type=crop,
            soil_type=soil_type,
            growth_stage=stage,
            field_area_m2=field_area,
            soil_moisture_pct=soil_moisture,
            eto_mm=eto,
            kc_factor=kc,
            etc_mm=round(etc_mm, 2),
            effective_rainfall_mm=round(effective_rain, 2),
            water_needed_liters_per_m2=net_water_mm,
            total_water_liters=total_liters,
            drip_irrigation_minutes=drip_minutes
        )

        serializer = IrrigationCalculationSerializer(calculation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class IrrigationHistoryView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = IrrigationCalculationSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return IrrigationCalculation.objects.filter(user=self.request.user).order_by('-recommended_date')
        return IrrigationCalculation.objects.all().order_by('-recommended_date')[:15]
