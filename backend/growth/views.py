import math
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny
from .models import CropCycle
from .serializers import CropCycleSerializer

CROP_PROFILES = {
    "Tomato": {"duration_days": 120, "stages": [
        (15, "Germination & Seedling", "Keep soil moist, shield young shoots."),
        (45, "Vegetative Growth", "Apply high Nitrogen fertilizer and stake stems."),
        (90, "Flowering & Fruit Set", "Increase Potassium & Phosphorus. Prune suckers."),
        (110, "Maturity & Ripening", "Reduce watering to avoid fruit cracking."),
        (120, "Harvest Stage", "Pick fruits when uniformly firm and colored.")
    ]},
    "Wheat": {"duration_days": 135, "stages": [
        (20, "Germination & Tillering", "Maintain adequate field moisture for crown root initiation."),
        (60, "Jointing & Vegetative", "Top-dress with Urea at first node stage."),
        (95, "Heading & Flowering", "Irrigate at flowering stage to ensure grain formation."),
        (125, "Dough & Maturity", "Stop irrigation 10-14 days prior to harvest."),
        (135, "Harvest Stage", "Harvest when grain moisture drops below 14%.")
    ]},
    "Rice (Paddy)": {"duration_days": 130, "stages": [
        (18, "Nursery & Nursery Recovery", "Maintain shallow standing water layer (2-3 cm)."),
        (55, "Active Tillering & Panicle Initiation", "Keep field flooded 5 cm deep. Apply split N fertilizer."),
        (95, "Flowering & Grain Filling", "Ensure continuous water supply during milky stage."),
        (120, "Grain Ripening", "Drain field 10 days before harvesting."),
        (130, "Harvest Stage", "Harvest when 80-85% of panicles turn golden yellow.")
    ]},
    "Potato": {"duration_days": 105, "stages": [
        (15, "Sprout Emergence", "Moist warm soil required for sprout emergence."),
        (40, "Vegetative & Canopy Growth", "Perform earthing up to protect developing stolons."),
        (75, "Tuber Initiation & Bulking", "Maintain steady moisture; avoid drought stress."),
        (95, "Tuber Maturation", "Dehaulm 10-12 days before digging tubers."),
        (105, "Harvest Stage", "Harvest carefully to avoid skinning tubers.")
    ]},
    "Corn (Maize)": {"duration_days": 110, "stages": [
        (12, "Germination & V3 Stage", "Ensure weed-free seedbed."),
        (45, "Rapid Vegetative V6-V12", "Apply second split dose of Nitrogen."),
        (75, "Silking & Tasseling (R1)", "Critical water demand period. Do not allow water stress."),
        (100, "Grain Fill & Milk/Dough Stage", "Monitor for corn earworm and rust."),
        (110, "Harvest Stage", "Harvest when black layer forms at base of kernel.")
    ]}
}

class PredictGrowthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        crop = request.data.get('crop_type', 'Tomato')
        planting_date_str = request.data.get('planting_date', '')

        try:
            if planting_date_str:
                planting_date = datetime.strptime(planting_date_str, '%Y-%m-%d').date()
            else:
                planting_date = datetime.now().date() - timedelta(days=40)
        except ValueError:
            planting_date = datetime.now().date() - timedelta(days=40)

        profile = CROP_PROFILES.get(crop, CROP_PROFILES["Tomato"])
        total_duration = profile["duration_days"]

        today = datetime.now().date()
        days_passed = max(0, (today - planting_date).days)
        progress_pct = min(100.0, round((days_passed / total_duration) * 100, 1))

        # Logistic Growth Equation calculation: G(t) = 100 / (1 + exp(-k * (t - t0)))
        t0 = total_duration / 2.0
        k = 8.0 / total_duration
        current_growth_index = round(100.0 / (1.0 + math.exp(-k * (days_passed - t0))), 1)

        # Generate 10-step progress curve points
        curve_data = []
        step_days = total_duration / 10.0
        for i in range(11):
            day_num = int(i * step_days)
            growth_val = round(100.0 / (1.0 + math.exp(-k * (day_num - t0))), 1)
            target_date = planting_date + timedelta(days=day_num)
            curve_data.append({
                "day": day_num,
                "date": target_date.strftime('%b %d'),
                "growth_pct": growth_val,
                "is_current": abs(day_num - days_passed) <= step_days / 2
            })

        # Determine active stage
        current_stage = "Harvest Ready"
        advice = "Crop has reached full maturity. Prepare for harvesting."
        cumulative = 0
        for limit_day, stage_name, stage_advice in profile["stages"]:
            if days_passed <= limit_day:
                current_stage = stage_name
                advice = stage_advice
                break

        expected_harvest = planting_date + timedelta(days=total_duration)

        return Response({
            "crop_type": crop,
            "planting_date": planting_date.strftime('%Y-%m-%d'),
            "expected_harvest_date": expected_harvest.strftime('%Y-%m-%d'),
            "total_duration_days": total_duration,
            "days_passed": days_passed,
            "days_remaining": max(0, total_duration - days_passed),
            "linear_progress_pct": progress_pct,
            "logistic_growth_index": current_growth_index,
            "current_stage": current_stage,
            "stage_advice": advice,
            "growth_curve": curve_data
        })

class CropCycleListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = CropCycleSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return CropCycle.objects.filter(user=self.request.user).order_by('-planting_date')
        return CropCycle.objects.all().order_by('-planting_date')

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)
