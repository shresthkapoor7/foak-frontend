export type SiteType = 'point' | 'area';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface EnergyPricing {
  electricity_price_per_kwh: number; // Current electricity price in $/kWh for the location
  co2_price_per_ton: number; // Carbon credit price in $/ton CO2 equivalent
}

export interface MarketDemand {
  methane_capacity_tons: number; // Annual methane production capacity in tons
  customer_count_within_50km: number; // Number of potential industrial customers within 50km radius
  has_pipeline_access: boolean; // Whether site has access to existing gas pipeline infrastructure
  scalability_rating: number; // Scalability potential from 1 (limited) to 5 (high growth potential)
}

export interface FinancialIncentives {
  available_grants_usd: number; // Total available government grants and subsidies in USD
  tax_credits_available: boolean; // Whether renewable energy tax credits are available
  incentive_summary: string; // Brief summary of key financial incentives
}

export interface SiteAnalysis {
  site_id: string; // Unique identifier for the analyzed site
  location_name: string; // Human-readable site location
  energy_pricing: EnergyPricing;
  market_demand: MarketDemand;
  financial_incentives: FinancialIncentives;
  last_updated: string; // ISO timestamp of when analysis was performed
}

export class Site {
  id: string;
  name: string;
  type: SiteType;
  coordinates: Coordinates | Coordinates[];
  description: string;
  analysis?: SiteAnalysis; // Optional analysis data from backend

  constructor(
    id: string,
    name: string,
    type: SiteType,
    coordinates: Coordinates | Coordinates[],
    description: string,
    analysis?: SiteAnalysis
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
    // You could extend this logic to check for pending analysis
    return 'not_available';
  }

  get profitabilityScore(): number | null {
    if (!this.analysis) return null;

    // Simple scoring algorithm based on available data
    const scalabilityWeight = this.analysis.market_demand.scalability_rating * 20;
    const accessWeight = this.analysis.market_demand.has_pipeline_access ? 20 : 0;
    const incentiveWeight = this.analysis.financial_incentives.tax_credits_available ? 15 : 0;
    const capacityWeight = Math.min(this.analysis.market_demand.methane_capacity_tons / 1000, 25);
    const customerWeight = Math.min(this.analysis.market_demand.customer_count_within_50km / 10, 20);

    return Math.min(scalabilityWeight + accessWeight + incentiveWeight + capacityWeight + customerWeight, 100);
  }
}
