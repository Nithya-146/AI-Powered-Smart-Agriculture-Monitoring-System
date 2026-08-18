from django.db import models
from django.contrib.auth.models import User

class SoilReading(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    field_name = models.CharField(max_length=100, default='Main Field A')
    nitrogen = models.FloatField(help_text='Nitrogen N in mg/kg')
    phosphorus = models.FloatField(help_text='Phosphorus P in mg/kg')
    potassium = models.FloatField(help_text='Potassium K in mg/kg')
    ph = models.FloatField(help_text='Soil pH level (0-14)')
    moisture = models.FloatField(help_text='Soil Moisture percentage (0-100%)')
    organic_carbon = models.FloatField(help_text='Organic Carbon percentage (0-3%)')
    health_score = models.FloatField(default=85.0, help_text='Computed soil health score (0-100)')
    recommendations = models.TextField(blank=True, default='')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.field_name} - Score: {self.health_score}/100 ({self.timestamp.strftime('%Y-%m-%d')})"
