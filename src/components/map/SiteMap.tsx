import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
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
        height: isMobile ? '50vh' : '100%',
        minHeight: isMobile ? '300px' : '400px',
        maxHeight: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <MapContainer
        center={[40.7580, -73.9855]} // Center on Times Square
        zoom={10}
        style={{
          height: '100%',
          width: '100%',
          border: 'none',
          outline: 'none'
        }}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        zoomControl={true}
      >
        <MapCenter center={mapCenter} isOverview={!selectedSite} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {sites.map((site) => {
          if (site.isPoint) {
            const coords = site.pointCoordinates!;
            return (
              <Marker
                key={site.id}
                position={coords}
                eventHandlers={{
                  click: () => onMarkerClick(site),
                }}
              >
                <Popup>
                  <div>
                    <h3>{site.name}</h3>
                    <p><strong>Type:</strong> Point Location</p>
                    <p>{site.description}</p>
                  </div>
                </Popup>
              </Marker>
            );
          } else if (site.isArea) {
            const coords = site.areaCoordinates!;
            return (
              <Polygon
                key={site.id}
                positions={coords}
                pathOptions={{
                  fillColor: '#3388ff',
                  fillOpacity: 0.3,
                  color: '#3388ff',
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => onMarkerClick(site),
                }}
              >
                <Popup>
                  <div>
                    <h3>{site.name}</h3>
                    <p><strong>Type:</strong> Area ({coords.length - 1} points)</p>
                    <p>{site.description}</p>
                  </div>
                </Popup>
              </Polygon>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
};
