import jsPDF from 'jspdf';
import { Site } from '../models';
import { parseMarkdownForPDF, renderMarkdownToPDF } from './markdownParser';

export const generateSitePDF = (site: Site): void => {
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 7;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper function to add text with automatic wrapping and page break handling
  const addText = (text: string, x: number, y: number, options?: any) => {
    const lines = doc.splitTextToSize(text, contentWidth - x + margin);

    // Check if we need a new page
    if (y + (lines.length * lineHeight) > 270) {
      doc.addPage();
      y = 20;
    }

    doc.text(lines, x, y, options);
    return y + (lines.length * lineHeight);
  };

  // Helper function to add a section header
  const addSectionHeader = (title: string, y: number) => {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const newY = addText(title, margin, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    return newY + 3;
  };

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  yPosition = addText(`Site Report: ${site.name}`, margin, yPosition);
  yPosition += 10;

  // Basic Information
  yPosition = addSectionHeader('Basic Information', yPosition);
  doc.setFont('helvetica', 'normal');
  yPosition = addText(`Site ID: ${site.id}`, margin, yPosition);
  yPosition = addText(`Type: ${site.type === 'point' ? 'Point Location' : 'Area'}`, margin, yPosition);

  if (site.isPoint) {
    const coords = site.centerPoint;
    yPosition = addText(`Coordinates: ${coords.latitude}, ${coords.longitude}`, margin, yPosition);
  } else {
    const coords = site.centerPoint;
    yPosition = addText(`Center Point: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`, margin, yPosition);
    yPosition = addText(`Boundary Points: ${site.areaCoordinates!.length - 1}`, margin, yPosition);
  }
  yPosition += 5;

  // Description
  yPosition = addSectionHeader('Description', yPosition);
  yPosition = addText(site.description, margin, yPosition);
  yPosition += 5;

  // Key Metrics Summary (if analysis available)
  if (site.hasAnalysis && site.analysis) {
    yPosition = addSectionHeader('Key Metrics Summary', yPosition);

    if (site.profitabilityScore) {
      yPosition = addText(`Overall Score: ${site.profitabilityScore.toFixed(0)}/100`, margin, yPosition);
    }

    if (site.isNewAnalysisFormat) {
      const newAnalysis = site.analysis as any;
      yPosition = addText(`Primary Product: ${site.primaryProduct}`, margin, yPosition);
      if (site.marketPrice) {
        yPosition = addText(`Market Price: $${site.marketPrice.toLocaleString()}/ton`, margin, yPosition);
      }
      if (newAnalysis.viability_score) {
        yPosition = addText(`Raw Viability Score: ${newAnalysis.viability_score}/10`, margin, yPosition);
      }
      yPosition = addText(`Analysis Status: Comprehensive Analysis Available`, margin, yPosition);
    } else if (site.isLegacyAnalysisFormat) {
      yPosition = addText(`Analysis Status: Legacy Analysis Available`, margin, yPosition);
    }

    yPosition = addText(`Last Updated: ${new Date(site.analysis.last_updated).toLocaleString()}`, margin, yPosition);
    yPosition += 10;
  }

  // Analysis Section (if available)
  if (site.hasAnalysis && site.analysis) {
    yPosition = addSectionHeader('Detailed Analysis', yPosition);

    // Handle different analysis formats
    if (site.isNewAnalysisFormat) {
      const newAnalysis = site.analysis as any;

      // New format analysis
      yPosition = addSectionHeader('Product Analysis', yPosition);
      yPosition = addText(`Primary Product: ${site.primaryProduct}`, margin, yPosition);
      if (site.marketPrice) {
        yPosition = addText(`Market Price: $${site.marketPrice.toLocaleString()}/ton USD`, margin, yPosition);
      }
      if (site.electricityPrice) {
        yPosition = addText(`Electricity Price: $${site.electricityPrice}/kWh USD`, margin, yPosition);
      }

      // Add market accessibility info
      if (newAnalysis.can_sell_100_tons_primary_product_within_100_km !== undefined) {
        yPosition = addText(`Can sell 100+ tons within 100km: ${newAnalysis.can_sell_100_tons_primary_product_within_100_km ? 'Yes' : 'No'}`, margin, yPosition);
      }

      // Add viability score from original data
      if (newAnalysis.viability_score !== undefined) {
        yPosition = addText(`Viability Score: ${newAnalysis.viability_score}/10`, margin, yPosition);
      }

      yPosition += 5;

      if (site.otherViableProducts.length > 0) {
        yPosition = addSectionHeader('Other Viable Products', yPosition);
        site.otherViableProducts.forEach(product => {
          yPosition = addText(`• ${product}`, margin, yPosition);
        });
        yPosition += 5;
      }

      if (site.availableIncentives.length > 0) {
        yPosition = addSectionHeader('Available Incentives', yPosition);
        site.availableIncentives.forEach(incentive => {
          yPosition = addText(`• ${incentive}`, margin, yPosition);
        });
        yPosition += 5;
      }

      if (site.executiveSummary) {
        yPosition = addSectionHeader('Executive Summary', yPosition);

        // Parse and render markdown content with italic styling
        doc.setFont('helvetica', 'italic');
        const summaryElements = parseMarkdownForPDF(site.executiveSummary);
        yPosition = renderMarkdownToPDF(doc, summaryElements, yPosition, margin, contentWidth, lineHeight);
        doc.setFont('helvetica', 'normal');
        yPosition += 5;
      }

            if (site.businessAnalysis) {
        yPosition = addSectionHeader('Detailed Business Analysis', yPosition);

        // Parse and render markdown content
        const markdownElements = parseMarkdownForPDF(site.businessAnalysis);
        yPosition = renderMarkdownToPDF(doc, markdownElements, yPosition, margin, contentWidth, lineHeight);
        yPosition += 5;
      }

      if (site.citedSources.length > 0) {
        yPosition = addSectionHeader('Research Sources & Citations', yPosition);
                site.citedSources.forEach((source, index) => {
          // Source number and URL
          doc.setFont('helvetica', 'bold');
          yPosition = addText(`${index + 1}. Source: `, margin, yPosition);
          doc.setFont('helvetica', 'normal');
          yPosition = addText(source.url, margin + 20, yPosition - lineHeight);

          // Extracted quote
          doc.setFont('helvetica', 'italic');
          yPosition = addText(`   Quote: "${source.extracted_quote}"`, margin + 5, yPosition);
          doc.setFont('helvetica', 'normal');
          yPosition += 3;
        });
        yPosition += 5;
      }
    } else if (site.isLegacyAnalysisFormat) {
      // Legacy format analysis
      const legacyAnalysis = site.analysis as any;

      yPosition = addSectionHeader('Energy Pricing', yPosition);
      yPosition = addText(`Electricity Price: $${legacyAnalysis.energy_pricing.electricity_price_per_kwh}/kWh`, margin, yPosition);
      yPosition = addText(`CO2 Credit Price: $${legacyAnalysis.energy_pricing.co2_price_per_ton}/ton`, margin, yPosition);
      yPosition += 5;

      yPosition = addSectionHeader('Market Demand', yPosition);
      yPosition = addText(`Methane Capacity: ${legacyAnalysis.market_demand.methane_capacity_tons.toLocaleString()} tons/year`, margin, yPosition);
      yPosition = addText(`Customers within 50km: ${legacyAnalysis.market_demand.customer_count_within_50km}`, margin, yPosition);
      yPosition = addText(`Pipeline Access: ${legacyAnalysis.market_demand.has_pipeline_access ? 'Yes' : 'No'}`, margin, yPosition);
      yPosition = addText(`Scalability Rating: ${legacyAnalysis.market_demand.scalability_rating}/5`, margin, yPosition);
      yPosition += 5;

      yPosition = addSectionHeader('Financial Incentives', yPosition);
      yPosition = addText(`Available Grants: $${legacyAnalysis.financial_incentives.available_grants_usd.toLocaleString()}`, margin, yPosition);
      yPosition = addText(`Tax Credits Available: ${legacyAnalysis.financial_incentives.tax_credits_available ? 'Yes' : 'No'}`, margin, yPosition);
      yPosition += 3;
      yPosition = addText(`Incentive Summary:`, margin, yPosition);
      yPosition = addText(legacyAnalysis.financial_incentives.incentive_summary, margin + 10, yPosition);
      yPosition += 10;
    }

    // Area coordinates (if area type)
    if (site.isArea && site.areaCoordinates) {
      yPosition = addSectionHeader('Boundary Coordinates', yPosition);
      yPosition = addText(`Total boundary points: ${site.areaCoordinates.length - 1}`, margin, yPosition);
      yPosition += 3;

      site.areaCoordinates.slice(0, -1).forEach((coord, index) => {
        yPosition = addText(`Point ${index + 1}: [${coord[0].toFixed(6)}, ${coord[1].toFixed(6)}]`, margin, yPosition);
      });
      yPosition += 5;
    }
  } else {
    yPosition = addSectionHeader('Site Analysis', yPosition);
    yPosition = addText('Analysis data not available - pending or not yet performed.', margin, yPosition);
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${new Date().toLocaleString()}`, margin, doc.internal.pageSize.height - 10);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, doc.internal.pageSize.height - 10);
  }

  // Save the PDF
  const filename = `site-report-${site.id}-${site.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
  doc.save(filename);
};
