import jsPDF from 'jspdf';
import type { QuoteLineItem } from './types';

interface QuotePDFData {
  id: string;
  created_at: string;
  contact_name: string;
  company_name: string;
  email: string;
  phone: string;
  message: string;
  market: string;
  line_items: QuoteLineItem[];
  total: number;
  estimated_timeline: number;
  seeds: number;
  paper_grams: number;
  co2_saved: number;
  status: string;
}

export function generateQuotePDF(quote: QuotePDFData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // --- Colors ---
  const brandGreen: [number, number, number] = [16, 185, 129]; // emerald-500
  const dark: [number, number, number] = [9, 9, 11];
  const gray: [number, number, number] = [113, 113, 122];
  const white: [number, number, number] = [255, 255, 255];

  // --- Background ---
  doc.setFillColor(...dark);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

  // --- Header ---
  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MORIVERT', margin, y + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray);
  doc.text('Write. Plant. Grow.', margin, y + 14);

  // Quote ref on the right
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text(`Quote #${quote.id.slice(0, 8).toUpperCase()}`, pageWidth - margin, y + 8, { align: 'right' });
  const dateStr = new Date(quote.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.text(dateStr, pageWidth - margin, y + 14, { align: 'right' });

  y += 24;

  // --- Divider ---
  doc.setDrawColor(40, 40, 45);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // --- Customer Info ---
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandGreen);
  doc.text('CUSTOMER DETAILS', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...white);
  doc.setFontSize(9);

  const infoLines = [
    ['Name', quote.contact_name],
    ['Company', quote.company_name || '—'],
    ['Email', quote.email],
    ['Phone', quote.phone || '—'],
    ['Market', quote.market],
  ];

  infoLines.forEach(([label, value]) => {
    doc.setTextColor(...gray);
    doc.setFontSize(8);
    doc.text(label, margin, y);
    doc.setTextColor(...white);
    doc.text(value, margin + 30, y);
    y += 5;
  });

  if (quote.message) {
    y += 2;
    doc.setTextColor(...gray);
    doc.setFontSize(8);
    doc.text('Message', margin, y);
    y += 5;
    doc.setTextColor(...white);
    const msgLines = doc.splitTextToSize(quote.message, contentWidth);
    doc.text(msgLines, margin, y);
    y += msgLines.length * 4 + 2;
  }

  y += 4;

  // --- Line Items Table ---
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandGreen);
  doc.text('ORDER DETAILS', margin, y);
  y += 6;

  // Table header
  doc.setFillColor(20, 20, 25);
  doc.rect(margin, y - 1, contentWidth, 7, 'F');
  doc.setFontSize(7);
  doc.setTextColor(...gray);
  doc.setFont('helvetica', 'bold');
  doc.text('Product', margin + 2, y + 3.5);
  doc.text('Qty', margin + 90, y + 3.5, { align: 'right' });
  doc.text('Unit Price', margin + 115, y + 3.5, { align: 'right' });
  doc.text('Discount', margin + 140, y + 3.5, { align: 'right' });
  doc.text('Total', margin + contentWidth - 2, y + 3.5, { align: 'right' });
  y += 9;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const items: QuoteLineItem[] = Array.isArray(quote.line_items)
    ? quote.line_items
    : JSON.parse(quote.line_items as any);

  items.forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(15, 15, 18);
      doc.rect(margin, y - 3, contentWidth, 7, 'F');
    }
    doc.setTextColor(...white);
    doc.text(item.label || item.product, margin + 2, y + 1);
    doc.setTextColor(...gray);
    doc.text(String(item.qty), margin + 90, y + 1, { align: 'right' });
    doc.text(`Rs ${Math.round(item.unit_price).toLocaleString()}`, margin + 115, y + 1, { align: 'right' });
    doc.text(item.discount > 0 ? `${Math.round(item.discount * 100)}%` : '—', margin + 140, y + 1, {
      align: 'right',
    });
    doc.setTextColor(...white);
    doc.text(`Rs ${Math.round(item.line_total).toLocaleString()}`, margin + contentWidth - 2, y + 1, {
      align: 'right',
    });
    y += 7;
  });

  y += 4;

  // --- Total ---
  doc.setDrawColor(40, 40, 45);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...white);
  doc.text('Total', margin, y);
  doc.text(`Rs ${quote.total.toLocaleString()}`, pageWidth - margin, y, { align: 'right' });
  y += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray);
  doc.text(`Estimated delivery: ~${quote.estimated_timeline} days`, margin, y);
  y += 10;

  // --- Impact Metrics ---
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandGreen);
  doc.text('YOUR ENVIRONMENTAL IMPACT', margin, y);
  y += 7;

  doc.setFillColor(16, 25, 20);
  doc.roundedRect(margin, y - 2, contentWidth, 22, 3, 3, 'F');

  const impactItems = [
    { label: 'Seeds planted', value: String(quote.seeds) },
    { label: 'CO\u2082 saved', value: `${quote.co2_saved} kg` },
    { label: 'Recycled paper', value: `${(quote.paper_grams / 1000).toFixed(1)} kg` },
  ];

  const colWidth = contentWidth / 3;
  impactItems.forEach((item, i) => {
    const x = margin + colWidth * i + colWidth / 2;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...brandGreen);
    doc.text(item.value, x, y + 8, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gray);
    doc.text(item.label, x, y + 14, { align: 'center' });
  });

  y += 30;

  // --- Status ---
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text(`Status: ${quote.status.replace('_', ' ').toUpperCase()}`, margin, y);

  // --- Footer ---
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(40, 40, 45);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  doc.setFontSize(7);
  doc.setTextColor(...gray);
  doc.text('Generated by Morivert — Plantable stationery from Mauritius', margin, footerY);
  doc.text('morivert.com', pageWidth - margin, footerY, { align: 'right' });

  // --- Download ---
  const filename = `morivert-quote-${quote.id.slice(0, 8)}.pdf`;
  doc.save(filename);
}
