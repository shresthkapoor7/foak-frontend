import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapCenterProps {
  center: [number, number] | null;
  isOverview: boolean;
}

export const MapCenter: React.FC<MapCenterProps> = ({ center, isOverview }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      const zoom = isOverview ? 10 : 14; // Use zoom 10 for overview, 14 for specific sites
      map.setView(center, zoom, { animate: true });
    }
  }, [center, isOverview, map]);

  return null;
};
