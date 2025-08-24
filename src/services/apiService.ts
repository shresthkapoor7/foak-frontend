import { Site, SiteAnalysis } from '../models';
import { sampleSites } from '../data/sampleSites';

const API_BASE_URL = 'https://foak-backend-production.up.railway.app';

// CORS proxy for development (if needed)
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const USE_CORS_PROXY = false; // Set to true if you need to bypass CORS during development

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

class ApiService {
    private async fetchWithErrorHandling<T>(url: string): Promise<ApiResponse<T>> {
    try {
      console.log('Fetching from URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
          // Removed Content-Type header for GET requests as it can cause CORS preflight
        },
        mode: 'cors' // Explicitly set CORS mode
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return { data };
    } catch (error) {
      console.error('API fetch error:', error);

      // More specific error messages
      let errorMessage = 'Unknown error occurred';
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to connect to the API. This could be due to CORS policy, network connectivity, or the server being unavailable.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        data: [] as unknown as T,
        error: errorMessage
      };
    }
  }

    async getLatestSiteAnalyses(useFallback: boolean = true): Promise<ApiResponse<Site[]>> {
    const baseUrl = USE_CORS_PROXY ? `${CORS_PROXY}${API_BASE_URL}` : API_BASE_URL;
    const url = `${baseUrl}/site-analyses/latest`;
    const response = await this.fetchWithErrorHandling<SiteAnalysis[]>(url);

    if (response.error) {
      if (useFallback) {
        console.warn('API failed, using sample data as fallback');
        return {
          data: sampleSites,
          error: `API Error (using sample data): ${response.error}`
        };
      }
      return { data: [], error: response.error };
    }

    // Convert SiteAnalysis objects to Site objects
    const sites = response.data.map(analysis => {
      return Site.fromAnalysis(analysis);
    });

    console.log(`Successfully loaded ${sites.length} sites from API`);
    return { data: sites };
  }

  async getSiteAnalysisById(siteId: string): Promise<ApiResponse<Site | null>> {
    // For now, we'll get all sites and filter by ID
    // In the future, you might want a dedicated endpoint for single site
    const response = await this.getLatestSiteAnalyses();

    if (response.error) {
      return { data: null, error: response.error };
    }

    const site = response.data.find(site => site.id === siteId) || null;
    return { data: site };
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const baseUrl = USE_CORS_PROXY ? `${CORS_PROXY}${API_BASE_URL}` : API_BASE_URL;
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: { 'accept': 'application/json' },
        mode: 'cors'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Test method to help debug API issues
  async testApiConnection(): Promise<{ success: boolean; details: string }> {
    try {
      console.log('Testing API connection...');

      // Test basic connectivity
      const baseUrl = USE_CORS_PROXY ? `${CORS_PROXY}${API_BASE_URL}` : API_BASE_URL;
      console.log('Testing URL:', `${baseUrl}/site-analyses/latest`);

      const response = await fetch(`${baseUrl}/site-analyses/latest`, {
        method: 'GET',
        headers: { 'accept': 'application/json' },
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          details: `✅ API connection successful! Received ${Array.isArray(data) ? data.length : 'unknown'} items.`
        };
      } else {
        return {
          success: false,
          details: `❌ API returned status ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        details: `❌ API connection failed: ${errorMsg}`
      };
    }
  }
}

export const apiService = new ApiService();
