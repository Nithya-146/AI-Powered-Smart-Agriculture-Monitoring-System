from django.db import models
from django.contrib.auth.models import User

class DiseaseScan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    image = models.ImageField(upload_to='leaf_scans/%Y/%m/%d/')
    predicted_class = models.CharField(max_length=100)
    disease_name = models.CharField(max_length=200)
    crop = models.CharField(max_length=100)
    severity = models.CharField(max_length=50)
    confidence = models.FloatField()
    treatment_recommendation = models.TextField()
    prevention_tips = models.TextField(blank=True, default='')
    model_used = models.CharField(max_length=100, default='MobileNetV2')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.crop} - {self.disease_name} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
