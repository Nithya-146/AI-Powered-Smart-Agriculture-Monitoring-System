import React, { useState } from 'react';
import { Sprout, LayoutDashboard, Scan, Activity, Droplets, Sun, ShieldAlert, TrendingUp, MessageSquare, User, LogIn, Lock } from 'lucide-react';
import DashboardOverview from './components/DashboardOverview';
import DiseaseDetector from './components/DiseaseDetector';
import SoilDashboard from './components/SoilDashboard';
import IrrigationCalculator from './components/IrrigationCalculator';
import WeatherCropAdvisor from './components/WeatherCropAdvisor';
import PestAlertCalendar from './components/PestAlertCalendar';
import CropGrowthPredictor from './components/CropGrowthPredictor';
import FarmerChatbot from './components/FarmerChatbot';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [userToken, setUserToken] = useState(localStorage.getItem('access_token') || null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '' });
  const [authError, setAuthError] = useState(null);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const endpoint = isRegister ? `${API_BASE}/accounts/register/` : `${API_BASE}/accounts/login/`;
      const res = await axios.post(endpoint, authForm);
      const token = res.data.access;
      setUserToken(token);
      localStorage.setItem('access_token', token);
      setShowAuthModal(false);
    } catch (err) {
      setAuthError('Authentication failed. Check username and password.');
    }
  };

  const handleLogout = () => {
    setUserToken(null);
    localStorage.removeItem('access_token');
  };

  return (
    <div className="agri-app">
      {/* Precision Agriculture Top Navbar Header */}
      <header className="agri-header">
        <div className="agri-brand">
          <div className="agri-logo-icon">
            <Sprout size={22} />
          </div>
          <div>
            <h1 className="agri-title brand-font">AgriPrecision AI</h1>
            <div className="agri-subtitle">Smart Agriculture & Telemetry System</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {userToken ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="metric-badge badge-success" style={{ textTransform: 'none' }}>
                <User size={12} /> Farmer Session Active
              </span>
              <button className="agri-btn" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', backgroundColor: 'var(--soil-medium)' }} onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          ) : (
            <button className="agri-btn agri-btn-gold" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }} onClick={() => setShowAuthModal(true)}>
              <LogIn size={15} /> Farmer Sign In
            </button>
          )}
        </div>
      </header>

      {/* Feature Tab Navigation */}
      <nav className="agri-nav">
        <button className={`agri-tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <LayoutDashboard size={16} /> Overview Dashboard
        </button>
        <button className={`agri-tab-btn ${activeTab === 'disease' ? 'active' : ''}`} onClick={() => setActiveTab('disease')}>
          <Scan size={16} /> Leaf Disease AI
        </button>
        <button className={`agri-tab-btn ${activeTab === 'soil' ? 'active' : ''}`} onClick={() => setActiveTab('soil')}>
          <Activity size={16} /> Soil Sensor Telemetry
        </button>
        <button className={`agri-tab-btn ${activeTab === 'irrigation' ? 'active' : ''}`} onClick={() => setActiveTab('irrigation')}>
          <Droplets size={16} /> ETc Smart Irrigation
        </button>
        <button className={`agri-tab-btn ${activeTab === 'weather' ? 'active' : ''}`} onClick={() => setActiveTab('weather')}>
          <Sun size={16} /> Weather Advisor
        </button>
        <button className={`agri-tab-btn ${activeTab === 'pests' ? 'active' : ''}`} onClick={() => setActiveTab('pests')}>
          <ShieldAlert size={16} /> Pest Calendar
        </button>
        <button className={`agri-tab-btn ${activeTab === 'growth' ? 'active' : ''}`} onClick={() => setActiveTab('growth')}>
          <TrendingUp size={16} /> Growth Curve
        </button>
        <button className={`agri-tab-btn ${activeTab === 'chatbot' ? 'active' : ''}`} onClick={() => setActiveTab('chatbot')}>
          <MessageSquare size={16} /> AI Chatbot
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="agri-main">
        {activeTab === 'overview' && <DashboardOverview onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'disease' && <DiseaseDetector />}
        {activeTab === 'soil' && <SoilDashboard />}
        {activeTab === 'irrigation' && <IrrigationCalculator />}
        {activeTab === 'weather' && <WeatherCropAdvisor />}
        {activeTab === 'pests' && <PestAlertCalendar />}
        {activeTab === 'growth' && <CropGrowthPredictor />}
        {activeTab === 'chatbot' && <FarmerChatbot />}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(35, 27, 23, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="agri-card" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="agri-card-header">
              <h3 className="agri-card-title"><Lock size={18} color="var(--wheat-gold)" /> {isRegister ? 'Create Farmer Account' : 'Farmer JWT Login'}</h3>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
            </div>

            {authError && <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{authError}</div>}

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Username</label>
                <input className="agri-input" type="text" value={authForm.username} onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })} required />
              </div>

              {isRegister && (
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email Address</label>
                  <input className="agri-input" type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Password</label>
                <input className="agri-input" type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required />
              </div>

              <button type="submit" className="agri-btn agri-btn-gold" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                {isRegister ? 'Register & Login' : 'Sign In with JWT'}
              </button>

              <div style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button type="button" onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: 'var(--wheat-gold)', fontWeight: 600, cursor: 'pointer' }}>
                  {isRegister ? 'Sign In' : 'Register Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
