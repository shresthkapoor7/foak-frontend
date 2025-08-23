import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { SitesPage } from './components';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{ padding: '20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
          <Link to="/" style={{ marginRight: '20px', textDecoration: 'none', color: '#007bff' }}>
            Home
          </Link>
          <Link to="/sites" style={{ textDecoration: 'none', color: '#007bff' }}>
            Sites
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={
            <div style={{ padding: '20px' }}>
              <h1>Welcome to FOAK Frontend</h1>
              <p>Navigate to <Link to="/sites">Sites</Link> to view the map.</p>
            </div>
          } />
          <Route path="/sites" element={<SitesPage />} />
          <Route path="/sites/:id" element={<SitesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
