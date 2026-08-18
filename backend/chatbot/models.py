from django.db import models
from django.contrib.auth.models import User

class ChatMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    conversation_id = models.CharField(max_length=100, default='default')
    sender = models.CharField(max_length=20, choices=[('user', 'User'), ('bot', 'Bot')])
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.sender.upper()}] {self.text[:40]}... ({self.timestamp.strftime('%H:%M')})"
