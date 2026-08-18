from django.urls import path
from .views import ActivePestAlertListView, AllPestCalendarView

urlpatterns = [
    path('active/', ActivePestAlertListView.as_view(), name='active_pests'),
    path('all/', AllPestCalendarView.as_view(), name='all_pests'),
]
