import React, { useState, useEffect } from 'react';
import { ShieldAlert, Bug, Filter, CheckCircle2, AlertOctagon } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function PestAlertCalendar() {
  const [pests, setPests] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPests();
  }, [selectedCrop, activeMonth]);

  async function fetchPests() {
    setLoading(true);
    try {
      let url = `${API_BASE}/pests/active/?month=${activeMonth}`;
      if (selectedCrop) url += `&crop=${encodeURIComponent(selectedCrop)}`;
      const res = await axios.get(url);
      setPests(res.data);
    } catch (err) {
      console.log('Using default pest fixture data fallback:', err);
      setPests([
        {
          id: 1,
          crop: 'Wheat',
          pest_name: 'Wheat Aphid',
          scientific_name: 'Sitobion avenae',
          start_month: 1,
          end_month: 3,
          risk_level: 'High',
          symptoms: 'Yellowing leaves, honeydew excretion, stunted ear development.',
          prevention_measures: 'Sow early in November, conserve ladybird beetle predators.',
          organic_controls: 'Neem oil emulsion spray (5ml/L) or soap solution.',
          chemical_controls: 'Imidacloprid 17.8 SL (1 ml / 3L water).'
        },
        {
          id: 2,
          crop: 'Rice',
          pest_name: 'Yellow Stem Borer',
          scientific_name: 'Scirpophaga incertulas',
          start_month: 7,
          end_month: 10,
          risk_level: 'Critical',
          symptoms: 'Dead hearts at vegetative stage, white ear heads at panicle stage.',
          prevention_measures: 'Clip leaf tips before transplanting, install pheromone traps at 20 traps/ha.',
          organic_controls: 'Trichogramma japonicum egg parasitoid release.',
          chemical_controls: 'Chlorantraniliprole 0.4% GR granular application.'
        },
        {
          id: 3,
          crop: 'Tomato',
          pest_name: 'Whitefly Vector (TYLCV)',
          scientific_name: 'Bemisia tabaci',
          start_month: 7,
          end_month: 11,
          risk_level: 'High',
          symptoms: 'Upward leaf curling, chlorosis, yellowing margins, vector for viral transmission.',
          prevention_measures: 'Install yellow sticky traps (15-20/acre), net nursery beds.',
          organic_controls: 'Spray Beauveria bassiana bio-insecticide.',
          chemical_controls: 'Acetamiprid 20 SP or Thiamethoxam 25 WG.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pest-calendar">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Seasonal Pest & Outbreak Alert Calendar</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Filter crop seasonal risk windows across 12 months with organic & chemical mitigation recipes.</p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--soil-medium)' }}>
            <Filter size={16} /> Filter Crop:
          </div>
          <select className="agri-select" value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)} style={{ width: '180px' }}>
            <option value="">All Major Crops</option>
            <option value="Wheat">Wheat</option>
            <option value="Rice">Rice</option>
            <option value="Tomato">Tomato</option>
            <option value="Potato">Potato</option>
            <option value="Corn">Corn</option>
            <option value="Cotton">Cotton</option>
          </select>
        </div>
      </div>

      {/* 12-Month Selector Tabs */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: '0.5rem', marginBottom: '1.75rem', paddingBottom: '0.5rem' }}>
        {MONTH_NAMES.map((m, idx) => {
          const monthNum = idx + 1;
          const isSelected = activeMonth === monthNum;
          return (
            <button
              key={idx}
              className="agri-btn"
              style={{
                backgroundColor: isSelected ? 'var(--wheat-gold)' : 'var(--bg-card)',
                color: isSelected ? 'var(--soil-dark)' : 'var(--soil-medium)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: isSelected ? 700 : 500
              }}
              onClick={() => setActiveMonth(monthNum)}
            >
              {m} {isSelected && '•'}
            </button>
          );
        })}
      </div>

      {/* Pest Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {pests.length === 0 ? (
          <div className="agri-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} color="var(--leaf-green)" style={{ marginBottom: '0.75rem' }} />
            <div>No active high-risk pest outbreaks logged for {MONTH_NAMES[activeMonth - 1]}.</div>
          </div>
        ) : (
          pests.map((pest) => (
            <div key={pest.id} className="agri-card" style={{ borderLeft: `5px solid ${pest.risk_level === 'Critical' ? 'var(--accent-red)' : 'var(--accent-amber)'}` }}>
              <div className="agri-card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--soil-dark)', fontFamily: 'var(--font-serif)' }}>{pest.pest_name}</span>
                    <span style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>({pest.scientific_name})</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--wheat-gold)', fontWeight: 600, marginTop: '0.2rem' }}>
                    Target Crop: <strong>{pest.crop}</strong> | Active Period: {MONTH_NAMES[pest.start_month - 1]} - {MONTH_NAMES[pest.end_month - 1]}
                  </div>
                </div>

                <span className={`metric-badge ${pest.risk_level === 'Critical' ? 'badge-danger' : 'badge-warning'}`}>
                  {pest.risk_level} Risk Window
                </span>
              </div>

              <div className="grid-2" style={{ gap: '1rem', marginTop: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--soil-dark)' }}>Field Symptoms:</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>{pest.symptoms}</p>

                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--soil-dark)', marginTop: '0.75rem' }}>Cultural Prevention:</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>{pest.prevention_measures}</p>
                </div>

                <div>
                  <div style={{ backgroundColor: 'var(--leaf-soft)', borderLeft: '3px solid var(--leaf-green)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--leaf-green)' }}>🌿 Organic Bio-Control</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.2rem', color: 'var(--soil-dark)' }}>{pest.organic_controls}</div>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-paper)', borderLeft: '3px solid var(--soil-muted)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--soil-dark)' }}>🧪 Chemical Intervention</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.2rem', color: 'var(--text-main)' }}>{pest.chemical_controls}</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
