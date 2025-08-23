import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Site } from '../../models';
import { MapCenter } from './MapCenter';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface SiteMapProps {
  sites: Site[];
  selectedSite: Site | null;
  mapCenter: [number, number] | null;
  onMarkerClick: (site: Site) => void;
  isMobile: boolean;
}

export const SiteMap: React.FC<SiteMapProps> = ({
  sites,
  selectedSite,
  mapCenter,
  onMarkerClick,
  isMobile,
}) => {
  return (
    <div
      style={{
        flex: 1,
        height: isMobile ? '50vh' : '100vh',
        minHeight: isMobile ? '300px' : 'auto'
      }}
    >
      <MapContainer
        center={[40.7580, -73.9855]} // Center on Times Square
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <MapCenter center={mapCenter} isOverview={!selectedSite} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {sites.map((site) => (
          <Marker
            key={site.id}
            position={[site.latitude, site.longitude]}
            eventHandlers={{
              click: () => onMarkerClick(site),
            }}
          >
            <Popup>
              <div>
                <h3>{site.name}</h3>
                <p>{site.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
