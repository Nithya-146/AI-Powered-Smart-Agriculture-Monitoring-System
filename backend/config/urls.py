from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/disease/', include('disease_detection.urls')),
    path('api/weather/', include('weather.urls')),
    path('api/irrigation/', include('irrigation.urls')),
    path('api/soil/', include('soil.urls')),
    path('api/pests/', include('pests.urls')),
    path('api/growth/', include('growth.urls')),
    path('api/chatbot/', include('chatbot.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
