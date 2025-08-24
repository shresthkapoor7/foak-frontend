import { Site, CO2Product } from '../models';

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

  // Fort McMurray Oil Sands Industrial Park - comprehensive backend data
  new Site(
    '2b1701de-1f4c-4ddf-be1c-07c6a33c7b2d',
    'Fort McMurray Oil Sands Industrial Park',
    'point',
    { latitude: 56.7264, longitude: -111.379 },
    "**Premier CO2-to-Methanol Opportunity in Canada's Oil Sands Region**\n\nFort McMurray's oil sands region offers a world-class opportunity for CO2-to-methanol production, featuring:\n\n- **Massive CO2 sources**: 40 MT/year by 2026  \n- **Strong market fundamentals**: $662/MT methanol prices\n- **Government support**: Up to 62% capital cost coverage\n- **Strategic location**: Access to domestic and Asian export markets\n\nThis site represents an ideal convergence of *environmental impact* and *economic opportunity* in Canada's transition to net-zero.",
    {
      location_name: "Fort McMurray Oil Sands Industrial Park (Athabasca region)",
      latitude: 56.7264,
      longitude: -111.379,
      primary_product: CO2Product.METHANOL,
      primary_product_market_price_per_ton_usd: 662,
      electricity_price_per_kwh_usd: 0.13,
      can_sell_100_tons_primary_product_within_100_km: true,
      other_viable_products: [
        CO2Product.DIMETHYL_CARBONATE,
        CO2Product.FORMIC_ACID,
        CO2Product.MTO_OLEFINS,
        CO2Product.POLYURETHANE
      ],
      available_incentives: [
        "Alberta Carbon Capture Incentive Program (ACCIP): 12% grant of eligible capital costs",
        "Federal CCUS Investment Tax Credit: 50% refundable tax credit for carbon capture equipment (non-DAC)",
        "Federal CCUS Investment Tax Credit: 37.5% refundable tax credit for CO2 transportation/storage/utilization equipment",
        "Emissions Reduction Alberta funding: Various project-specific grants",
        "Canada Growth Fund: Cost-sharing partnerships for CCUS projects"
      ],
      business_analysis: "## Market Opportunity\n\nThe Fort McMurray Oil Sands Industrial Park presents an **exceptional opportunity** for large-scale CO2-to-methanol conversion, leveraging the region's massive CO2 emissions infrastructure and strategic market position. The site benefits from concentrated CO2 sources, with the Pathways Alliance planning to capture **40 million tonnes of CO2 annually** from over 20 oil sands facilities in the Athabasca region by late 2026.\n\n### Key Market Advantages:\n- Reliable, high-purity CO2 feedstock\n- Established industrial infrastructure\n- Strategic location for both domestic and export markets\n\n## Market Dynamics\n\nMarket dynamics strongly favor methanol production at this location:\n\n- **Current demand**: 520,000 tonnes annually in Canada\n- **Growth projection**: 3.7% CAGR through 2034\n- **Target market size**: 775,000 tonnes by 2034\n- **Export potential**: 70% of global demand from Asian markets\n- **Current pricing**: $662/MT provides healthy margins\n\n## Technical Feasibility\n\nTechnical feasibility is enhanced by several factors:\n\n1. **Infrastructure**: Planned Pathways Alliance CCUS infrastructure\n2. **Expertise**: Established petrochemical workforce\n3. **Risk mitigation**: Multiple $1.5-2B CCUS projects already planned\n4. **Pipeline access**: Existing rights-of-way connections\n\n## Economic Analysis\n\nThe economics are compelling with **multiple revenue streams**:\n\n- Primary revenue from methanol sales at market prices\n- Secondary income from carbon credits\n- Substantial government incentives reducing capital costs\n\n### Government Support Package:\n- **62% coverage** of carbon capture equipment costs\n- **49.5% coverage** of utilization equipment costs\n- Dramatic improvement in project ROI\n\n## Strategic Advantages\n\n*Strategic advantages include*:\n- Integration with existing oil sands operations\n- Access to established transportation infrastructure  \n- Proximity to industrial hydrogen production\n- Alignment with decarbonization strategies\n- Partnership opportunities with major industry players",
      executive_summary: "Fort McMurray's oil sands region offers a **world-class opportunity** for CO2-to-methanol production, combining:\n\n- **Massive CO2 sources**: 40 MT/year by 2026\n- **Robust market demand**: Growing at 3.7% CAGR\n- **Exceptional government support**: Up to 62% of capital costs\n- **Strong economics**: $662/MT methanol prices\n\n*This site can achieve profitable operations while supporting Canada's net-zero ambitions and capturing growing Asian market demand.*",
      cited_sources: [
        {
          url: "https://chinookpetroleum.com/carbon-sequestration-projects-canada/",
          extracted_quote: "Pathways Alliance...Proposed capacity: 40,000,000 tons CO2 per year...Capture: from more than twenty oil sands in-situ and mining projects in the Athabasca/Cold Lake oil sands areas and oil sands upgraders operating the the Fort McMurray area"
        },
        {
          url: "https://www.chemanalyst.com/industry-report/canada-methanol-market-174",
          extracted_quote: "The Canada Methanol market demand stood at 520 thousand tonnes in 2023 and is expected to grow at a CAGR of 3.7% through 2034...Canada Methanol market is likely to reach roughly 775 thousand tonnes in the year 2034"
        },
        {
          url: "https://www.chemanalyst.com/Pricing-data/methanol-1",
          extracted_quote: "Ending Q2 2024, the Methanol price in the USA stood at USD 662/MT DEL Louisiana"
        },
        {
          url: "https://energyrates.ca/here-is-what-alberta-electricity-rates-look-like-right-now/",
          extracted_quote: "In 2024...The average regulated rate was about 30% higher at ¢12.52/kWh, whereas the average fixed and floating rates were at ¢9.49/kWh and ¢9.22/kWh, respectively"
        },
        {
          url: "https://hellodarwin.com/business-aid/programs/alberta-carbon-capture-incentive-program",
          extracted_quote: "The Alberta Carbon Capture Incentive Program (ACCIP) provides grants covering 12% of eligible capital costs for new carbon capture, utilization, and storage (CCUS) projects, with total program funding expected between $3.2 and $5.3 billion from 2024 to 2035"
        },
        {
          url: "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/corporations/business-tax-credits/clean-economy-itc/carbon-capture-itc.html",
          extracted_quote: "The CCUS ITC is a refundable tax credit that applies to eligible expenditures incurred for a qualified CCUS project, from January 1, 2022, to December 31, 2040"
        },
        {
          url: "https://www.fasken.com/en/knowledge/2024/10/canadas-clean-energy-investment-tax-credits-insights-as-of-october-2024",
          extracted_quote: "50% for Qualified Carbon Capture Expenditures incurred to capture carbon other than directly from ambient air; and 37.5% for Qualified Carbon Transportation Expenditures, Qualified Carbon Storage Expenditures and Qualified Carbon Use Expenditures"
        },
        {
          url: "https://www.energyconnects.com/news/renewables/2024/july/strathcona-plans-1-5-billion-oil-sands-carbon-capture-projects/",
          extracted_quote: "Canadian driller Strathcona Resources Ltd. is planning as much as C$2 billion ($1.5 billion) in projects to capture carbon dioxide emissions from its oil-sands operations...The driller says the project will capture as much as 2 million metric tons of CO2 a year"
        },
        {
          url: "https://www.imarcgroup.com/canada-methanol-market",
          extracted_quote: "The largest market share of Methanol goes in the production of Formaldehyde. This industry consumed about 35% in the year 2023"
        },
        {
          url: "https://ammoniaknowhow.com/new-2-billion-methanol-plant-planned-for-alberta-canada/",
          extracted_quote: "most will be directed to Asian markets, which make up approximately 70 percent of current global demand"
        }
      ],
      viability_score: 7,
      site_id: "2b1701de-1f4c-4ddf-be1c-07c6a33c7b2d",
      last_updated: "2025-08-24T13:19:04.961191"
    }
  )
];
