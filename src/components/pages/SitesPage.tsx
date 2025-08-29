import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Site } from '../../models';
import { apiService } from '../../services/apiService';
import { SiteMap } from '../map/SiteMap';
import { SiteDetails } from '../map/SiteDetails';
import { CSVViewer } from '../common';
import { generateSitesCSV } from '../../utils';

// Custom hook for responsive design
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

const SitesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [showCSVViewer, setShowCSVViewer] = useState(false);

    // Effect to fetch sites data from API
  useEffect(() => {
    // TODO: Uncomment when API CORS issues are resolved
    const fetchSites = async () => {
      setLoading(true);
      setError(null);

      const response = await apiService.getLatestSiteAnalyses();

      if (response.error) {
        setError(response.error);
        setSites([]);
      } else {
        setSites(response.data);
      }

      setLoading(false);
    };
    fetchSites();
  }, []);

  // Effect to handle URL parameter changes
  useEffect(() => {
    if (id && sites.length > 0) {
      const site = sites.find(s => s.id === id);
      if (site) {
        setSelectedSite(site);
        const center = site.centerPoint;
        setMapCenter([center.latitude, center.longitude]);
      }
    } else {
      setSelectedSite(null);
      // Reset to overview when no site is selected
      if (sites.length > 0) {
        // Center on the first site for overview
        const firstSite = sites[0];
        const center = firstSite.centerPoint;
        setMapCenter([center.latitude, center.longitude]);
      } else {
        // Default fallback position
        setMapCenter([40.7580, -73.9855]);
      }
    }
  }, [id, sites]);

  const handleMarkerClick = (site: Site) => {
    navigate(`/sites/${site.id}`);
  };

  const handleSiteListClick = (site: Site) => {
    navigate(`/sites/${site.id}`);
  };

  const handleBackToSites = () => {
    navigate('/sites');
  };

  const handleDownloadCSV = () => {
    generateSitesCSV(sites);
  };

  const handleViewCSV = () => {
    setShowCSVViewer(true);
  };

  const handleCloseCSVViewer = () => {
    setShowCSVViewer(false);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    const result = await apiService.testApiConnection();
    alert(result.details);
    setTestingConnection(false);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        height: 'calc(100vh - 80px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <h3 style={{ color: '#495057', margin: 0 }}>Loading sites data...</h3>
        <p style={{ color: '#6c757d', margin: 0 }}>Fetching latest site analyses from backend</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        height: 'calc(100vh - 80px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>⚠️ Error Loading Sites</h3>
          <p style={{ margin: '0 0 15px 0' }}>{error}</p>
          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '15px', textAlign: 'left' }}>
            <strong>API Endpoint:</strong> https://foak-backend-production.up.railway.app/site-analyses/latest<br />
            <strong>Common Issues:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>CORS policy blocking cross-origin requests</li>
              <li>Backend server temporarily unavailable</li>
              <li>Network connectivity issues</li>
            </ul>
            <strong>Note:</strong> If API fails, no data will be available.
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🔄 Retry
            </button>
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              style={{
                backgroundColor: testingConnection ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: testingConnection ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {testingConnection ? '🔄 Testing...' : '🧪 Test API'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="sites-page"
      style={{
        height: 'calc(100vh - 80px)', // Account for navigation height
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
      {/* Header with CSV Download Buttons - only show when no site is selected */}
      {!selectedSite && (
        <div style={{
          padding: isMobile ? '10px' : '15px 20px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <h3 style={{ margin: 0, color: '#495057' }}>
              Sites Overview ({sites.length} sites)
            </h3>
            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
              {sites.filter(s => s.hasAnalysis).length} sites with analysis data
            </div>
          </div>

                    <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleViewCSV}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: isMobile ? '10px 16px' : '8px 14px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: isMobile ? '14px' : '13px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              View CSV
            </button>

            <button
              onClick={handleDownloadCSV}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: isMobile ? '10px 16px' : '8px 14px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: isMobile ? '14px' : '13px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Export CSV
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          height: '100%',
          minHeight: 0, // Important for flex children
          flexDirection: isMobile ? 'column' : 'row',
          overflow: 'hidden'
        }}
      >
        <SiteMap
          sites={sites}
          selectedSite={selectedSite}
          mapCenter={mapCenter}
          onMarkerClick={handleMarkerClick}
          isMobile={isMobile}
        />

        <SiteDetails
          selectedSite={selectedSite}
          sites={sites}
          onSiteClick={handleSiteListClick}
          onBackToSites={handleBackToSites}
          isMobile={isMobile}
        />
      </div>

      {/* CSV Viewer Modal */}
      <CSVViewer
        sites={sites}
        isOpen={showCSVViewer}
        onClose={handleCloseCSVViewer}
        isMobile={isMobile}
      />
    </div>
  );
};

export default SitesPage;