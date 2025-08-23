import React from 'react';
import { Site } from '../../models';

interface SiteDetailsProps {
  selectedSite: Site | null;
  sites: Site[];
  onSiteClick: (site: Site) => void;
  onBackToSites: () => void;
  isMobile: boolean;
}

export const SiteDetails: React.FC<SiteDetailsProps> = ({
  selectedSite,
  sites,
  onSiteClick,
  onBackToSites,
  isMobile,
}) => {
  return (
    <div
      style={{
        width: isMobile ? '100%' : '400px',
        height: isMobile ? '50vh' : '100vh',
        backgroundColor: '#f8f9fa',
        padding: isMobile ? '15px' : '20px',
        borderLeft: isMobile ? 'none' : '1px solid #dee2e6',
        borderTop: isMobile ? '1px solid #dee2e6' : 'none',
        overflowY: 'auto',
      }}
    >
      {selectedSite ? (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={onBackToSites}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: isMobile ? '12px 20px' : '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: isMobile ? '16px' : '14px',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              ← Back to Sites
            </button>
          </div>
          <h2>{selectedSite.name}</h2>
          <div style={{ marginBottom: '15px' }}>
            <strong>ID:</strong> {selectedSite.id}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Coordinates:</strong><br />
            Latitude: {selectedSite.latitude}<br />
            Longitude: {selectedSite.longitude}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Description:</strong><br />
            {selectedSite.description}
          </div>
        </div>
      ) : (
        <div>
          <h2>Site Details</h2>
          <p>Click on a marker on the map to view site details.</p>
          <div style={{ marginTop: '20px' }}>
            <h3>Available Sites:</h3>
            <ul>
              {sites.map((site) => (
                <li
                  key={site.id}
                  style={{
                    cursor: 'pointer',
                    padding: isMobile ? '12px' : '8px',
                    marginBottom: isMobile ? '8px' : '5px',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    border: '1px solid #e9ecef',
                    fontSize: isMobile ? '16px' : '14px',
                    listStyle: 'none',
                  }}
                  onClick={() => onSiteClick(site)}
                >
                  {site.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
