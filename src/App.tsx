import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { SitesPage, ChatPage } from './components';
import { HomePage } from './components/pages/HomePage';
import './App.css';

const Navigation: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    background: isHomePage
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    padding: '12px 8px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    transition: 'all 0.3s ease'
  };

  const linkBaseStyle: React.CSSProperties = {
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const getNavLinkStyle = (path: string): React.CSSProperties => {
    const isActive = location.pathname === path ||
      (path === '/sites' && location.pathname.startsWith('/sites'));

    return {
      ...linkBaseStyle,
      background: isActive
        ? (isHomePage ? 'rgba(255, 255, 255, 0.2)' : 'rgba(102, 126, 234, 0.1)')
        : 'transparent',
      color: isActive
        ? (isHomePage ? 'white' : '#667eea')
        : (isHomePage ? 'rgba(255, 255, 255, 0.8)' : '#6b7280'),
      fontWeight: isActive ? '600' : '500'
    };
  };

  return (
    <nav style={navStyle}>
      <Link to="/" style={getNavLinkStyle('/')}>
        <span>🏠</span>
        Home
      </Link>
      <Link to="/sites" style={getNavLinkStyle('/sites')}>
        <span>🗺️</span>
        Sites
      </Link>
      <Link to="/chat" style={getNavLinkStyle('/chat')}>
        <span>💬</span>
        Chat
      </Link>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="App" style={{
        minHeight: '100vh',
        background: '#f8fafc'
      }}>
        <Navigation />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sites" element={
            <div style={{ paddingTop: '80px' }}>
              <SitesPage />
            </div>
          } />
          <Route path="/sites/:id" element={
            <div style={{ paddingTop: '80px' }}>
              <SitesPage />
            </div>
          } />
          <Route path="/chat" element={
            <div style={{ paddingTop: '80px' }}>
              <ChatPage />
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
