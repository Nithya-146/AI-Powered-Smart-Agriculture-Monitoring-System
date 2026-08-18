from django.urls import path
from .views import CalculateIrrigationView, IrrigationHistoryView

urlpatterns = [
    path('calculate/', CalculateIrrigationView.as_view(), name='irrigation_calculate'),
    path('history/', IrrigationHistoryView.as_view(), name='irrigation_history'),
]
