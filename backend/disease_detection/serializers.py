from rest_framework import serializers
from .models import DiseaseScan

class DiseaseScanSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiseaseScan
        fields = '__all__'
