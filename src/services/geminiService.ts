import { GoogleGenerativeAI } from '@google/generative-ai';
import { Site } from '../models';

// Note: In production, this should be stored in environment variables
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'your-gemini-api-key-here';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  formatSitesContext(sites: Site[]): string {
    let context = `Sites Database Overview:
Total Sites: ${sites.length}
Sites with Analysis: ${sites.filter(s => s.hasAnalysis).length}

Detailed Site Information:
`;

    sites.forEach((site, index) => {
      context += `
${index + 1}. ${site.name} (ID: ${site.id})
   - Type: ${site.type === 'point' ? 'Point Location' : 'Area'}
   - Description: ${site.description}`;

      if (site.isPoint) {
        const coords = site.centerPoint;
        context += `
   - Coordinates: Latitude ${coords.latitude}, Longitude ${coords.longitude}`;
      } else {
        const center = site.centerPoint;
        const boundaryCount = site.areaCoordinates ? site.areaCoordinates.length - 1 : 0;
        context += `
   - Center Point: Latitude ${center.latitude.toFixed(4)}, Longitude ${center.longitude.toFixed(4)}
   - Boundary Points: ${boundaryCount}`;
      }

      if (site.hasAnalysis && site.analysis) {
        context += `
   - Profitability Score: ${site.profitabilityScore?.toFixed(1) || 'N/A'}/100
   - Energy Pricing: $${site.analysis.energy_pricing.electricity_price_per_kwh}/kWh electricity, $${site.analysis.energy_pricing.co2_price_per_ton}/ton CO2
   - Market: ${site.analysis.market_demand.methane_capacity_tons.toLocaleString()} tons/year capacity, ${site.analysis.market_demand.customer_count_within_50km} customers within 50km
   - Pipeline Access: ${site.analysis.market_demand.has_pipeline_access ? 'Yes' : 'No'}
   - Scalability: ${site.analysis.market_demand.scalability_rating}/5
   - Available Grants: $${site.analysis.financial_incentives.available_grants_usd.toLocaleString()}
   - Tax Credits: ${site.analysis.financial_incentives.tax_credits_available ? 'Available' : 'Not Available'}`;
      } else {
        context += `
   - Analysis: Not available`;
      }
    });

    return context;
  }

  formatSiteContext(site: Site): string {
    let context = `Site Information:
- ID: ${site.id}
- Name: ${site.name}
- Type: ${site.type === 'point' ? 'Point Location' : 'Area'}
- Description: ${site.description}`;

    if (site.isPoint) {
      const coords = site.centerPoint;
      context += `
- Coordinates: Latitude ${coords.latitude}, Longitude ${coords.longitude}`;
    } else {
      const center = site.centerPoint;
      const boundaryCount = site.areaCoordinates ? site.areaCoordinates.length - 1 : 0;
      context += `
- Center Point: Latitude ${center.latitude.toFixed(4)}, Longitude ${center.longitude.toFixed(4)}
- Boundary Points: ${boundaryCount}`;
    }

    if (site.hasAnalysis && site.analysis) {
      context += `

Site Analysis:
- Profitability Score: ${site.profitabilityScore?.toFixed(1) || 'N/A'}/100
- Last Updated: ${new Date(site.analysis.last_updated).toLocaleString()}

Energy Pricing:
- Electricity Price: $${site.analysis.energy_pricing.electricity_price_per_kwh}/kWh
- CO2 Credit Price: $${site.analysis.energy_pricing.co2_price_per_ton}/ton

Market Demand:
- Methane Capacity: ${site.analysis.market_demand.methane_capacity_tons.toLocaleString()} tons/year
- Customers within 50km: ${site.analysis.market_demand.customer_count_within_50km}
- Pipeline Access: ${site.analysis.market_demand.has_pipeline_access ? 'Yes' : 'No'}
- Scalability Rating: ${site.analysis.market_demand.scalability_rating}/5

Financial Incentives:
- Available Grants: $${site.analysis.financial_incentives.available_grants_usd.toLocaleString()}
- Tax Credits Available: ${site.analysis.financial_incentives.tax_credits_available ? 'Yes' : 'No'}
- Incentive Summary: ${site.analysis.financial_incentives.incentive_summary}`;
    } else {
      context += `

Site Analysis: Not available - analysis pending or not yet performed.`;
    }

    return context;
  }

      async sendMessage(
    message: string,
    siteContext?: Site,
    sitesContext?: Site[],
    conversationHistory?: Array<{role: 'user' | 'assistant', content: string}>
  ): Promise<string> {
    try {
      let systemPrompt = '';
      let fullPrompt = message;

      if (sitesContext) {
        const context = this.formatSitesContext(sitesContext);
        systemPrompt = `You are an AI assistant helping with energy project planning and site analysis. You have access to a comprehensive database of sites with their analysis data. Here is the complete context:

${context}

You can:
- Compare different sites and their potential
- Recommend the best sites for specific criteria
- Analyze trends across the portfolio
- Provide insights on market opportunities
- Help with investment decisions
- Answer questions about specific sites by name or ID

Be specific and reference actual data from the sites when relevant.`;
      } else if (siteContext) {
        const context = this.formatSiteContext(siteContext);
        systemPrompt = `You are an AI assistant helping with site analysis and energy project planning. Here is the context about the current site:

${context}

Please provide a helpful and informative response based on the site data provided. If the user asks about specific metrics, refer to the analysis data when available.`;
      }

      // Build conversation context if history is provided
      if (conversationHistory && conversationHistory.length > 0) {
        let conversationContext = systemPrompt + '\n\nConversation History:\n';
        conversationHistory.forEach((msg, index) => {
          conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
        });
        conversationContext += `\nUser: ${message}\n\nAssistant:`;
        fullPrompt = conversationContext;
      } else {
        fullPrompt = systemPrompt + '\n\nUser question: ' + message;
      }

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to get response from AI assistant. Please check your API key and try again.');
    }
  }

  isConfigured(): boolean {
    return API_KEY !== 'your-gemini-api-key-here' && API_KEY.length > 0;
  }
}

export const geminiService = new GeminiService();
