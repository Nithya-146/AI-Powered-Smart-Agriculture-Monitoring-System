import os
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny
from .models import ChatMessage
from .serializers import ChatMessageSerializer

AGRI_KNOWLEDGE_BASE = [
    {
        "keywords": ["yellow", "leaf", "leaves", "chlorosis"],
        "answer": "Yellowing leaves usually signal Nitrogen deficiency or over-watering. **Action**: Apply Urea (20kg/acre) or spray 1% NPK (19:19:19) solution. Ensure field drainage if waterlogged."
    },
    {
        "keywords": ["fertilizer", "urea", "dap", "npk", "dose", "nutrient"],
        "answer": "For optimal yield, base fertilizer on soil testing. General recommendation for cereal crops: **120 kg N : 60 kg P2O5 : 40 kg K2O per hectare**. Apply 50% N + full P & K at sowing, rest N in 2 split doses."
    },
    {
        "keywords": ["irrigation", "water", "drip", "frequency"],
        "answer": "Crucial stages for watering: **Wheat**: Crown Root Initiation (21 days) & Flowering. **Rice**: Panicle initiation & Grain filling. Use drip irrigation to save up to 40% water."
    },
    {
        "keywords": ["pest", "insect", "worm", "caterpillar", "spray", "neem"],
        "answer": "For organic pest control, spray **Neem Oil emulsion (5ml/liter water)** with liquid soap. For chewing pests like armyworms, use *Bacillus thuringiensis* (Bt) or Emamectin Benzoate 5 SG."
    },
    {
        "keywords": ["disease", "fungus", "blight", "spot", "rot"],
        "answer": "Fungal blights spread rapidly in high humidity. **Remedy**: Spray Copper Oxychloride (3g/L) or Mancozeb (2.5g/L). Avoid overhead sprinklers in early morning."
    },
    {
        "keywords": ["scheme", "pm kisan", "subsidy", "loan", "government"],
        "answer": "Key schemes for smallholders: **PM-KISAN** (₹6,000/yr direct transfer), **Kisan Credit Card (KCC)** for low-interest crop loans, and **PM Fasal Bima Yojana** for crop insurance against weather loss."
    }
]

def generate_agri_bot_response(user_text):
    openai_key = os.environ.get('OPENAI_API_KEY')
    anthropic_key = os.environ.get('ANTHROPIC_API_KEY')

    # Try OpenAI API if key provided
    if openai_key:
        try:
            resp = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": "You are Krishi Mitra, an expert AI Agricultural Advisor for Indian smallholder farmers. Provide concise, practical, clear advice on soil, crops, weather, and pests in under 120 words."},
                        {"role": "user", "content": user_text}
                    ],
                    "max_tokens": 250
                },
                timeout=7
            )
            data = resp.json()
            if "choices" in data and len(data["choices"]) > 0:
                return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"[OpenAI Chatbot Error]: {e}")

    # Domain Knowledge Base Match Fallback
    text_lower = user_text.lower()
    for item in AGRI_KNOWLEDGE_BASE:
        if any(kw in text_lower for kw in item["keywords"]):
            return item["answer"]

    # General Helpful Agriculture Fallback
    return (
        "Namaste! As your Krishi Mitra AI farming assistant, I recommend checking your **Soil Health Score** "
        "and current **Weather Forecast** on the dashboard. For specific crop queries, specify your crop name, "
        "soil type, or pest symptoms for targeted guidance."
    )

class ChatbotView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_message = request.data.get('message', '').strip()
        conversation_id = request.data.get('conversation_id', 'default_session')

        if not user_message:
            return Response({"error": "Message text is required."}, status=status.HTTP_400_BAD_REQUEST)

        user_user = request.user if request.user.is_authenticated else None

        # Save user message
        ChatMessage.objects.create(
            user=user_user,
            conversation_id=conversation_id,
            sender='user',
            text=user_message
        )

        # Generate response
        bot_response_text = generate_agri_bot_response(user_message)

        # Save bot response
        bot_msg = ChatMessage.objects.create(
            user=user_user,
            conversation_id=conversation_id,
            sender='bot',
            text=bot_response_text
        )

        return Response({
            "conversation_id": conversation_id,
            "user_message": user_message,
            "bot_response": bot_response_text,
            "timestamp": bot_msg.timestamp
        }, status=status.HTTP_200_OK)

class ChatHistoryView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        cid = self.request.query_params.get('conversation_id', 'default_session')
        if self.request.user.is_authenticated:
            return ChatMessage.objects.filter(user=self.request.user, conversation_id=cid).order_by('timestamp')
        return ChatMessage.objects.filter(conversation_id=cid).order_by('timestamp')
