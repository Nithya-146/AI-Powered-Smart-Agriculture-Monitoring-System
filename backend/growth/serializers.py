from rest_framework import serializers
from .models import CropCycle

class CropCycleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropCycle
        fields = '__all__'
