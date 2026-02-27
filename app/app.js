"use client";
import React, { useState, useEffect } from 'react';

// STABLE TUNNEL BRIDGE
// STABLE TUNNEL BRIDGE
// STABLE TUNNEL BRIDGE
const API_URL = '/api';

export default function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    const sessionActive = localStorage.getItem('expert_session') === 'active';
    const hasUserDetails = localStorage.getItem('user_details');
    if (sessionActive && hasUserDetails) {
      setIsLoggedIn(true);
    }
    // ... rest of useEffect

    // 1. Fetch Stats
    fetch(`${API_URL}/stats`, {
      headers: { 'Bypass-Tunnel-Reminder': 'true' }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Stats error:", err));

    // 2. Security Deterrents (Disable Inspect/Right-Click)
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) || // Ctrl+Shift+I/J/C
        (e.ctrlKey && e.keyCode === 85) // Ctrl+U
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const resp = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify(userData),
      });

      if (resp.ok) {
        localStorage.setItem('expert_session', 'active');
        localStorage.setItem('user_details', JSON.stringify(userData));
        setIsLoggedIn(true);
        speak(`Welcome ${userData.name}. Institutional access granted to Bhavan's Expert System.`);
      } else {
        alert("Registration failed. Please try again.");
      }
    } catch (err) {
      alert("System offline. Please check expert server.");
    } finally {
      setLoading(false);
    }
  };

  const speak = (text) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      stopSpeaking();
      speak("Image received. Ready for expert analysis.");
    }
  };

  const handleUpload = async () => {
    if (!image) return;
    setLoading(true);
    stopSpeaking();
    speak("Consulting the expert diagnostic system. Please wait a moment.");

    const formData = new FormData();
    formData.append('file', image);

    try {
      const resp = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Bypass-Tunnel-Reminder': 'true' },
        body: formData,
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Server responded with ${resp.status}: ${errorText.substring(0, 50)}`);
      }

      const data = await resp.json();
      setResult(data);

      // Auto-speak the diagnosis
      const speechText = `Diagnosis complete. We have identified ${data.predicted_disease} in the ${data.plant_name}. ${data.biological_explanation}. The recommended action is: ${data.recommended_action}`;
      speak(speechText);

    } catch (err) {
      alert(`System connection error: ${err.message}. Please verify the expert server is active.`);
      speak("I encountered an error connecting to the diagnostic server.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('expert_session');
    localStorage.removeItem('user_details');
    setIsLoggedIn(false);
    speak("Expert session terminated. Secure logout complete.");
  };

  if (!isLoggedIn) {
    return (
      <div className="login-screen animate-fade">
        <div className="glass-card login-form">
          <div className="college-logo-container" style={{ margin: '0 auto 1.5rem', width: 'fit-content', padding: '15px' }}>
            <img src="/logo.jpg" alt="Logo" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '2px solid var(--secondary)' }} />
          </div>
          <p style={{ letterSpacing: '2px', fontWeight: '800', color: 'var(--secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Bhavan's Vivekananda College
          </p>
          <h2>Expert Diagnostic Portal</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '2.5rem' }}>Authorized Botanical Research Access</p>

          <form onSubmit={handleRegister}>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <input
                type="text"
                className="login-input"
                placeholder="Expert Name"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                required
              />
            </div>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <input
                type="email"
                className="login-input"
                placeholder="Institutional Email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                required
              />
            </div>
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <input
                type="tel"
                className="login-input"
                placeholder="Registry Phone Number"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                required
              />
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Authorize Access'}
            </button>
          </form>
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Secure Gateway • Institutional Protocol v2.4
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade">
      <header className="glass-card">
        <div className="college-logo-container">
          <img src="/logo.jpg" alt="Bhavan's College Logo" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ letterSpacing: '2px', fontWeight: '600', color: 'var(--secondary)' }}>BHAVAN'S VIVEKANANDA COLLEGE</p>
              <h1>Expert Diagnostic System</h1>
              <p>Professional Botanical Health & Disease Analysis</p>
            </div>
            <button
              onClick={handleLogout}
              className="tts-btn"
              style={{ padding: '0.8rem 1.5rem', borderColor: 'rgba(255,68,68,0.3)', color: '#ff6666' }}
            >
              <span>🔒</span> Logout
            </button>
          </div>
        </div>
      </header>

      <main>
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div className="upload-zone" onClick={() => document.getElementById('fileInput').click()}>
            <input
              type="file"
              id="fileInput"
              hidden
              onChange={handleImageChange}
              accept="image/*"
            />
            {preview ? (
              <img src={preview} alt="Preview" style={{ maxWidth: '100%', borderRadius: '15px', maxHeight: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
            ) : (
              <div>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem', animation: 'pulse 2s infinite' }}>🌿</div>
                <h3>Diagnostic Submissions</h3>
                <p>Upload a clear leaf sample for analysis</p>
              </div>
            )}
          </div>

          {image && !loading && !result && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button className="btn-primary" onClick={handleUpload}>Run Health Diagnosis</button>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <div className="spinner"></div>
              <p style={{ color: 'var(--secondary)' }}>Consulting Plant Health Expert...</p>
            </div>
          )}
        </div>

        {result && (
          <div className="animate-fade">
            <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
              <div className="result-header">
                <div>
                  <div className="badge">{result.category}</div>
                  <h2 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{result.predicted_disease}</h2>
                  <p style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>Detected in {result.plant_name}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>CONFIDENCE SCORE</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--secondary)' }}>{result.confidence_score}</div>
                </div>
              </div>

              <div className="confidence-bar">
                <div className="confidence-fill" style={{ width: result.confidence_score }}></div>
              </div>

              <div className="tts-controls">
                <button className="tts-btn" onClick={() => speak(`Diagnosis: ${result.predicted_disease}. ${result.biological_explanation}`)}>
                  <span>🔊</span> Re-play Diagnosis
                </button>
                {isSpeaking && (
                  <button className="tts-btn" onClick={stopSpeaking} style={{ color: '#ff4444', borderColor: '#ff4444' }}>
                    <span>⏹️</span> Stop Audio
                  </button>
                )}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '2.5rem' }}>
              <h3 style={{ color: 'var(--secondary)', marginBottom: '1.5rem', borderLeft: '4px solid var(--secondary)', paddingLeft: '1rem' }}>Biological Insight</h3>

              <div style={{ marginBottom: '2rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>PROFESSIONAL ANALYSIS:</strong>
                <p style={{ fontSize: '1.1rem' }}>{result.biological_explanation}</p>
              </div>

              <div style={{ background: 'rgba(197, 160, 89, 0.1)', padding: '1.5rem', borderRadius: '15px', border: '1px solid rgba(197, 160, 89, 0.2)' }}>
                <strong style={{ color: 'var(--secondary)', display: 'block', marginBottom: '0.5rem' }}>📜 RECOMMENDED ACTION:</strong>
                <p style={{ fontSize: '1rem' }}>{result.recommended_action}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {stats && (
        <footer style={{ marginTop: '4rem', textAlign: 'center', opacity: 0.6 }}>
          <div className="glass-card" style={{ display: 'inline-flex', gap: '3rem', padding: '1rem 3rem', borderRadius: '50px' }}>
            <div><strong>{stats.total_predictions}</strong> Reports Generated</div>
            <div><strong>{stats.top_plant}</strong> Top Subject</div>
          </div>
        </footer>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
