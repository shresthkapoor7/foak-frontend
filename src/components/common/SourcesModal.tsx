import React from 'react';
import { CitedSource } from '../../models';

interface SourcesModalProps {
  sources: CitedSource[];
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export const SourcesModal: React.FC<SourcesModalProps> = ({ sources, isOpen, onClose, isMobile }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: isMobile ? '20px' : '40px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: isMobile ? '20px' : '30px',
          maxWidth: isMobile ? '100%' : '600px',
          maxHeight: isMobile ? '80vh' : '70vh',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #e9ecef',
          paddingBottom: '15px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: isMobile ? '20px' : '24px',
            color: '#333',
            fontWeight: '600'
          }}>
            Research Sources & Citations
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6c757d',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.color = '#495057';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6c757d';
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '8px'
        }}>
          {sources.map((source, index) => (
            <div
              key={index}
              style={{
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                border: '1px solid #e9ecef'
              }}
            >
              {/* Source Number and URL */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1, wordBreak: 'break-word' }}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#007bff',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      lineHeight: '1.4'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    {source.url}
                  </a>
                </div>
              </div>

              {/* Extracted Quote */}
              <div style={{
                backgroundColor: 'white',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
                fontStyle: 'italic',
                color: '#495057',
                fontSize: '14px',
                lineHeight: '1.5',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '12px',
                  backgroundColor: 'white',
                  padding: '0 8px',
                  fontSize: '12px',
                  color: '#6c757d',
                  fontWeight: '500'
                }}>
                  Quote
                </div>
                "{source.extracted_quote}"
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '20px',
          paddingTop: '15px',
          borderTop: '1px solid #e9ecef',
          textAlign: 'center',
          color: '#6c757d',
          fontSize: '14px'
        }}>
          {sources.length} source{sources.length !== 1 ? 's' : ''} • Click any URL to visit
        </div>
      </div>
    </div>
  );
};
