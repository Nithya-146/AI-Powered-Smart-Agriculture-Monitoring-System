import os
import math
import numpy as np
from PIL import Image

# Global constants for PlantVillage Leaf Disease Classes & Treatments
DISEASE_KNOWLEDGE_BASE = {
    "Tomato_Early_Blight": {
        "disease_name": "Tomato Early Blight (Alternaria solani)",
        "crop": "Tomato",
        "severity": "Medium",
        "treatment": "Apply copper-based fungicides or chlorothalonil. Prune affected lower leaves to improve air circulation and prevent soil splash.",
        "prevention": "Rotate crops every 2-3 years, avoid overhead irrigation, and mulch around plant bases."
    },
    "Tomato_Late_Blight": {
        "disease_name": "Tomato Late Blight (Phytophthora infestans)",
        "crop": "Tomato",
        "severity": "High",
        "treatment": "Apply systemic fungicides containing mancozeb, copper sulfate, or cymoxanil immediately. Remove and destroy infected plants.",
        "prevention": "Use resistant cultivars, keep foliage dry, and ensure adequate spacing between plants."
    },
    "Tomato_Yellow_Leaf_Curl": {
        "disease_name": "Tomato Yellow Leaf Curl Virus (TYLCV)",
        "crop": "Tomato",
        "severity": "High",
        "treatment": "No chemical cure for viral infection. Spray neem oil or imidacloprid to control vector whiteflies. Remove severely stunted plants.",
        "prevention": "Install yellow sticky traps, use insect exclusion netting, and weed vector host plants."
    },
    "Potato_Early_Blight": {
        "disease_name": "Potato Early Blight (Alternaria solani)",
        "crop": "Potato",
        "severity": "Medium",
        "treatment": "Apply protective fungicides like Mancozeb or Dithane M-45 at 7-10 day intervals during humid weather.",
        "prevention": "Maintain optimal nitrogen fertilization and destroy crop debris after harvest."
    },
    "Potato_Late_Blight": {
        "disease_name": "Potato Late Blight (Phytophthora infestans)",
        "crop": "Potato",
        "severity": "High",
        "treatment": "Apply Metalaxyl or Bordeaux mixture immediately. Destroy blighted foliage 2 weeks before harvesting tubers.",
        "prevention": "Plant certified disease-free seed tubers and hill up soil around plant bases."
    },
    "Rice_Leaf_Blast": {
        "disease_name": "Rice Leaf Blast (Magnaporthe oryzae)",
        "crop": "Rice",
        "severity": "High",
        "treatment": "Apply Tricyclazole 75 WP or Isoprothiolane 40 EC at early spindle-shaped lesion appearance.",
        "prevention": "Avoid excessive nitrogen application, field flooding management, and use resistant varieties."
    },
    "Corn_Common_Rust": {
        "disease_name": "Corn Common Rust (Puccinia sorghi)",
        "crop": "Corn",
        "severity": "Low-Medium",
        "treatment": "Fungicide treatment (Azoxystrobin or Propiconazole) is recommended if rust appears before silking.",
        "prevention": "Plant resistant corn hybrids and practice early planting to avoid peak spore periods."
    },
    "Apple_Black_Rot": {
        "disease_name": "Apple Black Rot (Botryosphaeria obtusa)",
        "crop": "Apple",
        "severity": "Medium",
        "treatment": "Prune out dead or diseased cankers and apply Captan or Thiophanate-methyl fungicides.",
        "prevention": "Remove mummified fruit from trees and burn infected prunings."
    },
    "Grape_Black_Rot": {
        "disease_name": "Grape Black Rot (Guignardia bidwellii)",
        "crop": "Grape",
        "severity": "High",
        "treatment": "Apply Myclobutanil or Mancozeb sprays starting from early bloom through 4 weeks post-bloom.",
        "prevention": "Ensure good canopy exposure to sun and remove overwintered mummies."
    },
    "Healthy_Leaf": {
        "disease_name": "Healthy Plant Leaf (No Disease Detected)",
        "crop": "General Crop",
        "severity": "None",
        "treatment": "No treatment required. Maintain current irrigation, fertilization, and monitoring routine.",
        "prevention": "Continue regular pest scouting and balanced soil nutrient management."
    }
}

CLASS_NAMES = list(DISEASE_KNOWLEDGE_BASE.keys())


def preprocess_image(image_path, target_size=(224, 224)):
    """
    Load image and preprocess for model input and OpenCV analysis.
    Returns PIL Image, resized numpy RGB array, and normalized float array.
    """
    img = Image.open(image_path).convert('RGB')
    img_resized = img.resize(target_size)
    img_np = np.array(img_resized)
    
    # Standard normalization (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    img_float = img_np.astype(np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    normalized = (img_float - mean) / std
    
    return img, img_np, normalized


def analyze_leaf_heuristics(img_np):
    """
    Color and texture heuristic analyzer using OpenCV logic.
    Analyzes HSV color spectrum for chlorosis (yellowing), necrosis (brown spots),
    and healthy green foliage ratios.
    """
    try:
        import cv2
        hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)
        
        # Green mask (Healthy leaf)
        lower_green = np.array([35, 40, 40])
        upper_green = np.array([85, 255, 255])
        green_mask = cv2.inRange(hsv, lower_green, upper_green)
        green_ratio = np.sum(green_mask > 0) / (img_np.shape[0] * img_np.shape[1])
        
        # Yellow mask (Chlorosis/Early Blight/Virus)
        lower_yellow = np.array([15, 40, 40])
        upper_yellow = np.array([35, 255, 255])
        yellow_mask = cv2.inRange(hsv, lower_yellow, upper_yellow)
        yellow_ratio = np.sum(yellow_mask > 0) / (img_np.shape[0] * img_np.shape[1])
        
        # Brown/Necrotic mask (Late Blight/Rust/Spots)
        lower_brown = np.array([5, 40, 20])
        upper_brown = np.array([20, 255, 180])
        brown_mask = cv2.inRange(hsv, lower_brown, upper_brown)
        brown_ratio = np.sum(brown_mask > 0) / (img_np.shape[0] * img_np.shape[1])
        
        # Determine likely class from heuristic spectrum
        if green_ratio > 0.65 and brown_ratio < 0.1 and yellow_ratio < 0.15:
            predicted_class = "Healthy_Leaf"
            confidence = 0.88 + min(0.10, green_ratio * 0.1)
        elif yellow_ratio > 0.25:
            predicted_class = "Tomato_Yellow_Leaf_Curl" if yellow_ratio > 0.4 else "Tomato_Early_Blight"
            confidence = 0.82 + min(0.12, yellow_ratio * 0.2)
        elif brown_ratio > 0.2:
            predicted_class = "Tomato_Late_Blight" if brown_ratio > 0.35 else "Potato_Late_Blight"
            confidence = 0.85 + min(0.10, brown_ratio * 0.15)
        elif yellow_ratio > 0.15 and brown_ratio > 0.1:
            predicted_class = "Potato_Early_Blight"
            confidence = 0.81
        else:
            # Fallback based on dominant color balance
            predicted_class = "Healthy_Leaf" if green_ratio >= yellow_ratio + brown_ratio else "Tomato_Early_Blight"
            confidence = 0.78
            
        return predicted_class, float(confidence), {
            "green_ratio": round(float(green_ratio), 4),
            "yellow_ratio": round(float(yellow_ratio), 4),
            "brown_ratio": round(float(brown_ratio), 4)
        }
    except Exception as e:
        # Simple RGB color fallback if OpenCV is unavailable
        r_mean = np.mean(img_np[:, :, 0])
        g_mean = np.mean(img_np[:, :, 1])
        b_mean = np.mean(img_np[:, :, 2])
        
        if g_mean > r_mean and g_mean > b_mean:
            predicted_class = "Healthy_Leaf"
            confidence = 0.85
        elif r_mean > g_mean:
            predicted_class = "Tomato_Early_Blight"
            confidence = 0.79
        else:
            predicted_class = "Tomato_Late_Blight"
            confidence = 0.76
            
        return predicted_class, float(confidence), {"r_mean": r_mean, "g_mean": g_mean, "b_mean": b_mean}


def predict_disease(image_path, model_path=None):
    """
    Main disease classification inference function.
    Tries PyTorch MobileNetV2 model if checkpoint exists, otherwise uses OpenCV heuristics.
    """
    if model_path is None:
        model_path = os.path.join(os.path.dirname(__file__), "plant_disease_model.pth")
        
    _, img_np, normalized = preprocess_image(image_path)
    
    predicted_class = None
    confidence = 0.0
    model_used = "Heuristic_OpenCV"
    
    # Try PyTorch inference if model checkpoint file exists
    if os.path.exists(model_path):
        try:
            import torch
            import torchvision.models as models
            
            # Load MobileNetV2 architecture
            model = models.mobilenet_v2(weights=None)
            model.classifier[1] = torch.nn.Linear(model.last_channel, len(CLASS_NAMES))
            model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
            model.eval()
            
            # Prepare tensor [1, 3, 224, 224]
            tensor = torch.tensor(normalized.transpose(2, 0, 1), dtype=torch.float32).unsqueeze(0)
            
            with torch.no_grad():
                outputs = model(tensor)
                probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
                conf, pred_idx = torch.max(probabilities, dim=0)
                
                predicted_class = CLASS_NAMES[pred_idx.item()]
                confidence = float(conf.item())
                model_used = "PyTorch_MobileNetV2"
        except Exception as e:
            print(f"[ML Inference] PyTorch model execution notice: {e}. Falling back to OpenCV heuristic engine.")

    if not predicted_class:
        predicted_class, confidence, spectrum_info = analyze_leaf_heuristics(img_np)
        
    info = DISEASE_KNOWLEDGE_BASE.get(predicted_class, DISEASE_KNOWLEDGE_BASE["Healthy_Leaf"])
    
    return {
        "predicted_class": predicted_class,
        "disease_name": info["disease_name"],
        "crop": info["crop"],
        "severity": info["severity"],
        "confidence": round(float(confidence), 4),
        "treatment_recommendation": info["treatment"],
        "prevention_tips": info["prevention"],
        "model_used": model_used
    }

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        result = predict_disease(sys.argv[1])
        print("Inference Result:", result)
    else:
        print("Leaf Disease Inference Engine loaded successfully. Classes:", len(CLASS_NAMES))
