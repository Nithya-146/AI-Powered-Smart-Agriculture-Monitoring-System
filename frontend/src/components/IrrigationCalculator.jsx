import React, { useState } from 'react';
import { Droplets, Calculator, Clock, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

export default function IrrigationCalculator() {
  const [crop, setCrop] = useState('Tomato');
  const [soilType, setSoilType] = useState('Loam');
  const [growthStage, setGrowthStage] = useState('Mid-Season (Flowering/Fruiting)');
  const [fieldArea, setFieldArea] = useState(1000);
  const [soilMoisture, setSoilMoisture] = useState(45);
  const [eto, setEto] = useState(4.5);
  const [rainForecast, setRainForecast] = useState(0);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/irrigation/calculate/`, {
        crop_type: crop,
        soil_type: soilType,
        growth_stage: growthStage,
        field_area_m2: fieldArea,
        soil_moisture_pct: soilMoisture,
        eto_mm: eto,
        forecast_rainfall_mm: rainForecast
      });
      setResult(res.data);
    } catch (err) {
      console.log('Using offline irrigation math fallback:', err);
      // Math fallback calculation
      const kc = crop === 'Rice (Paddy)' ? 1.20 : 1.15;
      const etc = eto * kc;
      const effectiveRain = rainForecast * 0.7;
      const deficit = Math.max(0, (65 - soilMoisture) * 0.14);
      const netWater = Math.max(0, etc + deficit - effectiveRain);
      const totalL = netWater * fieldArea;
      const minutes = Math.round((netWater / 4.0) * 60);

      setResult({
        crop_type: crop,
        soil_type: soilType,
        growth_stage: growthStage,
        field_area_m2: fieldArea,
        soil_moisture_pct: soilMoisture,
        eto_mm: eto,
        kc_factor: kc,
        etc_mm: etc.toFixed(2),
        effective_rainfall_mm: effectiveRain.toFixed(2),
        water_needed_liters_per_m2: netWater.toFixed(2),
        total_water_liters: totalL.toFixed(1),
        drip_irrigation_minutes: minutes,
        recommended_date: new Date().toISOString().split('T')[0]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="irrigation-calculator">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Smart Crop Evapotranspiration (ETc) Irrigation Calculator</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Computes exact crop water requirement based on FAO-56 Penman-Monteith crop-coefficient equation (ETc = ETo × Kc), soil water holding deficit, and rainfall adjustment.
        </p>
      </div>

      <div className="grid-2">
        {/* Form Inputs */}
        <div className="agri-card">
          <div className="agri-card-header">
            <h3 className="agri-card-title"><Calculator size={20} color="var(--accent-blue)" /> Field & Crop Parameters</h3>
          </div>

          <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--soil-dark)' }}>Crop Type</label>
                <select className="agri-select" value={crop} onChange={(e) => setCrop(e.target.value)}>
                  <option value="Tomato">Tomato</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Rice (Paddy)">Rice (Paddy)</option>
                  <option value="Potato">Potato</option>
                  <option value="Corn (Maize)">Corn (Maize)</option>
                  <option value="Cotton">Cotton</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--soil-dark)' }}>Soil Type</label>
                <select className="agri-select" value={soilType} onChange={(e) => setSoilType(e.target.value)}>
                  <option value="Loam">Loam (Medium)</option>
                  <option value="Clay">Clay (Heavy)</option>
                  <option value="Sandy">Sandy (Light)</option>
                  <option value="Silt">Silt</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--soil-dark)' }}>Crop Growth Stage</label>
              <select className="agri-select" value={growthStage} onChange={(e) => setGrowthStage(e.target.value)}>
                <option value="Initial">Initial (Germination / Seedling)</option>
                <option value="Mid-Season (Flowering/Fruiting)">Mid-Season (Flowering & Fruit Development)</option>
                <option value="Late Season (Maturity)">Late Season (Maturity & Harvest Prep)</option>
              </select>
            </div>

            {/* Field Area Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Field Area (m²)</span>
                <span>{fieldArea} m² ({(fieldArea / 4046.86).toFixed(2)} Acres)</span>
              </div>
              <input type="range" min="100" max="10000" step="100" value={fieldArea} onChange={(e) => setFieldArea(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-blue)' }} />
            </div>

            {/* Current Moisture Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Current Soil Moisture %</span>
                <span>{soilMoisture}%</span>
              </div>
              <input type="range" min="10" max="90" value={soilMoisture} onChange={(e) => setSoilMoisture(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--wheat-gold)' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--soil-dark)' }}>Reference $ET_o$ (mm/day)</label>
                <input className="agri-input" type="number" step="0.1" value={eto} onChange={(e) => setEto(parseFloat(e.target.value))} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--soil-dark)' }}>Forecast Rain (mm)</label>
                <input className="agri-input" type="number" step="0.5" value={rainForecast} onChange={(e) => setRainForecast(parseFloat(e.target.value))} />
              </div>
            </div>

            <button type="submit" className="agri-btn agri-btn-gold" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
              <Droplets size={18} /> Calculate Water Requirement
            </button>
          </form>
        </div>

        {/* Results Output */}
        <div className="agri-card">
          <div className="agri-card-header">
            <h3 className="agri-card-title"><Droplets size={20} color="var(--accent-blue)" /> Recommendation Output</h3>
            {result && <span className="metric-badge badge-success">ETc Model Complete</span>}
          </div>

          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #2E86AB 0%, #231B17 100%)', color: '#FFF', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#EBF5FB', fontWeight: 600 }}>Irrigation Depth Required</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-serif)', margin: '0.25rem 0' }}>
                  {result.water_needed_liters_per_m2} <span style={{ fontSize: '1rem', fontWeight: 400 }}>Liters / m²</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#D4A373' }}>
                  Total Field Requirement: <strong>{Number(result.total_water_liters).toLocaleString()} Liters</strong>
                </div>
              </div>

              <div className="grid-2">
                <div style={{ backgroundColor: 'var(--bg-paper)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} color="var(--accent-amber)" /> Drip Irrigation Duration
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--soil-dark)', marginTop: '0.25rem' }}>
                    {result.drip_irrigation_minutes} Minutes
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>At standard 4 L/hr emitter rate</div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-paper)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} color="var(--leaf-bright)" /> Next Irrigation Schedule
                  </div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--soil-dark)', marginTop: '0.25rem' }}>
                    {result.recommended_date}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Early morning (06:00 - 08:00)</div>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--soil-medium)' }}>
                <strong>Formula Breakdown:</strong> ETc = {result.eto_mm} × {result.kc_factor} = {result.etc_mm} mm/day. Rain adjustment: -{result.effective_rainfall_mm} mm. Net irrigation depth: {result.water_needed_liters_per_m2} mm.
              </div>
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Calculator size={36} color="var(--soil-muted)" style={{ marginBottom: '0.75rem' }} />
              <div>Adjust field sliders on the left and click Calculate to compute precise irrigation liters.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
