from rest_framework import serializers
from .models import PestCalendar

class PestCalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = PestCalendar
        fields = '__all__'
