import React, { useEffect, useState } from 'react';
import { Sprout, Sun, Droplets, Activity, AlertTriangle, MessageSquare, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

export default function DashboardOverview({ onNavigate }) {
  const [soilScore, setSoilScore] = useState(85.0);
  const [weatherData, setWeatherData] = useState(null);
  const [latestScan, setLatestScan] = useState(null);
  const [pestAlerts, setPestAlerts] = useState([]);
  const [irrigationInfo, setIrrigationInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch Weather
        const wRes = await axios.get(`${API_BASE}/weather/forecast/?latitude=28.6139&longitude=77.2090`);
        setWeatherData(wRes.data);

        // Fetch Soil Readings
        const sRes = await axios.get(`${API_BASE}/soil/readings/`);
        if (sRes.data && sRes.data.length > 0) {
          setSoilScore(sRes.data[0].health_score);
        }

        // Fetch Recent Scans
        const dRes = await axios.get(`${API_BASE}/disease/scans/`);
        if (dRes.data && dRes.data.length > 0) {
          setLatestScan(dRes.data[0]);
        }

        // Fetch Active Pest Alerts
        const pRes = await axios.get(`${API_BASE}/pests/active/?month=${new Date().getMonth() + 1}`);
        setPestAlerts(pRes.data);

        // Fetch Recent Irrigation
        const iRes = await axios.get(`${API_BASE}/irrigation/history/`);
        if (iRes.data && iRes.data.length > 0) {
          setIrrigationInfo(iRes.data[0]);
        }
      } catch (err) {
        console.log('Using default mock values for offline dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-overview">
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #2D5A37 0%, #382B24 100%)',
        color: '#FFF',
        borderRadius: 'var(--radius-md)',
        padding: '1.75rem',
        marginBottom: '1.75rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', color: '#D4A373', fontWeight: 600 }}>Precision Agriculture Command Center</span>
          <h1 style={{ color: '#FBF9F4', marginTop: '0.25rem', fontSize: '1.75rem' }}>Smart Farm Monitor</h1>
          <p style={{ color: '#D3C4B8', fontSize: '0.9rem', marginTop: '0.25rem' }}>Real-time IoT telemetry, AI disease diagnostic scan, and evapotranspiration irrigation control.</p>
        </div>
        <button className="agri-btn agri-btn-gold" onClick={() => onNavigate('chatbot')}>
          <MessageSquare size={18} /> Ask AI Assistant
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        {/* Soil Score Card */}
        <div className="agri-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('soil')}>
          <div className="agri-card-header">
            <span className="agri-card-title"><Activity size={18} color="var(--wheat-gold)" /> Soil Health Score</span>
            <span className={`metric-badge ${soilScore >= 80 ? 'badge-success' : 'badge-warning'}`}>
              {soilScore >= 80 ? 'Optimal' : 'Needs NPK'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--soil-dark)', fontFamily: 'var(--font-serif)' }}>
              {soilScore}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ 100</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Balanced N-P-K & pH 6.8</p>
        </div>

        {/* Live Weather Card */}
        <div className="agri-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('weather')}>
          <div className="agri-card-header">
            <span className="agri-card-title"><Sun size={18} color="var(--accent-amber)" /> Live Weather</span>
            <span className="metric-badge badge-info">{weatherData?.location || 'New Delhi'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--soil-dark)', fontFamily: 'var(--font-serif)' }}>
              {weatherData?.current?.temperature ?? 27.5}°C
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Humidity: {weatherData?.current?.humidity ?? 62}%
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Next rain: {weatherData?.current?.precipitation ?? 0} mm</p>
        </div>

        {/* Irrigation Card */}
        <div className="agri-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('irrigation')}>
          <div className="agri-card-header">
            <span className="agri-card-title"><Droplets size={18} color="var(--accent-blue)" /> Irrigation Req.</span>
            <span className="metric-badge badge-success">ETc Model</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--soil-dark)', fontFamily: 'var(--font-serif)' }}>
              {irrigationInfo?.water_needed_liters_per_m2 ?? 5.2}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>L / m²</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Drip duration: {irrigationInfo?.drip_irrigation_minutes ?? 60} mins</p>
        </div>

        {/* Disease Risk Card */}
        <div className="agri-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('disease')}>
          <div className="agri-card-header">
            <span className="agri-card-title"><Sprout size={18} color="var(--leaf-bright)" /> Latest Leaf Scan</span>
            <span className={`metric-badge ${latestScan?.severity === 'High' ? 'badge-danger' : 'badge-success'}`}>
              {latestScan?.crop ?? 'Tomato'}
            </span>
          </div>
          <div style={{ margin: '0.5rem 0' }}>
            <div style={{ fontWeight: 700, color: 'var(--soil-dark)', fontSize: '0.95rem' }}>
              {latestScan?.disease_name ?? 'Healthy Plant Leaf'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Confidence: {((latestScan?.confidence ?? 0.94) * 100).toFixed(0)}%
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CNN Model: {latestScan?.model_used ?? 'MobileNetV2'}</p>
        </div>
      </div>

      {/* Lower Details Grid */}
      <div className="grid-2">
        {/* Pest Alert Warnings Widget */}
        <div className="agri-card">
          <div className="agri-card-header">
            <h3 className="agri-card-title"><ShieldAlert size={20} color="var(--accent-red)" /> Active Seasonal Pest Warnings</h3>
            <button className="agri-btn" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }} onClick={() => onNavigate('pests')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          {pestAlerts.length === 0 ? (
            <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 color="var(--leaf-green)" size={18} /> No critical pest outbreaks reported for current month.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pestAlerts.slice(0, 3).map((pest, idx) => (
                <div key={idx} style={{
                  backgroundColor: 'var(--bg-paper)',
                  borderLeft: `4px solid ${pest.risk_level === 'Critical' || pest.risk_level === 'High' ? 'var(--accent-red)' : 'var(--accent-amber)'}`,
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{pest.crop}: {pest.pest_name}</span>
                    <span className={`metric-badge ${pest.risk_level === 'Critical' ? 'badge-danger' : 'badge-warning'}`}>
                      {pest.risk_level} Risk
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{pest.symptoms}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Crops & Seasonal Advice Widget */}
        <div className="agri-card">
          <div className="agri-card-header">
            <h3 className="agri-card-title"><Sprout size={20} color="var(--wheat-gold)" /> Weather Crop Suitability</h3>
            <button className="agri-btn" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }} onClick={() => onNavigate('weather')}>
              Full Matrix <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(weatherData?.crop_recommendations || [
              { crop: 'Tomato', suitability_score: 94, status: 'Highly Recommended', sowing_window: 'Aug - Oct' },
              { crop: 'Wheat', suitability_score: 88, status: 'Highly Recommended', sowing_window: 'Oct - Nov' },
              { crop: 'Corn (Maize)', suitability_score: 76, status: 'Suitable', sowing_window: 'June - July' }
            ]).slice(0, 3).map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-paper)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.crop}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sowing: {item.sowing_window}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="metric-badge badge-success" style={{ fontSize: '0.8rem' }}>
                    {item.suitability_score}% Match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
