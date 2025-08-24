import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Site } from '../../models';
import './MarkdownStyles.css';

interface CSVViewerProps {
  sites: Site[];
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

interface ExpandedCell {
  rowIndex: number;
  cellIndex: number;
  content: string;
  header: string;
}

export const CSVViewer: React.FC<CSVViewerProps> = ({ sites, isOpen, onClose, isMobile }) => {
  const [expandedCell, setExpandedCell] = useState<ExpandedCell | null>(null);

  if (!isOpen) return null;

  // Generate CSV data for display
  const generateCSVData = () => {
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
      'Location Name (Backend)'
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

    // Helper function to get legacy analysis data safely
    const getLegacyData = (site: Site, path: string, defaultValue: any = '') => {
      if (!site.isLegacyAnalysisFormat || !site.analysis) return defaultValue;
      const parts = path.split('.');
      let value = site.analysis as any;
      for (const part of parts) {
        value = value?.[part];
        if (value === undefined) return defaultValue;
      }
      return value;
    };

        // Create both truncated display data and full content data
    const rowsData = sites.map(site => {
      const coords = getCoordinatesForCSV(site);
      const analysis = site.analysis;

      // Get raw viability score from new format
      const rawViabilityScore = site.isNewAnalysisFormat && analysis ?
        (analysis as any).viability_score : '';

      // Get location name from new format
      const locationName = site.isNewAnalysisFormat && analysis ?
        (analysis as any).location_name : '';

      const fullContent = [
        // Basic Site Information
        site.id,
        site.name,
        site.type === 'point' ? 'Point' : 'Area',
        coords.latitude.toFixed(6),
        coords.longitude.toFixed(6),
        coords.centerLatitude.toFixed(6),
        coords.centerLongitude.toFixed(6),
        site.description, // Full description

        // Analysis Overview
        site.hasAnalysis ? 'Yes' : 'No',
        site.isNewAnalysisFormat ? 'New' : site.isLegacyAnalysisFormat ? 'Legacy' : 'None',
        site.profitabilityScore?.toFixed(1) || '',
        rawViabilityScore || '',

        // New Format - Product Analysis
        site.primaryProduct || '',
        site.marketPrice?.toLocaleString() || '',
        site.electricityPrice || '',
        site.isNewAnalysisFormat && analysis ?
          ((analysis as any).can_sell_100_tons_primary_product_within_100_km ? 'Yes' : 'No') : '',
        site.otherViableProducts.join('; ') || '',
        site.otherViableProducts.length || '',

        // New Format - Financial Incentives
        site.availableIncentives.join('; ') || '',
        site.availableIncentives.length || '',

        // New Format - Analysis Content
        site.executiveSummary || '', // Full executive summary
        site.businessAnalysis || '', // Full business analysis
        site.citedSources.length || '',
        locationName || ''
      ];

      const displayContent = [
        // Basic Site Information
        site.id,
        site.name,
        site.type === 'point' ? 'Point' : 'Area',
        coords.latitude.toFixed(6),
        coords.longitude.toFixed(6),
        coords.centerLatitude.toFixed(6),
        coords.centerLongitude.toFixed(6),
        site.description.length > 100 ? site.description.substring(0, 100) + '...' : site.description,

        // Analysis Overview
        site.hasAnalysis ? 'Yes' : 'No',
        site.isNewAnalysisFormat ? 'New' : site.isLegacyAnalysisFormat ? 'Legacy' : 'None',
        site.profitabilityScore?.toFixed(1) || '',
        rawViabilityScore || '',

        // New Format - Product Analysis
        site.primaryProduct || '',
        site.marketPrice?.toLocaleString() || '',
        site.electricityPrice || '',
        site.isNewAnalysisFormat && analysis ?
          ((analysis as any).can_sell_100_tons_primary_product_within_100_km ? 'Yes' : 'No') : '',
        site.otherViableProducts.join('; ') || '',
        site.otherViableProducts.length || '',

        // New Format - Financial Incentives
        site.availableIncentives.join('; ') || '',
        site.availableIncentives.length || '',

        // New Format - Analysis Content
        site.executiveSummary ?
          (site.executiveSummary.length > 150 ? site.executiveSummary.substring(0, 150) + '...' : site.executiveSummary) : '',
        site.businessAnalysis ?
          (site.businessAnalysis.length > 200 ? site.businessAnalysis.substring(0, 200) + '...' : site.businessAnalysis) : '',
        site.citedSources.length || '',
        locationName || ''
      ];

      return {
        display: displayContent,
        full: fullContent,
        site: site
      };
    });

    const rows = rowsData.map(row => row.display);
    const fullRows = rowsData.map(row => row.full);

    return { headers, rows, fullRows };
  };

  const { headers, rows, fullRows } = generateCSVData();

  // Function to handle cell expansion
  const handleCellExpand = (rowIndex: number, cellIndex: number) => {
    const fullContent = fullRows[rowIndex][cellIndex];
    const displayContent = rows[rowIndex][cellIndex];

    // Only expand if content is truncated
    if (String(fullContent) !== String(displayContent) && String(fullContent).length > 0) {
      setExpandedCell({
        rowIndex,
        cellIndex,
        content: String(fullContent),
        header: headers[cellIndex]
      });
    }
  };

  // Function to check if cell is truncated
  const isCellTruncated = (rowIndex: number, cellIndex: number): boolean => {
    const fullContent = String(fullRows[rowIndex][cellIndex]);
    const displayContent = String(rows[rowIndex][cellIndex]);
    return fullContent !== displayContent && fullContent.length > 0;
  };

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
                  {row.map((cell, cellIndex) => {
                    const isTruncated = isCellTruncated(rowIndex, cellIndex);
                    return (
                      <td key={cellIndex} style={{
                        padding: isMobile ? '6px 4px' : '8px 8px',
                        borderBottom: '1px solid #dee2e6',
                        borderRight: '1px solid #dee2e6',
                        maxWidth: isMobile ? '100px' : '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        position: 'relative'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          width: '100%'
                        }}>
                          <span
                            style={{
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={String(cell)}
                          >
                            {String(cell)}
                          </span>
                          {isTruncated && (
                            <button
                              onClick={() => handleCellExpand(rowIndex, cellIndex)}
                              style={{
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                padding: '2px 6px',
                                fontSize: '10px',
                                cursor: 'pointer',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '20px',
                                height: '16px'
                              }}
                              title="View full content"
                            >
                              📄
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
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
          <strong>Tip:</strong> This is a preview of the CSV data. Click the 📄 button on truncated cells to view full content.
          Use the "Export Sites CSV" button to download the complete data.
        </div>
      </div>

      {/* Expanded Cell Modal */}
      {expandedCell && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '80%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                margin: 0,
                color: '#1f2937',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                {expandedCell.header}
              </h3>
              <button
                onClick={() => setExpandedCell(null)}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Content */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '20px'
            }}>
              {/* Check if content should be rendered as markdown */}
              {(expandedCell.header === 'Business Analysis' ||
                expandedCell.header === 'Executive Summary' ||
                expandedCell.header === 'Description') ? (
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#374151'
                }} className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {expandedCell.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: '#374151'
                }}>
                  {expandedCell.content}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              fontSize: '12px',
              color: '#6b7280',
              textAlign: 'center'
            }}>
              Content length: {expandedCell.content.length} characters
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
