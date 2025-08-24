import { Site, CO2Product } from '../models';
import siteData from './data.json';

// Convert JSON data to Site objects
export const sampleSites: Site[] = siteData.map((siteDataItem: any) => {
  // Map product names to CO2Product enum values
  const productMap: { [key: string]: CO2Product } = {
    'Methanol': CO2Product.METHANOL,
    'Ethylene Glycol': CO2Product.ETHYLENE_GLYCOL,
    'Polypropylene (PP)': CO2Product.POLYPROPYLENE_PP,
    'Polyethylene PE': CO2Product.POLYETHYLENE_PE,
    'Polyurethane': CO2Product.POLYURETHANE,
    'Formic Acid': CO2Product.FORMIC_ACID,
    'Dimethyl Carbonate': CO2Product.DIMETHYL_CARBONATE,
    'MTO Olefins': CO2Product.MTO_OLEFINS,
    'DRI-EAR Steel': CO2Product.DRI_EAR_STEEL,
    'Oxalate': CO2Product.OXALATE,
    'Polycarbonate': CO2Product.POLYCARBONATE,
    'Ethylene': CO2Product.ETHYLENE,
    'Propylene': CO2Product.PROPYLENE,
    'Aldehydes': CO2Product.ALDEHYDES
  };

  // Map the JSON data to the SiteAnalysis format expected by Site.fromAnalysis
  const analysis = {
    location_name: siteDataItem.location_name,
    latitude: siteDataItem.latitude,
    longitude: siteDataItem.longitude,
    primary_product: productMap[siteDataItem.primary_product] || CO2Product.METHANOL,
    primary_product_market_price_per_ton_usd: parseFloat(siteDataItem.primary_product_market_price_per_ton_usd),
    electricity_price_per_kwh_usd: parseFloat(siteDataItem.electricity_price_per_kwh_usd),
    can_sell_100_tons_primary_product_within_100_km: siteDataItem.can_sell_100_tons_primary_product_within_100_km,
    other_viable_products: siteDataItem.other_viable_products.map((product: string) => {
      return productMap[product] || product;
    }),
    available_incentives: siteDataItem.available_incentives,
    business_analysis: siteDataItem.business_analysis,
    executive_summary: siteDataItem.executive_summary,
    cited_sources: siteDataItem.cited_sources,
    viability_score: siteDataItem.viability_score,
    site_id: siteDataItem.site_id,
    last_updated: siteDataItem.last_updated
  };

  // Create a description based on the site data
  const description = `**${siteDataItem.location_name.split(',')[0]} - ${siteDataItem.primary_product} Production Opportunity**\n\n${siteDataItem.executive_summary}`;

  // Use Site.fromAnalysis to create the Site instance
  return Site.fromAnalysis(analysis, 'point');
});
