from django.db import models
from django.contrib.auth.models import User

class CropCycle(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    crop_type = models.CharField(max_length=100)
    planting_date = models.DateField()
    field_area_acres = models.FloatField(default=2.5)
    variety_name = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=50, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.crop_type} ({self.planting_date.strftime('%Y-%m-%d')})"
