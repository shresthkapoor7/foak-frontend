import { Site } from '../models';

export const generateSitesCSV = (sites: Site[]): void => {
  // Define CSV headers
  const headers = [
    'Site ID',
    'Name',
    'Type',
    'Latitude',
    'Longitude',
    'Center Latitude',
    'Center Longitude',
    'Description',
    'Has Analysis',
    'Profitability Score',
    'Electricity Price ($/kWh)',
    'CO2 Price ($/ton)',
    'Methane Capacity (tons/year)',
    'Customers within 50km',
    'Pipeline Access',
    'Scalability Rating',
    'Available Grants ($)',
    'Tax Credits Available',
    'Incentive Summary',
    'Last Updated'
  ];

  // Helper function to escape CSV values
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes('"') || str.includes(',') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Helper function to get coordinates for CSV
  const getCoordinatesForCSV = (site: Site) => {
    if (site.isPoint) {
      const coords = site.centerPoint;
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        centerLatitude: coords.latitude,
        centerLongitude: coords.longitude
      };
    } else {
      const center = site.centerPoint;
      const coords = site.areaCoordinates!;
      // For areas, show first coordinate as lat/lng and center as center lat/lng
      return {
        latitude: coords[0][0],
        longitude: coords[0][1],
        centerLatitude: center.latitude,
        centerLongitude: center.longitude
      };
    }
  };

  // Convert sites data to CSV rows
  const csvRows = sites.map(site => {
    const coords = getCoordinatesForCSV(site);
    const analysis = site.analysis;

    return [
      escapeCSV(site.id),
      escapeCSV(site.name),
      escapeCSV(site.type === 'point' ? 'Point' : 'Area'),
      escapeCSV(coords.latitude.toFixed(6)),
      escapeCSV(coords.longitude.toFixed(6)),
      escapeCSV(coords.centerLatitude.toFixed(6)),
      escapeCSV(coords.centerLongitude.toFixed(6)),
      escapeCSV(site.description),
      escapeCSV(site.hasAnalysis ? 'Yes' : 'No'),
      escapeCSV(site.profitabilityScore?.toFixed(1) || ''),
      escapeCSV(analysis?.energy_pricing.electricity_price_per_kwh || ''),
      escapeCSV(analysis?.energy_pricing.co2_price_per_ton || ''),
      escapeCSV(analysis?.market_demand.methane_capacity_tons || ''),
      escapeCSV(analysis?.market_demand.customer_count_within_50km || ''),
      escapeCSV(analysis?.market_demand.has_pipeline_access ? 'Yes' : analysis?.market_demand.has_pipeline_access === false ? 'No' : ''),
      escapeCSV(analysis?.market_demand.scalability_rating || ''),
      escapeCSV(analysis?.financial_incentives.available_grants_usd || ''),
      escapeCSV(analysis?.financial_incentives.tax_credits_available ? 'Yes' : analysis?.financial_incentives.tax_credits_available === false ? 'No' : ''),
      escapeCSV(analysis?.financial_incentives.incentive_summary || ''),
      escapeCSV(analysis?.last_updated ? new Date(analysis.last_updated).toLocaleString() : '')
    ].join(',');
  });

  // Combine headers and data
  const csvContent = [headers.join(','), ...csvRows].join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sites-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};


