import { Site } from '../models';

export const generateSitesCSV = (sites: Site[]): void => {
  // Define CSV headers - comprehensive format supporting both new and legacy data
  const headers = [
    // Basic Site Information
    'Site ID',
    'Name',
    'Type',
    'Latitude',
    'Longitude',
    'Center Latitude',
    'Center Longitude',
    'Description',

    // Analysis Overview
    'Has Analysis',
    'Analysis Format',
    'Profitability Score',
    'Raw Viability Score (1-10)',

    // New Format - Product Analysis
    'Primary Product',
    'Market Price ($/ton)',
    'Electricity Price ($/kWh)',
    'Can Sell 100+ tons within 100km',
    'Other Viable Products',
    'Other Products Count',

    // New Format - Financial Incentives
    'Available Incentives',
    'Incentives Count',

    // New Format - Analysis Content
    'Executive Summary',
    'Business Analysis',
    'Cited Sources Count',
    'Location Name (Backend)',

    // Legacy Format - Energy Pricing
    'CO2 Price ($/ton) [Legacy]',

    // Legacy Format - Market Demand
    'Methane Capacity (tons/year) [Legacy]',
    'Customers within 50km [Legacy]',
    'Pipeline Access [Legacy]',
    'Scalability Rating [Legacy]',

    // Legacy Format - Financial Incentives
    'Available Grants ($) [Legacy]',
    'Tax Credits Available [Legacy]',
    'Incentive Summary [Legacy]',

    // Metadata
    'Site ID (Backend)',
    'Last Updated',
    'Export Date'
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

    // Helper function to get legacy analysis data safely
    const getLegacyData = (path: string, defaultValue: any = '') => {
      if (!site.isLegacyAnalysisFormat || !analysis) return defaultValue;
      const parts = path.split('.');
      let value = analysis as any;
      for (const part of parts) {
        value = value?.[part];
        if (value === undefined) return defaultValue;
      }
      return value;
    };

    // Get raw viability score from new format
    const rawViabilityScore = site.isNewAnalysisFormat && analysis ?
      (analysis as any).viability_score : '';

    // Get backend site ID from new format
    const backendSiteId = site.isNewAnalysisFormat && analysis ?
      (analysis as any).site_id : '';

    // Get location name from new format
    const locationName = site.isNewAnalysisFormat && analysis ?
      (analysis as any).location_name : '';

    return [
      // Basic Site Information
      escapeCSV(site.id),
      escapeCSV(site.name),
      escapeCSV(site.type === 'point' ? 'Point' : 'Area'),
      escapeCSV(coords.latitude.toFixed(6)),
      escapeCSV(coords.longitude.toFixed(6)),
      escapeCSV(coords.centerLatitude.toFixed(6)),
      escapeCSV(coords.centerLongitude.toFixed(6)),
      escapeCSV(site.description),

      // Analysis Overview
      escapeCSV(site.hasAnalysis ? 'Yes' : 'No'),
      escapeCSV(site.isNewAnalysisFormat ? 'New' : site.isLegacyAnalysisFormat ? 'Legacy' : 'None'),
      escapeCSV(site.profitabilityScore?.toFixed(1) || ''),
      escapeCSV(rawViabilityScore || ''),

      // New Format - Product Analysis
      escapeCSV(site.primaryProduct || ''),
      escapeCSV(site.marketPrice?.toLocaleString() || ''),
      escapeCSV(site.electricityPrice || ''),
      escapeCSV(site.isNewAnalysisFormat && analysis ?
        ((analysis as any).can_sell_100_tons_primary_product_within_100_km ? 'Yes' : 'No') : ''),
      escapeCSV(site.otherViableProducts.join('; ') || ''),
      escapeCSV(site.otherViableProducts.length || ''),

      // New Format - Financial Incentives
      escapeCSV(site.availableIncentives.join('; ') || ''),
      escapeCSV(site.availableIncentives.length || ''),

      // New Format - Analysis Content
      escapeCSV(site.executiveSummary || ''),
      escapeCSV(site.businessAnalysis || ''),
      escapeCSV(site.citedSources.length || ''),
      escapeCSV(locationName || ''),

      // Legacy Format - Energy Pricing
      escapeCSV(getLegacyData('energy_pricing.co2_price_per_ton')),

      // Legacy Format - Market Demand
      escapeCSV(getLegacyData('market_demand.methane_capacity_tons')),
      escapeCSV(getLegacyData('market_demand.customer_count_within_50km')),
      escapeCSV(getLegacyData('market_demand.has_pipeline_access') !== '' ?
        (getLegacyData('market_demand.has_pipeline_access') ? 'Yes' : 'No') : ''),
      escapeCSV(getLegacyData('market_demand.scalability_rating')),

      // Legacy Format - Financial Incentives
      escapeCSV(getLegacyData('financial_incentives.available_grants_usd')),
      escapeCSV(getLegacyData('financial_incentives.tax_credits_available') !== '' ?
        (getLegacyData('financial_incentives.tax_credits_available') ? 'Yes' : 'No') : ''),
      escapeCSV(getLegacyData('financial_incentives.incentive_summary')),

      // Metadata
      escapeCSV(backendSiteId || ''),
      escapeCSV(analysis?.last_updated ? new Date(analysis.last_updated).toLocaleString() : ''),
      escapeCSV(new Date().toLocaleString())
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


