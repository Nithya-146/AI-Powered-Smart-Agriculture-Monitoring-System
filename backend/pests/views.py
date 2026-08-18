from datetime import datetime
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import PestCalendar
from .serializers import PestCalendarSerializer

class ActivePestAlertListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = PestCalendarSerializer

    def get_queryset(self):
        queryset = PestCalendar.objects.all()
        crop_param = self.request.query_params.get('crop', '')
        month_param = self.request.query_params.get('month', '')

        if crop_param:
            queryset = queryset.filter(crop__iexact=crop_param)

        current_month = int(month_param) if month_param and month_param.isdigit() else datetime.now().month

        active_ids = []
        for pest in queryset:
            s_m = pest.start_month
            e_m = pest.end_month
            if s_m <= e_m:
                if s_m <= current_month <= e_m:
                    active_ids.append(pest.id)
            else: # Wraps around new year (e.g. Nov to Feb)
                if current_month >= s_m or current_month <= e_m:
                    active_ids.append(pest.id)

        return PestCalendar.objects.filter(id__in=active_ids).order_by('-risk_level')

class AllPestCalendarView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = PestCalendarSerializer
    queryset = PestCalendar.objects.all()
