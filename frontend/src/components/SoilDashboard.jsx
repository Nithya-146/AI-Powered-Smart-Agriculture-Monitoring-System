import React, { useState, useEffect } from 'react';
import { Activity, Plus, RefreshCw, AlertCircle, CheckCircle2, FlaskConical } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

export default function SoilDashboard() {
  const [readings, setReadings] = useState([]);
  const [activeReading, setActiveReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    field_name: 'Plot 3 East',
    nitrogen: 165,
    phosphorus: 28,
    potassium: 215,
    ph: 6.7,
    moisture: 52,
    organic_carbon: 0.95
  });

  useEffect(() => {
    fetchSoilData();
  }, []);

  async function fetchSoilData() {
    try {
      const res = await axios.get(`${API_BASE}/soil/readings/`);
      setReadings(res.data);
      if (res.data.length > 0) {
        setActiveReading(res.data[0]);
      }
    } catch (err) {
      console.log('Using fallback soil data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateReading = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/soil/readings/`, formData);
      setReadings([res.data, ...readings]);
      setActiveReading(res.data);
      setShowAddModal(false);
    } catch (err) {
      console.log('Error creating soil reading:', err);
    }
  };

  const chartData = activeReading ? [
    { metric: 'Nitrogen (N)', current: activeReading.nitrogen, optimal: 200, unit: 'mg/kg' },
    { metric: 'Phosphorus (P)', current: activeReading.phosphorus, optimal: 35, unit: 'mg/kg' },
    { metric: 'Potassium (K)', current: activeReading.potassium, optimal: 220, unit: 'mg/kg' },
    { metric: 'pH Scale', current: activeReading.ph * 25, optimal: 168, unit: 'pH' },
    { metric: 'Moisture %', current: activeReading.moisture * 2, optimal: 120, unit: '%' }
  ] : [];

  const radarData = activeReading ? [
    { subject: 'Nitrogen', A: Math.min(100, (activeReading.nitrogen / 200) * 100), fullMark: 100 },
    { subject: 'Phosphorus', A: Math.min(100, (activeReading.phosphorus / 35) * 100), fullMark: 100 },
    { subject: 'Potassium', A: Math.min(100, (activeReading.potassium / 220) * 100), fullMark: 100 },
    { subject: 'pH Balance', A: Math.min(100, (activeReading.ph / 6.8) * 100), fullMark: 100 },
    { subject: 'Moisture', A: Math.min(100, (activeReading.moisture / 60) * 100), fullMark: 100 },
    { subject: 'Organic C.', A: Math.min(100, (activeReading.organic_carbon / 1.0) * 100), fullMark: 100 }
  ] : [];

  return (
    <div className="soil-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Soil Health Telemetry Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time sensor telemetry for N, P, K, pH, moisture, and organic carbon with automated health scoring.</p>
        </div>
        <button className="agri-btn agri-btn-gold" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Sensor Reading
        </button>
      </div>

      {activeReading && (
        <>
          {/* Main Health Score & Primary Parameters Grid */}
          <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
            {/* Health Score Box */}
            <div className="agri-card" style={{ borderLeft: '4px solid var(--wheat-gold)' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Overall Health Index</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--soil-dark)', fontFamily: 'var(--font-serif)', margin: '0.25rem 0' }}>
                {activeReading.health_score} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ 100</span>
              </div>
              <span className={`metric-badge ${activeReading.health_score >= 80 ? 'badge-success' : 'badge-warning'}`}>
                {activeReading.health_score >= 80 ? 'Excellent Fertility' : 'Moderate Deficiency'}
              </span>
            </div>

            {/* N-P-K Summary */}
            <div className="agri-card">
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>N - P - K Ratio</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--soil-dark)', margin: '0.25rem 0' }}>
                {activeReading.nitrogen} - {activeReading.phosphorus} - {activeReading.potassium}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nitrogen : Phosphorus : Potassium (mg/kg)</div>
            </div>

            {/* pH Level */}
            <div className="agri-card">
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Soil pH Reaction</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--soil-dark)', margin: '0.25rem 0' }}>
                pH {activeReading.ph}
              </div>
              <span className="metric-badge badge-info">{activeReading.ph >= 6.0 && activeReading.ph <= 7.5 ? 'Optimal Neutral' : 'Slight Acidic'}</span>
            </div>

            {/* Moisture & Organic Carbon */}
            <div className="agri-card">
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Moisture & Organic Carbon</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--soil-dark)', margin: '0.25rem 0' }}>
                {activeReading.moisture}% <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>| {activeReading.organic_carbon}% OC</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target OC: &gt; 0.75%</div>
            </div>
          </div>

          {/* Charts & Diagnostics Grid */}
          <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
            {/* Bar Chart vs Target */}
            <div className="agri-card">
              <div className="agri-card-header">
                <h3 className="agri-card-title"><FlaskConical size={20} color="var(--leaf-bright)" /> Nutrient Levels vs Agronomic Targets</h3>
              </div>
              <div style={{ height: '260px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="metric" stroke="#8C7565" fontSize={11} />
                    <YAxis stroke="#8C7565" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#FBF9F4', borderRadius: '8px', border: '1px solid #E2DBD0' }} />
                    <Bar dataKey="current" fill="#C89551" name="Current Value" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="optimal" fill="#2D5A37" name="Optimal Target" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Balance Profile */}
            <div className="agri-card">
              <div className="agri-card-header">
                <h3 className="agri-card-title"><Activity size={20} color="var(--wheat-gold)" /> Multi-Parameter Balance Radar</h3>
              </div>
              <div style={{ height: '260px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#E2DBD0" />
                    <PolarAngleAxis dataKey="subject" stroke="#5D473A" fontSize={12} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#8C7565" fontSize={10} />
                    <Radar name="Soil Balance %" dataKey="A" stroke="#2D5A37" fill="#447E51" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Actionable Recommendations Box */}
          <div className="agri-card" style={{ marginBottom: '1.75rem', backgroundColor: 'var(--bg-paper)', borderLeft: '4px solid var(--leaf-green)' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--soil-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 color="var(--leaf-green)" size={20} /> Agronomic Recommendations for {activeReading.field_name}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--soil-medium)' }}>
              {activeReading.recommendations || "All nutrient levels are within optimal ranges for peak crop yield!"}
            </p>
          </div>
        </>
      )}

      {/* Sensor Reading History Table */}
      <div className="agri-card">
        <div className="agri-card-header">
          <h3 className="agri-card-title">Soil Telemetry History</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--soil-muted)' }}>
                <th style={{ padding: '0.65rem' }}>Field Name</th>
                <th style={{ padding: '0.65rem' }}>Nitrogen (N)</th>
                <th style={{ padding: '0.65rem' }}>Phosphorus (P)</th>
                <th style={{ padding: '0.65rem' }}>Potassium (K)</th>
                <th style={{ padding: '0.65rem' }}>pH</th>
                <th style={{ padding: '0.65rem' }}>Moisture</th>
                <th style={{ padding: '0.65rem' }}>Health Score</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--bg-secondary)', cursor: 'pointer', backgroundColor: activeReading?.id === r.id ? 'var(--wheat-light)' : 'transparent' }} onClick={() => setActiveReading(r)}>
                  <td style={{ padding: '0.65rem', fontWeight: 600 }}>{r.field_name}</td>
                  <td style={{ padding: '0.65rem' }}>{r.nitrogen} mg/kg</td>
                  <td style={{ padding: '0.65rem' }}>{r.phosphorus} mg/kg</td>
                  <td style={{ padding: '0.65rem' }}>{r.potassium} mg/kg</td>
                  <td style={{ padding: '0.65rem' }}>{r.ph}</td>
                  <td style={{ padding: '0.65rem' }}>{r.moisture}%</td>
                  <td style={{ padding: '0.65rem' }}>
                    <span className="metric-badge badge-success">{r.health_score}/100</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Reading Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(35, 27, 23, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="agri-card" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="agri-card-header">
              <h3 className="agri-card-title">Add Soil Sensor Measurement</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleCreateReading} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Field Name / Location Tag</label>
                <input className="agri-input" type="text" value={formData.field_name} onChange={(e) => setFormData({ ...formData, field_name: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nitrogen (N)</label>
                  <input className="agri-input" type="number" value={formData.nitrogen} onChange={(e) => setFormData({ ...formData, nitrogen: parseFloat(e.target.value) })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Phosphorus (P)</label>
                  <input className="agri-input" type="number" value={formData.phosphorus} onChange={(e) => setFormData({ ...formData, phosphorus: parseFloat(e.target.value) })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Potassium (K)</label>
                  <input className="agri-input" type="number" value={formData.potassium} onChange={(e) => setFormData({ ...formData, potassium: parseFloat(e.target.value) })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>pH Level</label>
                  <input className="agri-input" type="number" step="0.1" value={formData.ph} onChange={(e) => setFormData({ ...formData, ph: parseFloat(e.target.value) })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Moisture %</label>
                  <input className="agri-input" type="number" value={formData.moisture} onChange={(e) => setFormData({ ...formData, moisture: parseFloat(e.target.value) })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Organic C. %</label>
                  <input className="agri-input" type="number" step="0.05" value={formData.organic_carbon} onChange={(e) => setFormData({ ...formData, organic_carbon: parseFloat(e.target.value) })} required />
                </div>
              </div>
              <button type="submit" className="agri-btn agri-btn-gold" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                Save Soil Reading
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
