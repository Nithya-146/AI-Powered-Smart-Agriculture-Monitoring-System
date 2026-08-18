from django.urls import path
from .views import PredictDiseaseView, ScanHistoryView

urlpatterns = [
    path('predict/', PredictDiseaseView.as_view(), name='disease_predict'),
    path('scans/', ScanHistoryView.as_view(), name='disease_scans'),
]
