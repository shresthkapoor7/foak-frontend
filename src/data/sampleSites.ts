import { Site } from '../models';

export const sampleSites: Site[] = [
  // Point locations
  new Site(
    '1',
    'Times Square',
    'point',
    { latitude: 40.7580, longitude: -73.9855 },
    'A major commercial intersection and tourist destination in Midtown Manhattan, New York City.',
    {
      site_id: '1',
      location_name: 'Times Square, Manhattan',
      energy_pricing: {
        electricity_price_per_kwh: 0.18,
        co2_price_per_ton: 45.50
      },
      market_demand: {
        methane_capacity_tons: 2500,
        customer_count_within_50km: 150,
        has_pipeline_access: true,
        scalability_rating: 4
      },
      financial_incentives: {
        available_grants_usd: 2500000,
        tax_credits_available: true,
        incentive_summary: 'New York State renewable energy tax credits, federal ITC, and urban development grants available'
      },
      last_updated: '2024-12-19T10:30:00Z'
    }
  ),
  new Site(
    '2',
    'Golden Gate Bridge',
    'point',
    { latitude: 37.8199, longitude: -122.4783 },
    'An iconic suspension bridge spanning the Golden Gate strait in San Francisco, California.'
  ),
  new Site(
    '3',
    'Statue of Liberty',
    'point',
    { latitude: 40.6892, longitude: -74.0445 },
    'A neoclassical sculpture on Liberty Island in New York Harbor, a symbol of freedom and democracy.'
  ),

  // Area locations
  new Site(
    '4',
    'Central Park',
    'area',
    [
      { latitude: 40.7969, longitude: -73.9505 }, // Northeast corner
      { latitude: 40.7969, longitude: -73.9804 }, // Northwest corner
      { latitude: 40.7641, longitude: -73.9804 }, // Southwest corner
      { latitude: 40.7641, longitude: -73.9505 }, // Southeast corner
      { latitude: 40.7969, longitude: -73.9505 }  // Close the polygon
    ],
    'A large public park in New York City, located in Manhattan between the Upper West Side and Upper East Side. This area shows the approximate boundaries of the entire park.',
    {
      site_id: '4',
      location_name: 'Central Park Area, Manhattan',
      energy_pricing: {
        electricity_price_per_kwh: 0.16,
        co2_price_per_ton: 48.00
      },
      market_demand: {
        methane_capacity_tons: 5000,
        customer_count_within_50km: 200,
        has_pipeline_access: false,
        scalability_rating: 3
      },
      financial_incentives: {
        available_grants_usd: 1800000,
        tax_credits_available: true,
        incentive_summary: 'NYC green infrastructure incentives, state environmental credits, limited by park preservation requirements'
      },
      last_updated: '2024-12-19T09:15:00Z'
    }
  ),
  new Site(
    '5',
    'Manhattan Financial District',
    'area',
    [
      { latitude: 40.7081, longitude: -74.0170 }, // North
      { latitude: 40.7074, longitude: -74.0130 }, // Northeast
      { latitude: 40.7043, longitude: -74.0090 }, // East
      { latitude: 40.7013, longitude: -74.0120 }, // South
      { latitude: 40.7031, longitude: -74.0180 }, // Southwest
      { latitude: 40.7051, longitude: -74.0190 }, // West
      { latitude: 40.7081, longitude: -74.0170 }  // Close the polygon
    ],
    'The Financial District of Lower Manhattan, home to Wall Street and many major financial institutions. This area encompasses the historic financial center of New York City.'
  ),
  new Site(
    '6',
    'Hollywood Hills Area',
    'area',
    [
      { latitude: 34.1350, longitude: -118.3400 }, // North
      { latitude: 34.1350, longitude: -118.3000 }, // Northeast
      { latitude: 34.1100, longitude: -118.3000 }, // Southeast
      { latitude: 34.1100, longitude: -118.3400 }, // Southwest
      { latitude: 34.1350, longitude: -118.3400 }  // Close the polygon
    ],
    'The Hollywood Hills area in Los Angeles, including the famous Hollywood Sign and surrounding residential neighborhoods with scenic views of the city.'
  )
];
