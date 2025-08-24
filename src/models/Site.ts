export type SiteType = 'point' | 'area';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// CO2 Product enum matching Python backend
export enum CO2Product {
  // High-priority products
  METHANOL = "Methanol",
  ETHYLENE = "Ethylene",
  PROPYLENE = "Propylene",
  POLYETHYLENE_PE = "Polyethylene PE",
  POLYPROPYLENE_PP = "Polypropylene (PP)",

  // Medium-priority products
  ETHYLENE_GLYCOL = "Ethylene Glycol",
  POLYETHYLENE_TEREPHTHALATE_PET = "Polyethylene Terephthalate (PET)",
  POLYCARBONATE = "Polycarbonate",
  FORMIC_ACID = "Formic Acid",
  DIMETHYL_CARBONATE = "Dimethyl Carbonate",

  // Specialized/niche products
  MTO_OLEFINS = "MTO Olefins",
  POLYURETHANE = "Polyurethane",
  ALDEHYDES = "Aldehydes",
  ACETYLS = "Acetyls",
  DRI_EAR_STEEL = "DRI-EAR Steel",
  OXALATE = "Oxalate",
  PHOSGENE = "Phosgene"
}

export interface CitedSource {
  url: string; // Source website URL
  extracted_quote: string; // Relevant quote or data point from the source
}

export interface SiteAnalysis {
  // Basic Site Information
  location_name: string; // Human-readable site location
  latitude: number; // Latitude coordinate of the site
  longitude: number; // Longitude coordinate of the site

  // Business Opportunity Assessment
  primary_product: CO2Product; // Most viable product to produce from CO2 at this location
  primary_product_market_price_per_ton_usd: number; // Current market price for the primary product in USD per metric ton
  electricity_price_per_kwh_usd: number; // Industrial electricity price at this location in USD per kWh
  can_sell_100_tons_primary_product_within_100_km: boolean; // Whether there's demand to sell 100 tons of the primary product annually within 100 km
  other_viable_products: CO2Product[]; // Other products that could be produced from CO2 at this location

  // Financial Support
  available_incentives: string[]; // List of available financial incentives and their amounts

  // Analysis Documentation
  business_analysis: string; // Comprehensive evidence-backed analysis
  executive_summary: string; // Concise 2-3 sentence investment thesis
  cited_sources: CitedSource[]; // Research sources with relevant quotes

  // Scoring and Metadata
  viability_score?: number; // Overall business viability score from 1 (poor) to 10 (excellent)
  site_id: string; // Unique identifier for the analyzed site
  last_updated: string; // ISO timestamp of when analysis was performed
}

// Legacy interfaces for backward compatibility
export interface EnergyPricing {
  electricity_price_per_kwh: number;
  co2_price_per_ton: number;
}

export interface MarketDemand {
  methane_capacity_tons: number;
  customer_count_within_50km: number;
  has_pipeline_access: boolean;
  scalability_rating: number;
}

export interface FinancialIncentives {
  available_grants_usd: number;
  tax_credits_available: boolean;
  incentive_summary: string;
}

export interface LegacySiteAnalysis {
  site_id: string;
  location_name: string;
  energy_pricing: EnergyPricing;
  market_demand: MarketDemand;
  financial_incentives: FinancialIncentives;
  last_updated: string;
}

export class Site {
  id: string;
  name: string;
  type: SiteType;
  coordinates: Coordinates | Coordinates[];
  description: string;
  analysis?: SiteAnalysis | LegacySiteAnalysis; // Optional analysis data from backend (supports both new and legacy formats)

  constructor(
    id: string,
    name: string,
    type: SiteType,
    coordinates: Coordinates | Coordinates[],
    description: string,
    analysis?: SiteAnalysis | LegacySiteAnalysis
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.coordinates = coordinates;
    this.description = description;
    this.analysis = analysis;
  }

  // Helper methods for easier access
  get centerPoint(): Coordinates {
    if (this.type === 'point') {
      return this.coordinates as Coordinates;
    } else {
      // Calculate center of polygon for area types
      const coords = this.coordinates as Coordinates[];
      const avgLat = coords.reduce((sum, coord) => sum + coord.latitude, 0) / coords.length;
      const avgLng = coords.reduce((sum, coord) => sum + coord.longitude, 0) / coords.length;
      return { latitude: avgLat, longitude: avgLng };
    }
  }

  get isPoint(): boolean {
    return this.type === 'point';
  }

  get isArea(): boolean {
    return this.type === 'area';
  }

  get areaCoordinates(): [number, number][] | null {
    if (this.type === 'area') {
      return (this.coordinates as Coordinates[]).map(coord => [coord.latitude, coord.longitude]);
    }
    return null;
  }

  get pointCoordinates(): [number, number] | null {
    if (this.type === 'point') {
      const coord = this.coordinates as Coordinates;
      return [coord.latitude, coord.longitude];
    }
    return null;
  }

    // Analysis helper methods
  get hasAnalysis(): boolean {
    return this.analysis !== undefined;
  }

  get analysisStatus(): 'available' | 'pending' | 'not_available' {
    if (this.analysis) {
      return 'available';
    }
    return 'not_available';
  }

  get isNewAnalysisFormat(): boolean {
    if (!this.analysis) return false;
    return 'primary_product' in this.analysis;
  }

  get isLegacyAnalysisFormat(): boolean {
    if (!this.analysis) return false;
    return 'energy_pricing' in this.analysis;
  }

  get profitabilityScore(): number | null {
    if (!this.analysis) return null;

    // Check if new format has viability_score
    if (this.isNewAnalysisFormat) {
      const newAnalysis = this.analysis as SiteAnalysis;
      return newAnalysis.viability_score ? newAnalysis.viability_score * 10 : null; // Convert 1-10 to 10-100 scale
    }

    // Legacy scoring algorithm for old format
    if (this.isLegacyAnalysisFormat) {
      const legacyAnalysis = this.analysis as LegacySiteAnalysis;
      const scalabilityWeight = legacyAnalysis.market_demand.scalability_rating * 20;
      const accessWeight = legacyAnalysis.market_demand.has_pipeline_access ? 20 : 0;
      const incentiveWeight = legacyAnalysis.financial_incentives.tax_credits_available ? 15 : 0;
      const capacityWeight = Math.min(legacyAnalysis.market_demand.methane_capacity_tons / 1000, 25);
      const customerWeight = Math.min(legacyAnalysis.market_demand.customer_count_within_50km / 10, 20);

      return Math.min(scalabilityWeight + accessWeight + incentiveWeight + capacityWeight + customerWeight, 100);
    }

    return null;
  }

  // New analysis format accessors
  get primaryProduct(): CO2Product | null {
    if (this.isNewAnalysisFormat) {
      return (this.analysis as SiteAnalysis).primary_product;
    }
    return null;
  }

  get otherViableProducts(): CO2Product[] {
    if (this.isNewAnalysisFormat) {
      return (this.analysis as SiteAnalysis).other_viable_products || [];
    }
    return [];
  }

  get availableIncentives(): string[] {
    if (this.isNewAnalysisFormat) {
      return (this.analysis as SiteAnalysis).available_incentives || [];
    }
    return [];
  }

  get businessAnalysis(): string | null {
    if (this.isNewAnalysisFormat) {
      return (this.analysis as SiteAnalysis).business_analysis;
    }
    return null;
  }

  get executiveSummary(): string | null {
    if (this.isNewAnalysisFormat) {
      return (this.analysis as SiteAnalysis).executive_summary;
    }
    return null;
  }

  get citedSources(): CitedSource[] {
    if (this.isNewAnalysisFormat) {
      return (this.analysis as SiteAnalysis).cited_sources || [];
    }
    return [];
  }

  get electricityPrice(): number | null {
    if (this.isNewAnalysisFormat) {
      return (this.analysis as SiteAnalysis).electricity_price_per_kwh_usd;
    }
    if (this.isLegacyAnalysisFormat) {
      return (this.analysis as LegacySiteAnalysis).energy_pricing.electricity_price_per_kwh;
    }
    return null;
  }

  get marketPrice(): number | null {
    if (this.isNewAnalysisFormat) {
      return (this.analysis as SiteAnalysis).primary_product_market_price_per_ton_usd;
    }
    return null;
  }

  // Factory method to create Site from new backend analysis data
  static fromAnalysis(analysis: SiteAnalysis, type: SiteType = 'point'): Site {
    const coordinates: Coordinates = {
      latitude: analysis.latitude,
      longitude: analysis.longitude
    };

    return new Site(
      analysis.site_id,
      analysis.location_name,
      type,
      coordinates,
      analysis.executive_summary, // Use executive summary as description
      analysis
    );
  }

  // Helper method to update site with new analysis data
  updateAnalysis(analysis: SiteAnalysis | LegacySiteAnalysis): void {
    this.analysis = analysis;

    // Update coordinates if new format
    if ('latitude' in analysis && 'longitude' in analysis) {
      if (this.type === 'point') {
        this.coordinates = {
          latitude: analysis.latitude,
          longitude: analysis.longitude
        };
      }
    }
  }
}
