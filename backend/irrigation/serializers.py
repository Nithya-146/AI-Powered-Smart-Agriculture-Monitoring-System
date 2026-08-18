from rest_framework import serializers
from .models import IrrigationCalculation

class IrrigationCalculationSerializer(serializers.ModelSerializer):
    class Meta:
        model = IrrigationCalculation
        fields = '__all__'
