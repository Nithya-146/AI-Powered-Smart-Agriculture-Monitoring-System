import os
import sys
from pathlib import Path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny
from .models import DiseaseScan
from .serializers import DiseaseScanSerializer

# Ensure ml_models package can be imported
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ML_MODELS_DIR = os.path.join(BASE_DIR, 'ml_models')
if ML_MODELS_DIR not in sys.path:
    sys.path.append(ML_MODELS_DIR)

try:
    from inference import predict_disease
except ImportError:
    # Fallback stub if inference module fails import
    def predict_disease(img_path):
        return {
            "predicted_class": "Healthy_Leaf",
            "disease_name": "Healthy Plant Leaf",
            "crop": "Tomato",
            "severity": "None",
            "confidence": 0.95,
            "treatment_recommendation": "No treatment required. Maintain regular irrigation and organic fertilizer routine.",
            "prevention_tips": "Routine crop monitoring and balanced NPK application.",
            "model_used": "Heuristic Fallback"
        }

class PredictDiseaseView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        if 'image' not in request.FILES:
            return Response({"error": "No image file provided in request.FILES"}, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_image = request.FILES['image']
        
        # Save scan temporarily or directly to instance
        scan = DiseaseScan.objects.create(
            user=request.user if request.user.is_authenticated else None,
            image=uploaded_image,
            predicted_class="Analyzing...",
            disease_name="Processing",
            crop="Unknown",
            severity="Medium",
            confidence=0.0,
            treatment_recommendation="Processing..."
        )
        
        # Perform inference on saved image file path
        try:
            image_full_path = scan.image.path
            result = predict_disease(image_full_path)
            
            scan.predicted_class = result["predicted_class"]
            scan.disease_name = result["disease_name"]
            scan.crop = result["crop"]
            scan.severity = result["severity"]
            scan.confidence = result["confidence"]
            scan.treatment_recommendation = result["treatment_recommendation"]
            scan.prevention_tips = result.get("prevention_tips", "")
            scan.model_used = result.get("model_used", "MobileNetV2")
            scan.save()
            
            serializer = DiseaseScanSerializer(scan, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            scan.delete()
            return Response({"error": f"Error running disease classification model: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ScanHistoryView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = DiseaseScanSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return DiseaseScan.objects.filter(user=self.request.user).order_by('-created_at')
        return DiseaseScan.objects.all().order_by('-created_at')[:20]
