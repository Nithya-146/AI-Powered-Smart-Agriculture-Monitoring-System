# AI-Powered Smart Agriculture Monitoring System

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Nithya-146/AI-Powered-Smart-Agriculture-Monitoring-System)
[![Web Dashboard](https://img.shields.io/badge/Web-Dashboard-green)](http://localhost:5173/)

**Repository**: [https://github.com/Nithya-146/AI-Powered-Smart-Agriculture-Monitoring-System](https://github.com/Nithya-146/AI-Powered-Smart-Agriculture-Monitoring-System)  
**Local Web App**: `http://localhost:5173/`

A full-stack, precision-agriculture application designed for smallholder farmers. The system integrates real-time IoT-style soil sensor telemetry, AI-driven crop leaf disease classification, evapotranspiration ($ET_c$) smart irrigation modeling, Open-Meteo satellite weather crop suitability advice, seasonal pest risk alerts, logistic growth curve projections, and an AI conversational farming assistant.

---

## 🌿 Design Palette & Aesthetic
Built with an **Earthy, Data-Forward Precision-Agriculture Aesthetic**:
- **Warm Soil Dark/Brown**: `#231B17`, `#382B24`, `#5D473A`
- **Wheat Gold**: `#C89551`, `#F4E8D3`
- **Leaf Green Accents**: `#2D5A37`, `#447E51`, `#E8F2EA`
- **Paper Cream Background**: `#FBF9F4`
- **Typography**: Inter (UI precision data) & Merriweather (Serif headings)

---

## 🏗 System Architecture

```
                                  +------------------------+
                                  |   React (Vite) UI      |
                                  |  Precision Dashboard   |
                                  +-----------+------------+
                                              | (REST API / JSON)
                                              v
                                  +------------------------+
                                  |     Django 5.x REST    |
                                  |    Framework Backend   |
                                  +-----+---+----+---+-----+
                                        |   |    |   |
         +------------------------------+   |    |   +---------------------------------+
         |                                  |    |                                     |
         v                                  v    v                                     v
+------------------+         +----------------------+      +------------------+   +------------------+
| PyTorch CNN /    |         | Open-Meteo Weather   |      | ETc Irrigation   |   | Krishi Mitra AI  |
| OpenCV Fallback  |         | API (Geocoded)       |      | Math Engine      |   | Farmer Chatbot   |
| Disease Model    |         +----------------------+      +------------------+   +------------------+
+------------------+
```

---

## 🚀 Key Features & API Endpoint Matrix

### 1. Crop / Leaf Disease Detection (`/api/disease/`)
- **`POST /api/disease/predict/`**: Accepts image upload (`multipart/form-data`). Evaluates tensor execution via MobileNetV2 CNN architecture fine-tuned on PlantVillage dataset. If model weights are initializing, seamlessly executes OpenCV HSV color-spectrum & lesion texture heuristic analyzer. Returns predicted disease class, confidence score, severity grade, and organic/chemical remedies.
- **`GET /api/disease/scans/`**: Retrieves leaf diagnostic scan history log.

### 2. Weather-Based Crop Recommendations (`/api/weather/`)
- **`GET /api/weather/forecast/?location=...&latitude=...&longitude=...`**: Fetches live temperature, humidity, wind velocity, precipitation, and 7-day forecast from Open-Meteo API. Maps conditions against rule-based agronomic thresholds to recommend top suitable crops and sowing windows.

### 3. Smart Irrigation Calculation (`/api/irrigation/`)
- **`POST /api/irrigation/calculate/`**: Computes crop water requirement using the FAO-56 Penman-Monteith crop-coefficient model:
  $$ET_c = ET_o \times K_c$$
  Adjusts net required depth for soil water holding capacity deficit and forecast rainfall ($R_{eff}$). Outputs Liters/$m^2$, Total Field Liters, and Drip System run duration (minutes).
- **`GET /api/irrigation/history/`**: Retrieves past irrigation calculations.

### 4. Soil Parameter Dashboard (`/api/soil/`)
- **`GET /api/soil/readings/`** & **`POST /api/soil/readings/`**: Telemetry CRUD API for Nitrogen (N), Phosphorus (P), Potassium (K), pH, Moisture %, and Organic Carbon (OC). Automatically computes a composite 0-100 Soil Health Score and outputs nutrient deficiency alerts.

### 5. Pest & Disease Alert Calendar (`/api/pests/`)
- **`GET /api/pests/active/?crop=...&month=...`**: Returns seasonal pest outbreak alerts for the active month (e.g. Wheat Aphid, Yellow Stem Borer, Whitefly vector, Fall Armyworm) complete with symptoms, cultural prevention, organic bio-controls (neem, parasitoids), and chemical interventions.

### 6. Crop Growth Prediction (`/api/growth/`)
- **`POST /api/growth/predict/`**: Models crop canopy growth trajectory using a sigmoid logistic function:
  $$G(t) = \frac{100}{1 + e^{-k(t - t_0)}}$$
  Returns active growth stage (Germination, Vegetative, Flowering/Fruiting, Maturity, Harvest), days elapsed, days remaining, and stage management checklists.

### 7. AI Chatbot for Farmers (`/api/chatbot/`)
- **`POST /api/chatbot/chat/`**: Accepts farming questions and returns concise, actionable advice tailored for smallholder agronomy. Integrates with OpenAI / Anthropic APIs when configured in `.env`, or falls back to an intelligent domain knowledge engine.

### 8. User Authentication (`/api/accounts/`)
- **`POST /api/accounts/register/`** & **`POST /api/accounts/login/`**: Django REST Framework SimpleJWT authentication.

---

## 🛠 Local Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 1. Backend Setup
```bash
# Navigate to repository root
cd "d:\AI-Powered Smart Agriculture Monitoring Sysytem"

# Activate virtual environment
.\venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run migrations & seed data fixtures
python backend/manage.py makemigrations accounts disease_detection weather irrigation soil pests growth chatbot
python backend/manage.py migrate
python backend/manage.py loaddata backend/pests/fixtures/pest_calendar.json
python backend/manage.py loaddata backend/soil/fixtures/sample_soil_readings.json

# Run unit tests
python backend/manage.py test accounts weather irrigation soil pests growth chatbot

# Start Django Development Server
python backend/manage.py runserver 0.0.0.0:8000
```

### 2. ML Model Weights Export (Optional)
To export the initialized PyTorch MobileNetV2 checkpoint:
```bash
python ml_models/export_model.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## ⚠️ Model Limitations & Agronomic Caveats
1. **Disease Model Accuracy**: The MobileNetV2 CNN classifier is trained on controlled PlantVillage leaf images. Field lighting variations, background foliage noise, or blur can impact confidence scores. The OpenCV color spectrum fallback provides robust sanity bounds.
2. **Weather API**: Open-Meteo free API does not require an API key, but relies on internet connectivity for live geocoding.
3. **Soil Telemetry**: Automated Soil Health Scores assume standard crop ranges. Specific crops with extreme pH or salinity tolerances should be verified with local Krishi Vigyan Kendra (KVK) soil extension centers.
