import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Site } from '../../models';
import { generateSitePDF } from '../../utils';

interface SiteDetailsProps {
  selectedSite: Site | null;
  sites: Site[];
  onSiteClick: (site: Site) => void;
  onBackToSites: () => void;
  isMobile: boolean;
}

export const SiteDetails: React.FC<SiteDetailsProps> = ({
  selectedSite,
  sites,
  onSiteClick,
  onBackToSites,
  isMobile,
}) => {
  const navigate = useNavigate();

  const handleDownloadPDF = () => {
    if (selectedSite) {
      generateSitePDF(selectedSite);
    }
  };


  return (
    <div
      style={{
        width: isMobile ? '100%' : '400px',
        height: isMobile ? '50vh' : '100vh',
        backgroundColor: '#f8f9fa',
        padding: isMobile ? '15px' : '20px',
        borderLeft: isMobile ? 'none' : '1px solid #dee2e6',
        borderTop: isMobile ? '1px solid #dee2e6' : 'none',
        overflowY: 'auto',
      }}
    >
              {selectedSite ? (
          <div>
            <div style={{
              marginBottom: '20px',
              display: 'flex',
              gap: '10px',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'flex-start'
            }}>
                                          <button
                onClick={onBackToSites}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: isMobile ? '12px 20px' : '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '16px' : '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontWeight: 'bold',
                  flex: isMobile ? 'none' : '1',
                  height: isMobile ? '48px' : '36px',
                  minHeight: isMobile ? '48px' : '36px',
                }}
              >
                ← Back to Sites
              </button>

              <button
                onClick={handleDownloadPDF}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: isMobile ? '12px 20px' : '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '16px' : '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontWeight: 'bold',
                  flex: isMobile ? 'none' : '1',
                  height: isMobile ? '48px' : '36px',
                  minHeight: isMobile ? '48px' : '36px',
                }}
              >
                📄 Download PDF
              </button>
            </div>
          <h2>{selectedSite.name}</h2>
          <div style={{ marginBottom: '15px' }}>
            <strong>ID:</strong> {selectedSite.id}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Type:</strong> {selectedSite.type === 'point' ? 'Point Location' : 'Area'}
          </div>
          {selectedSite.isPoint ? (
            <div style={{ marginBottom: '15px' }}>
              <strong>Coordinates:</strong><br />
              Latitude: {selectedSite.centerPoint.latitude}<br />
              Longitude: {selectedSite.centerPoint.longitude}
            </div>
          ) : (
            <div style={{ marginBottom: '15px' }}>
              <strong>Area Details:</strong><br />
              Center Point: {selectedSite.centerPoint.latitude.toFixed(4)}, {selectedSite.centerPoint.longitude.toFixed(4)}<br />
              Boundary Points: {selectedSite.areaCoordinates!.length - 1}
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  View All Coordinates
                </summary>
                <div style={{
                  maxHeight: '150px',
                  overflowY: 'auto',
                  fontSize: '12px',
                  backgroundColor: '#ffffff',
                  padding: '10px',
                  border: '1px solid #e9ecef',
                  borderRadius: '4px',
                  marginTop: '5px'
                }}>
                  {selectedSite.areaCoordinates!.slice(0, -1).map((coord, index) => (
                    <div key={index}>
                      Point {index + 1}: [{coord[0].toFixed(4)}, {coord[1].toFixed(4)}]
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
          <div style={{ marginBottom: '15px' }}>
            <strong>Description:</strong><br />
            {selectedSite.description}
          </div>

          {/* Analysis Section */}
          {selectedSite.hasAnalysis && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#ffffff',
              border: '1px solid #e9ecef',
              borderRadius: '4px'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#495057' }}>
                Site Analysis
                {selectedSite.profitabilityScore && (
                  <span style={{
                    marginLeft: '10px',
                    fontSize: '14px',
                    color: selectedSite.profitabilityScore >= 70 ? '#28a745' : selectedSite.profitabilityScore >= 50 ? '#ffc107' : '#dc3545',
                    fontWeight: 'bold'
                  }}>
                    Score: {selectedSite.profitabilityScore.toFixed(0)}/100
                  </span>
                )}
              </h3>

              {/* Energy Pricing */}
              <div style={{ marginBottom: '12px' }}>
                <strong>Energy Pricing:</strong><br />
                <div style={{ fontSize: '14px', marginLeft: '10px' }}>
                  Electricity: ${selectedSite.analysis!.energy_pricing.electricity_price_per_kwh}/kWh<br />
                  CO₂ Credits: ${selectedSite.analysis!.energy_pricing.co2_price_per_ton}/ton
                </div>
              </div>

              {/* Market Demand */}
              <div style={{ marginBottom: '12px' }}>
                <strong>Market Demand:</strong><br />
                <div style={{ fontSize: '14px', marginLeft: '10px' }}>
                  Capacity: {selectedSite.analysis!.market_demand.methane_capacity_tons.toLocaleString()} tons/year<br />
                  Customers (50km): {selectedSite.analysis!.market_demand.customer_count_within_50km}<br />
                  Pipeline Access: {selectedSite.analysis!.market_demand.has_pipeline_access ? '✅ Yes' : '❌ No'}<br />
                  Scalability: {selectedSite.analysis!.market_demand.scalability_rating}/5
                </div>
              </div>

              {/* Financial Incentives */}
              <div style={{ marginBottom: '12px' }}>
                <strong>Financial Incentives:</strong><br />
                <div style={{ fontSize: '14px', marginLeft: '10px' }}>
                  Available Grants: ${selectedSite.analysis!.financial_incentives.available_grants_usd.toLocaleString()}<br />
                  Tax Credits: {selectedSite.analysis!.financial_incentives.tax_credits_available ? '✅ Available' : '❌ Not Available'}<br />
                  <em>{selectedSite.analysis!.financial_incentives.incentive_summary}</em>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '10px' }}>
                Last Updated: {new Date(selectedSite.analysis!.last_updated).toLocaleString()}
              </div>
            </div>
          )}

          {!selectedSite.hasAnalysis && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#6c757d' }}>
                📊 Site analysis data not available
              </div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
                Analysis pending or not yet performed
                            </div>
            </div>
          )}


        </div>
      ) : (
        <div>
          <h2>Site Details</h2>
          <p>Click on a marker on the map to view site details.</p>
          <div style={{ marginTop: '20px' }}>
            <h3>Available Sites:</h3>
            <ul>
              {sites.map((site) => (
                <li
                  key={site.id}
                  style={{
                    cursor: 'pointer',
                    padding: isMobile ? '12px' : '8px',
                    marginBottom: isMobile ? '8px' : '5px',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    border: '1px solid #e9ecef',
                    fontSize: isMobile ? '16px' : '14px',
                    listStyle: 'none',
                  }}
                  onClick={() => onSiteClick(site)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: site.isPoint ? '50%' : '2px',
                      backgroundColor: site.isPoint ? '#ff6b6b' : '#3388ff',
                    }} />
                    <span>{site.name}</span>
                                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{
                        fontSize: '11px',
                        color: '#6c757d'
                      }}>
                        {site.isPoint ? 'Point' : 'Area'}
                      </span>
                      {site.hasAnalysis && (
                        <span style={{
                          fontSize: '10px',
                          backgroundColor: site.profitabilityScore && site.profitabilityScore >= 70 ? '#d4edda' :
                                         site.profitabilityScore && site.profitabilityScore >= 50 ? '#fff3cd' : '#f8d7da',
                          color: site.profitabilityScore && site.profitabilityScore >= 70 ? '#155724' :
                                site.profitabilityScore && site.profitabilityScore >= 50 ? '#856404' : '#721c24',
                          padding: '2px 4px',
                          borderRadius: '2px',
                          fontWeight: 'bold'
                        }}>
                          📊 {site.profitabilityScore?.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
