import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Site } from '../../models';
import { sampleSites } from '../../data/sampleSites';
import { SiteMap } from '../map/SiteMap';
import { SiteDetails } from '../map/SiteDetails';

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

  // Effect to handle URL parameter changes
  useEffect(() => {
    if (id) {
      const site = sampleSites.find(s => s.id === id);
      if (site) {
        setSelectedSite(site);
        setMapCenter([site.latitude, site.longitude]);
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

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
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
  );
};

export default SitesPage;