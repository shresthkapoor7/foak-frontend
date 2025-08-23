import React from 'react';
import { Site } from '../../models';

interface CSVViewerProps {
  sites: Site[];
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export const CSVViewer: React.FC<CSVViewerProps> = ({ sites, isOpen, onClose, isMobile }) => {
  if (!isOpen) return null;

  // Generate CSV data for display
  const generateCSVData = () => {
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
        return {
          latitude: coords[0][0],
          longitude: coords[0][1],
          centerLatitude: center.latitude,
          centerLongitude: center.longitude
        };
      }
    };

    const rows = sites.map(site => {
      const coords = getCoordinatesForCSV(site);
      const analysis = site.analysis;

      return [
        site.id,
        site.name,
        site.type === 'point' ? 'Point' : 'Area',
        coords.latitude.toFixed(6),
        coords.longitude.toFixed(6),
        coords.centerLatitude.toFixed(6),
        coords.centerLongitude.toFixed(6),
        site.description,
        site.hasAnalysis ? 'Yes' : 'No',
        site.profitabilityScore?.toFixed(1) || '',
        analysis?.energy_pricing.electricity_price_per_kwh || '',
        analysis?.energy_pricing.co2_price_per_ton || '',
        analysis?.market_demand.methane_capacity_tons || '',
        analysis?.market_demand.customer_count_within_50km || '',
        analysis?.market_demand.has_pipeline_access ? 'Yes' : analysis?.market_demand.has_pipeline_access === false ? 'No' : '',
        analysis?.market_demand.scalability_rating || '',
        analysis?.financial_incentives.available_grants_usd || '',
        analysis?.financial_incentives.tax_credits_available ? 'Yes' : analysis?.financial_incentives.tax_credits_available === false ? 'No' : '',
        analysis?.financial_incentives.incentive_summary || '',
        analysis?.last_updated ? new Date(analysis.last_updated).toLocaleString() : ''
      ];
    });

    return { headers, rows };
  };

  const { headers, rows } = generateCSVData();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '10px' : '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '95%',
        height: '90%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#495057' }}>
            Sites Data Preview ({sites.length} sites)
          </h3>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Table Container */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '0'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: isMobile ? '12px' : '13px'
          }}>
            <thead style={{
              backgroundColor: '#f8f9fa',
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}>
              <tr>
                {headers.map((header, index) => (
                  <th key={index} style={{
                    padding: isMobile ? '8px 4px' : '12px 8px',
                    textAlign: 'left',
                    borderBottom: '2px solid #dee2e6',
                    borderRight: '1px solid #dee2e6',
                    fontWeight: 'bold',
                    color: '#495057',
                    minWidth: isMobile ? '80px' : '120px',
                    whiteSpace: 'nowrap'
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} style={{
                  backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#f8f9fa'
                }}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} style={{
                      padding: isMobile ? '6px 4px' : '8px 8px',
                      borderBottom: '1px solid #dee2e6',
                      borderRight: '1px solid #dee2e6',
                      maxWidth: isMobile ? '100px' : '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      <span title={String(cell)}>
                        {String(cell)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          padding: '15px 20px',
          borderTop: '1px solid #dee2e6',
          backgroundColor: '#f8f9fa',
          fontSize: '12px',
          color: '#6c757d'
        }}>
          <strong>Tip:</strong> This is a preview of the CSV data. Scroll horizontally to see all columns.
          Use the "Export Sites CSV" button to download the full data.
        </div>
      </div>
    </div>
  );
};
