import { jsPDF } from 'jspdf';
import type { InvoiceData } from '../api/invoice';

const formatCurrency = (val: number): string => {
  return isNaN(val) ? '0.00' : val.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (d: string): string => {
  if (!d) return '';
  try {
    return new Date(d).toLocaleString('en-KE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return d;
  }
};

export async function generateInvoicePdf(data: InvoiceData): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  const logoSize = 20;
  const logoUrl = '/karehspalogo.jpeg';

  const loadImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });

  try {
    const img = await loadImage(logoUrl);
    doc.addImage(img, 'JPEG', margin, y, logoSize, logoSize);
  } catch {
    const logoText = 'K';
    doc.setFontSize(16);
    doc.setTextColor(120, 50, 168);
    doc.text(logoText, margin + 4, y + 14);
  }

  doc.setFontSize(18);
  doc.setTextColor(33, 37, 41);
  doc.text(data.business.name, margin + logoSize + 8, y + 8);
  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125);
  doc.text(data.business.tagline, margin + logoSize + 8, y + 15);

  doc.setFontSize(16);
  doc.setTextColor(33, 37, 41);
  doc.text('INVOICE', pageWidth - margin, y + 10, { align: 'right' });

  y += 28;

  doc.setDrawColor(120, 50, 168);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(108, 117, 125);
  doc.text('From', margin, y);
  doc.setFontSize(10);
  doc.setTextColor(33, 37, 41);
  doc.text(data.business.name, margin, y + 4);
  doc.setFontSize(9);
  doc.setTextColor(108, 117, 125);
  doc.text(data.business.address, margin, y + 8);
  doc.text(data.business.phone, margin, y + 12);
  doc.text(data.business.email, margin, y + 16);

  doc.setFontSize(9);
  doc.setTextColor(108, 117, 125);
  doc.text('Bill To', pageWidth / 2, y);
  doc.setFontSize(10);
  doc.setTextColor(33, 37, 41);
  doc.text(data.customer_name, pageWidth / 2, y + 4);
  doc.setFontSize(9);
  doc.setTextColor(108, 117, 125);
  if (data.client_phone) doc.text(data.client_phone, pageWidth / 2, y + 8);
  if (data.client_email) doc.text(data.client_email, pageWidth / 2, y + 12);

  doc.setFontSize(9);
  doc.setTextColor(108, 117, 125);
  const rightX = pageWidth - margin;
  doc.text('Invoice #', rightX - 30, y, { align: 'right' });
  doc.setFontSize(10);
  doc.setTextColor(33, 37, 41);
  doc.text(data.session_code, rightX, y + 4, { align: 'right' });
  doc.setFontSize(9);
  doc.setTextColor(108, 117, 125);
  doc.text('Date', rightX - 30, y + 8, { align: 'right' });
  doc.setFontSize(10);
  doc.setTextColor(33, 37, 41);
  doc.text(formatDate(data.paid_at || data.created_at), rightX, y + 12, { align: 'right' });
  doc.text('Status', rightX - 30, y + 16, { align: 'right' });
  const isPaid = data.billing_status === 'paid';
  doc.setTextColor(isPaid ? 40 : 220, isPaid ? 167 : 53, isPaid ? 69 : 55);
  doc.text(isPaid ? 'PAID' : data.billing_status.toUpperCase(), rightX, y + 20, { align: 'right' });

  y += 30;
  doc.setDrawColor(222, 226, 230);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  const colDescription = margin;
  const colQty = pageWidth - margin - 60;
  const colPrice = pageWidth - margin - 35;
  const colTotal = pageWidth - margin;

  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(108, 117, 125);
  doc.text('Description', colDescription, y);
  doc.text('Qty', colQty, y, { align: 'center' });
  doc.text('Price', colPrice, y, { align: 'right' });
  doc.text('Total', colTotal, y, { align: 'right' });
  y += 4;

  doc.setDrawColor(222, 226, 230);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  const allLines = [
    ...data.service_lines.map((l) => ({
      name: l.service_name || '',
      qty: l.quantity || 1,
      price: l.price,
      total: l.line_total || l.price,
    })),
    ...data.addon_lines.map((l) => ({
      name: (l.addon_name || '') + (l.quantity > 1 ? ` x${l.quantity}` : ''),
      qty: l.quantity || 1,
      price: l.price,
      total: l.line_total || l.price,
    })),
  ].filter((l) => l.total > 0 || l.name);

  doc.setFontSize(10);
  doc.setTextColor(33, 37, 41);

  for (const line of allLines) {
    if (y > 265) {
      doc.addPage();
      y = margin;
    }
    const name = line.name.length > 40 ? line.name.substring(0, 38) + '..' : line.name;
    doc.text(name, colDescription, y);
    doc.text(String(line.qty), colQty, y, { align: 'center' });
    doc.text(formatCurrency(line.price), colPrice, y, { align: 'right' });
    doc.text(formatCurrency(line.total), colTotal, y, { align: 'right' });
    y += 6;
  }

  y += 6;
  doc.setDrawColor(222, 226, 230);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  const totalsX = pageWidth - margin - 55;

  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125);
  doc.text('Subtotal', totalsX, y);
  doc.setTextColor(33, 37, 41);
  doc.text(formatCurrency(data.subtotal || data.total_amount), pageWidth - margin, y, { align: 'right' });
  y += 7;

  if (data.discount_amount > 0) {
    doc.setTextColor(108, 117, 125);
    doc.text('Discount', totalsX, y);
    doc.setTextColor(220, 53, 69);
    doc.text(`-${formatCurrency(data.discount_amount)}`, pageWidth - margin, y, { align: 'right' });
    y += 7;
  }

  y += 3;
  doc.setDrawColor(120, 50, 168);
  doc.setLineWidth(0.8);
  doc.line(totalsX, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(14);
  doc.setTextColor(33, 37, 41);
  doc.text('Total', totalsX, y);
  doc.setFont('Helvetica', 'bold');
  doc.text(`KES ${formatCurrency(data.total_amount)}`, pageWidth - margin, y, { align: 'right' });
  doc.setFont('Helvetica', 'normal');
  y += 14;

  if (isPaid) {
    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125);
    doc.text('Payment Method', totalsX, y);
    doc.setTextColor(33, 37, 41);
    doc.text(data.payment_method, pageWidth - margin, y, { align: 'right' });
    y += 6;

    if (data.payment_transaction_code && data.payment_method !== 'CASH') {
      doc.setTextColor(108, 117, 125);
      doc.text('Transaction Code', totalsX, y);
      doc.setTextColor(33, 37, 41);
      doc.text(data.payment_transaction_code, pageWidth - margin, y, { align: 'right' });
      y += 6;
    }

    doc.setTextColor(108, 117, 125);
    doc.text('Paid At', totalsX, y);
    doc.setTextColor(33, 37, 41);
    doc.text(formatDate(data.paid_at), pageWidth - margin, y, { align: 'right' });
    y += 12;
  }

  doc.setDrawColor(222, 226, 230);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(108, 117, 125);
  doc.setFont('Helvetica', 'italic');
  doc.text(`Thank you for choosing ${data.business.name}!`, margin, y);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(173, 181, 189);
  doc.text(data.business.website, pageWidth - margin, y, { align: 'right' });

  doc.save(`Invoice-${data.session_code}.pdf`);
}
