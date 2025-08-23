import jsPDF from 'jspdf';
import { Site } from '../models';

export const generateSitePDF = (site: Site): void => {
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 7;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper function to add text with automatic wrapping
  const addText = (text: string, x: number, y: number, options?: any) => {
    const lines = doc.splitTextToSize(text, contentWidth - x + margin);
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
  yPosition += 10;

  // Analysis Section (if available)
  if (site.hasAnalysis && site.analysis) {
    yPosition = addSectionHeader('Site Analysis', yPosition);

    if (site.profitabilityScore) {
      yPosition = addText(`Profitability Score: ${site.profitabilityScore.toFixed(0)}/100`, margin, yPosition);
    }

    yPosition = addText(`Last Updated: ${new Date(site.analysis.last_updated).toLocaleString()}`, margin, yPosition);
    yPosition += 5;

    // Energy Pricing
    yPosition = addSectionHeader('Energy Pricing', yPosition);
    yPosition = addText(`Electricity Price: $${site.analysis.energy_pricing.electricity_price_per_kwh}/kWh`, margin, yPosition);
    yPosition = addText(`CO2 Credit Price: $${site.analysis.energy_pricing.co2_price_per_ton}/ton`, margin, yPosition);
    yPosition += 5;

    // Market Demand
    yPosition = addSectionHeader('Market Demand', yPosition);
    yPosition = addText(`Methane Capacity: ${site.analysis.market_demand.methane_capacity_tons.toLocaleString()} tons/year`, margin, yPosition);
    yPosition = addText(`Customers within 50km: ${site.analysis.market_demand.customer_count_within_50km}`, margin, yPosition);
    yPosition = addText(`Pipeline Access: ${site.analysis.market_demand.has_pipeline_access ? 'Yes' : 'No'}`, margin, yPosition);
    yPosition = addText(`Scalability Rating: ${site.analysis.market_demand.scalability_rating}/5`, margin, yPosition);
    yPosition += 5;

    // Financial Incentives
    yPosition = addSectionHeader('Financial Incentives', yPosition);
    yPosition = addText(`Available Grants: $${site.analysis.financial_incentives.available_grants_usd.toLocaleString()}`, margin, yPosition);
    yPosition = addText(`Tax Credits Available: ${site.analysis.financial_incentives.tax_credits_available ? 'Yes' : 'No'}`, margin, yPosition);
    yPosition += 3;
    yPosition = addText(`Incentive Summary:`, margin, yPosition);
    yPosition = addText(site.analysis.financial_incentives.incentive_summary, margin + 10, yPosition);
    yPosition += 10;

    // Area coordinates (if area type)
    if (site.isArea && site.areaCoordinates) {
      yPosition = addSectionHeader('Boundary Coordinates', yPosition);
      site.areaCoordinates.slice(0, -1).forEach((coord, index) => {
        if (yPosition > 250) { // Check if we need a new page
          doc.addPage();
          yPosition = 20;
        }
        yPosition = addText(`Point ${index + 1}: [${coord[0].toFixed(4)}, ${coord[1].toFixed(4)}]`, margin, yPosition);
      });
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
