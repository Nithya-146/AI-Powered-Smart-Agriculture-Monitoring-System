from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SoilReadingViewSet

router = DefaultRouter()
router.register(r'readings', SoilReadingViewSet, basename='soil-reading')

urlpatterns = [
    path('', include(router.urls)),
]
