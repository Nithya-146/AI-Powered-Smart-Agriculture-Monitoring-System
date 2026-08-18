import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

const QUICK_PROMPTS = [
  "Why are my tomato leaves turning yellow?",
  "What is the recommended NPK fertilizer dose for Wheat?",
  "How to control armyworms organically using neem oil?",
  "What government schemes exist for PM-KISAN & soil cards?"
];

export default function FarmerChatbot() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! I am Krishi Mitra, your AI Agricultural Advisor tuned for smallholder farmers. Ask me any question about crop diseases, fertilizers, weather adaptation, or government schemes!'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (msgText) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const newMessages = [...messages, { sender: 'user', text: textToSend }];
    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chatbot/chat/`, {
        message: textToSend,
        conversation_id: 'session_1'
      });
      setMessages([...newMessages, { sender: 'bot', text: res.data.bot_response }]);
    } catch (err) {
      console.log('Using domain knowledge chatbot fallback:', err);
      let fallbackReply = "Yellowing leaves usually signal Nitrogen deficiency or over-watering. Apply Urea (20kg/acre) or spray 1% NPK (19:19:19) solution. Ensure proper field drainage.";
      if (textToSend.toLowerCase().includes("npk") || textToSend.toLowerCase().includes("fertilizer")) {
        fallbackReply = "Recommended cereal crop fertilizer dose: 120 kg N : 60 kg P2O5 : 40 kg K2O per hectare. Apply half N with full P & K at sowing, rest N in 2 split doses.";
      }
      setMessages([...newMessages, { sender: 'bot', text: fallbackReply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="farmer-chatbot">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Krishi Mitra — AI Farmer Assistant</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Conversational AI tuned for Indian smallholder agronomy, organic remedies, and government schemes.</p>
      </div>

      <div className="agri-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '600px' }}>
        {/* Chat Header */}
        <div style={{ backgroundColor: 'var(--soil-dark)', color: '#FFF', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid var(--wheat-gold)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--wheat-gold)', color: 'var(--soil-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#FBF9F4' }}>Krishi Mitra AI Assistant</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--wheat-gold)' }}>Online • Expert Agronomist Engine</div>
          </div>
        </div>

        {/* Message History Window */}
        <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', backgroundColor: 'var(--bg-paper)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{
              display: 'flex',
              gap: '0.75rem',
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}>
              {m.sender === 'bot' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--leaf-green)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={16} />
                </div>
              )}

              <div style={{
                backgroundColor: m.sender === 'user' ? 'var(--soil-deep)' : 'var(--bg-card)',
                color: m.sender === 'user' ? '#FFF' : 'var(--text-main)',
                padding: '0.85rem 1.15rem',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-sm)',
                border: m.sender === 'bot' ? '1px solid var(--border-color)' : 'none',
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>
                {m.text}
              </div>

              {m.sender === 'user' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--wheat-gold)', color: 'var(--soil-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <RefreshCw className="spin" size={16} /> Krishi Mitra is writing response...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div style={{ padding: '0.65rem 1.25rem', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button key={i} className="agri-btn" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', backgroundColor: 'var(--bg-card)', color: 'var(--soil-dark)', border: '1px solid var(--border-color)', whiteSpace: 'nowrap' }} onClick={() => handleSendMessage(prompt)}>
              <Sparkles size={12} color="var(--wheat-gold)" /> {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem' }}>
          <input
            className="agri-input"
            type="text"
            placeholder="Type your farming question (e.g. fertilizer rates, pest cure)..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button type="submit" className="agri-btn agri-btn-gold" disabled={loading}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
