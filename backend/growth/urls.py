from django.urls import path
from .views import PredictGrowthView, CropCycleListCreateView

urlpatterns = [
    path('predict/', PredictGrowthView.as_view(), name='growth_predict'),
    path('crops/', CropCycleListCreateView.as_view(), name='crop_cycles'),
]
