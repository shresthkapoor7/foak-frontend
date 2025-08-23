import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Site } from '../../models';
import { sampleSites } from '../../data/sampleSites';
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
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [showCSVViewer, setShowCSVViewer] = useState(false);

  // Effect to handle URL parameter changes
  useEffect(() => {
    if (id) {
      const site = sampleSites.find(s => s.id === id);
      if (site) {
        setSelectedSite(site);
        const center = site.centerPoint;
        setMapCenter([center.latitude, center.longitude]);
      }
    } else {
      setSelectedSite(null);
      // Reset to overview when no site is selected
      setMapCenter([40.7580, -73.9855]); // Times Square overview position
    }
  }, [id]);

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
    generateSitesCSV(sampleSites);
  };

  const handleViewCSV = () => {
    setShowCSVViewer(true);
  };

  const handleCloseCSVViewer = () => {
    setShowCSVViewer(false);
  };

    return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
              Sites Overview ({sampleSites.length} sites)
            </h3>
            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
              {sampleSites.filter(s => s.hasAnalysis).length} sites with analysis data
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
              👁️ View CSV
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
              📊 Export Sites CSV
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          height: selectedSite ? '100%' : 'calc(100% - 70px)',
          flexDirection: isMobile ? 'column' : 'row'
        }}
      >
        <SiteMap
          sites={sampleSites}
          selectedSite={selectedSite}
          mapCenter={mapCenter}
          onMarkerClick={handleMarkerClick}
          isMobile={isMobile}
        />

        <SiteDetails
          selectedSite={selectedSite}
          sites={sampleSites}
          onSiteClick={handleSiteListClick}
          onBackToSites={handleBackToSites}
          isMobile={isMobile}
        />
      </div>

      {/* CSV Viewer Modal */}
      <CSVViewer
        sites={sampleSites}
        isOpen={showCSVViewer}
        onClose={handleCloseCSVViewer}
        isMobile={isMobile}
      />
    </div>
  );
};

export default SitesPage;