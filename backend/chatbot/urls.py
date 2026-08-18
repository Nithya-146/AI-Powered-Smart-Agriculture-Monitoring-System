from django.urls import path
from .views import ChatbotView, ChatHistoryView

urlpatterns = [
    path('chat/', ChatbotView.as_view(), name='chatbot_chat'),
    path('history/', ChatHistoryView.as_view(), name='chatbot_history'),
]
