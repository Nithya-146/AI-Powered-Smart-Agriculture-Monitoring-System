from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import SoilReading
from .serializers import SoilReadingSerializer

def compute_soil_metrics(n, p, k, ph, moisture, oc):
    """
    Computes a composite Soil Health Score (0-100) and actionable nutrient recommendations.
    """
    score = 100.0
    notes = []

    # Nitrogen (Target: 140 - 280 mg/kg)
    if n < 140:
        defic = (140 - n) / 140 * 25
        score -= defic
        notes.append(f"Low Nitrogen ({n:.1f} mg/kg): Apply Urea or Farm Yard Manure (FYM).")
    elif n > 280:
        score -= 5
        notes.append(f"Excess Nitrogen ({n:.1f} mg/kg): Reduce nitrogenous fertilizer to avoid vegetative overgrowth.")

    # Phosphorus (Target: 20 - 50 mg/kg)
    if p < 20:
        defic = (20 - p) / 20 * 20
        score -= defic
        notes.append(f"Low Phosphorus ({p:.1f} mg/kg): Apply Single Super Phosphate (SSP) or DAP.")
    elif p > 60:
        score -= 4
        notes.append(f"High Phosphorus ({p:.1f} mg/kg): Hold phosphorus applications to prevent micronutrient lock.")

    # Potassium (Target: 150 - 300 mg/kg)
    if k < 150:
        defic = (150 - k) / 150 * 20
        score -= defic
        notes.append(f"Low Potassium ({k:.1f} mg/kg): Apply Muriate of Potash (MOP).")

    # pH (Target: 6.0 - 7.5)
    if ph < 6.0:
        score -= (6.0 - ph) * 12
        notes.append(f"Acidic Soil (pH {ph:.2f}): Apply agricultural lime (calcium carbonate).")
    elif ph > 7.5:
        score -= (ph - 7.5) * 12
        notes.append(f"Alkaline Soil (pH {ph:.2f}): Apply gypsum or elemental sulfur.")

    # Moisture (Target: 40 - 70%)
    if moisture < 40:
        score -= (40 - moisture) * 0.5
        notes.append(f"Low Soil Moisture ({moisture:.1f}%): Irrigation required soon.")

    # Organic Carbon (Target: 0.75 - 1.5%)
    if oc < 0.75:
        score -= (0.75 - oc) * 20
        notes.append(f"Low Organic Carbon ({oc:.2f}%): Incorporate green manure, biochar, or compost.")

    final_score = round(max(10.0, min(100.0, score)), 1)
    rec_text = " | ".join(notes) if notes else "Soil parameters are within optimal agronomic ranges!"
    return final_score, rec_text

class SoilReadingViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = SoilReadingSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return SoilReading.objects.filter(user=self.request.user).order_by('-timestamp')
        return SoilReading.objects.all().order_by('-timestamp')

    def perform_create(self, serializer):
        n = float(self.request.data.get('nitrogen', 160))
        p = float(self.request.data.get('phosphorus', 30))
        k = float(self.request.data.get('potassium', 210))
        ph = float(self.request.data.get('ph', 6.8))
        moisture = float(self.request.data.get('moisture', 52))
        oc = float(self.request.data.get('organic_carbon', 0.95))

        health_score, recs = compute_soil_metrics(n, p, k, ph, moisture, oc)
        user = self.request.user if self.request.user.is_authenticated else None

        serializer.save(
            user=user,
            health_score=health_score,
            recommendations=recs
        )
