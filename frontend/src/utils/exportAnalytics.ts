import { jsPDF } from 'jspdf';

function fmt(val: number): string {
  return Number(val).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtInt(val: number): string {
  return Number(val).toLocaleString();
}

function sanitizeCSV(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export interface AnalyticsExportData {
  periodLabel: string;
  startDate: string;
  endDate: string;
  stats: { title: string; value: number; isNumber?: boolean }[];
  feedbackCount: number;
  avgServiceRating: number;
  avgBillingRating: number;
  recentFeedbackComments: any[];
  revenueBars: { label: string; value: number }[];
  topTreatments: { name: string; sales: number; revenue: number }[];
  highPerformingStaff: any[];
  fastMovingProducts: any[];
  deductions: { commissions: number; tax: number; productDeductions: number; discountDeductions: number; otherDeductions: number };
  peakSessionDays: [string, number][];
  netMade: number;
  settingsProfitValue: number;
  profitRemainingRate: number;
}

export function exportAnalyticsCSV(data: AnalyticsExportData): void {
  const rows: string[] = [];

  rows.push(`Kareh Spa - Analytics Report`);
  rows.push(`Period: ${data.periodLabel} (${data.startDate} to ${data.endDate})`);
  rows.push('');

  rows.push('Metrics,KES Value');
  for (const s of data.stats) {
    rows.push(`${sanitizeCSV(s.title)},${s.isNumber ? fmtInt(s.value) : fmt(s.value)}`);
  }

  rows.push('');
  rows.push('Client Feedback');
  rows.push('Total Responses,Avg Service Rating,Avg Billing Rating');
  rows.push(`${data.feedbackCount},${data.avgServiceRating.toFixed(2)},${data.avgBillingRating.toFixed(2)}`);

  if (data.recentFeedbackComments.length > 0) {
    rows.push('');
    rows.push('Recent Comments');
    rows.push('Session,Client,Service Rating,Billing Rating,Comment');
    for (const c of data.recentFeedbackComments) {
      rows.push(`${c.session_code || c.session_id},${sanitizeCSV(c.customer_name || 'Client')},${Number(c.service_rating || 0).toFixed(1)},${Number(c.billing_rating || 0).toFixed(1)},${sanitizeCSV(c.feedback_text || '')}`);
    }
  }

  rows.push('');
  rows.push('Revenue Growth (Last 7 Days)');
  rows.push('Day,Revenue (KES)');
  for (const b of data.revenueBars) {
    rows.push(`${b.label},${fmt(b.value)}`);
  }

  rows.push('');
  rows.push('Top Treatments');
  rows.push('Service,Sales,Revenue (KES)');
  for (const t of data.topTreatments) {
    rows.push(`${sanitizeCSV(t.name)},${t.sales},${fmt(t.revenue)}`);
  }

  rows.push('');
  rows.push('High Performing Staff');
  rows.push('Staff,Bookings,Total Earnings (KES),Pending Earnings (KES)');
  for (const s of data.highPerformingStaff) {
    rows.push(`${sanitizeCSV(s.staff_name || '')},${s.bookings || 0},${fmt(s.total_earnings)},${fmt(s.pending_earnings)}`);
  }

  rows.push('');
  rows.push('Fast Moving Products');
  rows.push('Product,Total Consumed,Avg Daily Usage,Class');
  for (const p of data.fastMovingProducts) {
    rows.push(`${sanitizeCSV(p.name || '')},${fmt(p.total_consumed)},${Number(p.avg_daily_usage).toFixed(2)},${p.movement_class || ''}`);
  }

  rows.push('');
  rows.push('Deductions Breakdown');
  rows.push(`Commissions (Paid + Pending),${data.deductions.commissions}`);
  rows.push(`Tax,${data.deductions.tax}`);
  rows.push(`Product Deductions,${data.deductions.productDeductions}`);
  rows.push(`Discount Deductions,${data.deductions.discountDeductions}`);
  rows.push(`Other Deductions,${data.deductions.otherDeductions}`);

  rows.push('');
  rows.push(`Net Made,${data.netMade}`);
  rows.push(`Settings Profit (${data.profitRemainingRate}% of Gross),${data.settingsProfitValue}`);

  if (data.peakSessionDays.length > 0) {
    rows.push('');
    rows.push('Peak Demand Days');
    rows.push('Day,Sessions');
    for (const [day, count] of data.peakSessionDays) {
      rows.push(`${day},${count}`);
    }
  }

  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `KarehSpa_Analytics_${data.startDate}_to_${data.endDate}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportAnalyticsPDF(data: AnalyticsExportData): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const m = 15;
  let y = m;

  const addSection = (title: string) => {
    if (y > 260) {
      doc.addPage();
      y = m;
    }
    y += 6;
    doc.setFontSize(14);
    doc.setTextColor(120, 50, 168);
    doc.text(title, m, y);
    y += 2;
    doc.setDrawColor(120, 50, 168);
    doc.setLineWidth(0.6);
    doc.line(m, y, pw - m, y);
    y += 6;
  };

  const addValueRow = (label: string, value: string) => {
    if (y > 270) {
      doc.addPage();
      y = m + 6;
    }
    doc.setFontSize(9);
    doc.setTextColor(108, 117, 125);
    doc.text(label, m + 2, y);
    doc.setTextColor(33, 37, 41);
    doc.text(value, pw - m - 2, y, { align: 'right' });
    y += 5;
  };

  const addTableHeader = (headers: string[], colWidths: number[]) => {
    if (y > 260) {
      doc.addPage();
      y = m + 6;
    }
    doc.setFontSize(8);
    doc.setTextColor(108, 117, 125);
    let x = m;
    for (let i = 0; i < headers.length; i++) {
      doc.text(headers[i], x + 1, y);
      x += colWidths[i];
    }
    y += 2;
    doc.setDrawColor(222, 226, 230);
    doc.setLineWidth(0.3);
    doc.line(m, y, pw - m, y);
    y += 4;
  };

  const addTableRow = (cells: string[], colWidths: number[]) => {
    if (y > 270) {
      doc.addPage();
      y = m + 6;
      addTableHeader(cells.map(() => ''), colWidths);
    }
    doc.setFontSize(8);
    doc.setTextColor(33, 37, 41);
    let x = m;
    for (let i = 0; i < cells.length; i++) {
      doc.text(cells[i], x + 1, y);
      x += colWidths[i];
    }
    y += 4;
  };

  // Header
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('img fail'));
      i.src = '/karehspalogo.jpeg';
    });
    doc.addImage(img, 'JPEG', m, y, 18, 18);
    doc.setFontSize(18);
    doc.setTextColor(120, 50, 168);
    doc.text('KAREH SPA', m + 22, y + 8);
    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125);
    doc.text('Analytics Report', m + 22, y + 15);
  } catch {
    doc.setFontSize(18);
    doc.setTextColor(120, 50, 168);
    doc.text('KAREH SPA', m, y + 8);
    doc.setFontSize(10);
    doc.setTextColor(108, 117, 125);
    doc.text('Analytics Report', m, y + 15);
  }

  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125);
  doc.text(`Period: ${data.periodLabel}`, pw - m, y + 8, { align: 'right' });
  doc.text(`${data.startDate} to ${data.endDate}`, pw - m, y + 15, { align: 'right' });
  y += 22;

  // Key Metrics
  addSection('Key Metrics');
  for (const s of data.stats) {
    addValueRow(s.title, s.isNumber ? fmtInt(s.value) : `KES ${fmt(s.value)}`);
  }

  // Client Feedback
  addSection('Client Feedback');
  addValueRow('Total Responses', String(data.feedbackCount));
  addValueRow('Average Service Rating', `${data.avgServiceRating.toFixed(2)} / 5`);
  addValueRow('Average Billing Rating', `${data.avgBillingRating.toFixed(2)} / 5`);

  if (data.recentFeedbackComments.length > 0) {
    addSection('Recent Feedback Comments');
    const cw = [30, 25, 25, 25, 55];
    addTableHeader(['Session', 'Client', 'Service Rating', 'Billing Rating', 'Comment'], cw);
    for (const c of data.recentFeedbackComments) {
      addTableRow([
        c.session_code || String(c.session_id || ''),
        c.customer_name || 'Client',
        Number(c.service_rating || 0).toFixed(1),
        Number(c.billing_rating || 0).toFixed(1),
        (c.feedback_text || '').substring(0, 40),
      ], cw);
    }
  }

  // Revenue
  addSection('Revenue Growth (Last 7 Days)');
  const rw = [40, 80];
  addTableHeader(['Day', 'Revenue (KES)'], rw);
  for (const b of data.revenueBars) {
    addTableRow([b.label, fmt(b.value)], rw);
  }

  // Top Treatments
  addSection('Top Treatments');
  const tw = [70, 30, 50];
  addTableHeader(['Service', 'Sales', 'Revenue (KES)'], tw);
  for (const t of data.topTreatments) {
    addTableRow([t.name, String(t.sales), fmt(t.revenue)], tw);
  }

  // High Performing Staff
  addSection('High Performing Staff');
  const sw = [50, 25, 40, 40];
  addTableHeader(['Staff', 'Bookings', 'Total Earnings', 'Pending'], sw);
  for (const s of data.highPerformingStaff) {
    addTableRow([
      s.staff_name || '',
      String(s.bookings || 0),
      `KES ${fmt(s.total_earnings)}`,
      `KES ${fmt(s.pending_earnings)}`,
    ], sw);
  }

  // Fast Moving Products
  addSection('Fast Moving Products');
  const pw2 = [50, 30, 30, 30];
  addTableHeader(['Product', 'Consumed', 'Avg/Day', 'Class'], pw2);
  for (const p of data.fastMovingProducts) {
    addTableRow([
      p.name || '',
      fmt(p.total_consumed),
      fmt(p.avg_daily_usage),
      p.movement_class || '',
    ], pw2);
  }

  // Deductions
  addSection('Deductions Breakdown');
  addValueRow('Commissions (Paid + Pending)', `KES ${fmt(data.deductions.commissions)}`);
  addValueRow('Tax', `KES ${fmt(data.deductions.tax)}`);
  addValueRow('Product Deductions', `KES ${fmt(data.deductions.productDeductions)}`);
  addValueRow('Discount Deductions', `KES ${fmt(data.deductions.discountDeductions)}`);
  addValueRow('Other Deductions', `KES ${fmt(data.deductions.otherDeductions)}`);

  // Summary
  addSection('Summary');
  addValueRow('Net Made (Revenue - Cost)', `KES ${fmt(data.netMade)}`);
  addValueRow(`Settings Profit (${data.profitRemainingRate}% of Gross)`, `KES ${fmt(data.settingsProfitValue)}`);

  if (data.peakSessionDays.length > 0) {
    addSection('Peak Demand Days');
    addTableHeader(['Day', 'Sessions'], [60, 40]);
    for (const [day, count] of data.peakSessionDays) {
      addTableRow([day, String(count)], [60, 40]);
    }
  }

  // Footer
  y = Math.max(y, 275);
  doc.setFontSize(8);
  doc.setTextColor(173, 181, 189);
  doc.text('Kareh Spa - Business Intelligence Report', m, 285);
  doc.text(`Generated on ${new Date().toLocaleString()}`, pw - m, 285, { align: 'right' });

  doc.save(`KarehSpa_Analytics_${data.startDate}_to_${data.endDate}.pdf`);
}
