from rest_framework import serializers
from .models import SoilReading

class SoilReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoilReading
        fields = '__all__'
