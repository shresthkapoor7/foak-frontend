import { marked } from 'marked';
import jsPDF from 'jspdf';

export interface MarkdownElement {
  type: 'heading' | 'paragraph' | 'list' | 'bold' | 'italic' | 'link' | 'text';
  content: string;
  level?: number; // for headings
  href?: string; // for links
  items?: string[]; // for lists
}

// Parse markdown text into structured elements for PDF rendering
export const parseMarkdownForPDF = (markdownText: string): MarkdownElement[] => {
  const elements: MarkdownElement[] = [];

  // Split into lines and process
  const lines = markdownText.split('\n');
  let currentParagraph = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      // Empty line - end current paragraph if any
      if (currentParagraph) {
        elements.push({
          type: 'paragraph',
          content: currentParagraph.trim()
        });
        currentParagraph = '';
      }
      continue;
    }

    // Headers
    if (line.startsWith('#')) {
      // End current paragraph first
      if (currentParagraph) {
        elements.push({
          type: 'paragraph',
          content: currentParagraph.trim()
        });
        currentParagraph = '';
      }

      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        elements.push({
          type: 'heading',
          content: headerMatch[2],
          level: headerMatch[1].length
        });
        continue;
      }
    }

    // Lists
    if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
      // End current paragraph first
      if (currentParagraph) {
        elements.push({
          type: 'paragraph',
          content: currentParagraph.trim()
        });
        currentParagraph = '';
      }

      // Collect all list items
      const listItems = [];
      let j = i;
      while (j < lines.length) {
        const listLine = lines[j].trim();
        if (listLine.startsWith('- ') || listLine.startsWith('* ')) {
          listItems.push(listLine.substring(2));
          j++;
        } else if (/^\d+\.\s/.test(listLine)) {
          listItems.push(listLine.replace(/^\d+\.\s/, ''));
          j++;
        } else if (!listLine) {
          j++;
          break;
        } else {
          break;
        }
      }

      if (listItems.length > 0) {
        elements.push({
          type: 'list',
          content: '',
          items: listItems
        });
        i = j - 1; // Adjust loop counter
      }
      continue;
    }

    // Regular paragraph text
    currentParagraph += (currentParagraph ? ' ' : '') + line;
  }

  // Add final paragraph if any
  if (currentParagraph) {
    elements.push({
      type: 'paragraph',
      content: currentParagraph.trim()
    });
  }

  return elements;
};

// Render markdown elements to PDF
export const renderMarkdownToPDF = (
  doc: jsPDF,
  elements: MarkdownElement[],
  startY: number,
  margin: number,
  contentWidth: number,
  lineHeight: number
): number => {
  let yPosition = startY;

  const addText = (text: string, x: number, y: number, font?: string, size?: number): number => {
    if (font) doc.setFont('helvetica', font as any);
    if (size) doc.setFontSize(size);

    // Check if we need a new page
    if (y + (text.split('\n').length * lineHeight) > 270) {
      doc.addPage();
      y = 20;
    }

    const lines = doc.splitTextToSize(text, contentWidth - x + margin);
    doc.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };

  elements.forEach(element => {
    switch (element.type) {
      case 'heading':
        const headerSize = Math.max(16 - (element.level! * 2), 10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(headerSize);
        yPosition = addText(element.content, margin, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        yPosition += 3;
        break;

      case 'paragraph':
        // Handle inline formatting (bold, italic, links)
        let content = element.content;

        // Simple bold formatting
        if (content.includes('**')) {
          const parts = content.split('**');
          let formattedY = yPosition;
          let currentX = margin;

          parts.forEach((part, index) => {
            if (index % 2 === 0) {
              // Normal text
              doc.setFont('helvetica', 'normal');
            } else {
              // Bold text
              doc.setFont('helvetica', 'bold');
            }

            if (part) {
              const lines = doc.splitTextToSize(part, contentWidth - currentX + margin);
              doc.text(lines, currentX, formattedY);
              formattedY += lines.length * lineHeight;
            }
          });

          yPosition = formattedY;
          doc.setFont('helvetica', 'normal');
        } else {
          yPosition = addText(content, margin, yPosition);
        }
        yPosition += 2;
        break;

      case 'list':
        if (element.items) {
          element.items.forEach(item => {
            yPosition = addText(`• ${item}`, margin, yPosition);
          });
          yPosition += 3;
        }
        break;
    }
  });

  return yPosition;
};

// Simple markdown to HTML converter for React components
export const parseMarkdownToHTML = (markdownText: string): string => {
  if (!markdownText) return '';

  try {
    const result = marked(markdownText, {
      breaks: true,
      gfm: true
    });

    // Handle both sync and async results
    if (typeof result === 'string') {
      return result;
    } else {
      console.warn('Async markdown parsing not supported, falling back to plain text');
      return markdownText;
    }
  } catch (error) {
    console.warn('Markdown parsing error:', error);
    return markdownText; // Fallback to plain text
  }
};
