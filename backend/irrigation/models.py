from django.db import models
from django.contrib.auth.models import User

class IrrigationCalculation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    crop_type = models.CharField(max_length=100)
    soil_type = models.CharField(max_length=100, default='Loam')
    growth_stage = models.CharField(max_length=100, default='Mid-Season (Flowering/Fruiting)')
    field_area_m2 = models.FloatField(default=1000.0) # Field size in square meters
    soil_moisture_pct = models.FloatField(default=45.0) # Current measured moisture %
    eto_mm = models.FloatField(default=4.5) # Reference Evapotranspiration
    kc_factor = models.FloatField(default=1.15) # Crop Coefficient
    etc_mm = models.FloatField(default=5.175) # Crop Evapotranspiration
    effective_rainfall_mm = models.FloatField(default=0.0)
    water_needed_liters_per_m2 = models.FloatField()
    total_water_liters = models.FloatField()
    drip_irrigation_minutes = models.IntegerField(default=60)
    recommended_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.crop_type} - {self.total_water_liters:.1f} Liters ({self.recommended_date})"
