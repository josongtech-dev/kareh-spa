import { useRef } from 'react';
import { FiPrinter, FiDownload, FiShare2 } from 'react-icons/fi';

interface ReceiptLine {
  id: number;
  service_name?: string;
  addon_name?: string;
  price?: number | string;
  quantity?: number;
  line_total?: number;
}

interface ReceiptData {
  session_id: number;
  session_code: string;
  customer_name: string;
  client_phone?: string;
  client_email?: string;
  service_lines: ReceiptLine[];
  addon_lines: ReceiptLine[];
  total_amount: number;
  payment_transaction_code: string;
  paid_at: string;
  payment_method: string;
}

interface ReceiptProps {
  data: ReceiptData;
}

const formatCurrency = (val: number | string): string => {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  return isNaN(n) ? '0' : n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

const Receipt: React.FC<ReceiptProps> = ({ data }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => window.print();

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleShare = async () => {
    const lines = data.service_lines.map((l: ReceiptLine) =>
      `  ${l.service_name || ''} .......... ${formatCurrency(l.price ?? 0)}`
    ).join('\n');
    const addonLines = data.addon_lines.map((a: ReceiptLine) =>
      `  ${a.addon_name || ''} x${a.quantity ?? 1} .......... ${formatCurrency(a.line_total ?? 0)}`
    ).join('\n');
    const codeLine = data.payment_method !== 'CASH' && data.payment_transaction_code ? `\nM-Pesa Code: ${data.payment_transaction_code}` : '';
    const text = `KAREH'S SPA\nPayment Receipt\n\nSession: ${data.session_code}\nCustomer: ${data.customer_name}\nDate: ${formatDate(data.paid_at)}\n\n--- Services ---\n${lines}${addonLines ? '\n' + addonLines : ''}\n\nTotal: KES ${formatCurrency(data.total_amount)}${codeLine}\n\nThank you for choosing Kareh's Spa!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `Kareh's Spa Receipt - ${data.session_code}`, text });
      } catch {}
    } else {
      await navigator.clipboard?.writeText(text);
    }
  };

  const itemLines = data.service_lines.map((l: ReceiptLine) => ({
    name: l.service_name || '',
    amount: parseFloat(String(l.price ?? 0)),
  }));

  const addonItemLines = data.addon_lines.map((a: ReceiptLine) => ({
    name: (a.addon_name || '') + (a.quantity && a.quantity > 1 ? ` x${a.quantity}` : ''),
    amount: parseFloat(String(a.line_total ?? 0)),
  }));

  const allLines = [...itemLines, ...addonItemLines].filter(li => li.amount > 0 || li.name);

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; padding: 0; background: #fff !important; }
          .no-print { display: none !important; }
          .receipt-page { box-shadow: none !important; border-radius: 0 !important; margin: 0 auto !important; padding: 0 !important; }
          @page { size: 80mm auto; margin: 0; }
        }
      `}</style>

      <div className="d-flex flex-column align-items-center py-4 no-print">
        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-outline-dark rounded-pill px-3 py-2 d-flex align-items-center gap-2" onClick={handlePrint}>
            <FiPrinter size={16} /> Print
          </button>
          <button className="btn btn-outline-dark rounded-pill px-3 py-2 d-flex align-items-center gap-2" onClick={handleDownloadPdf}>
            <FiDownload size={16} /> PDF
          </button>
          <button className="btn btn-outline-dark rounded-pill px-3 py-2 d-flex align-items-center gap-2" onClick={handleShare}>
            <FiShare2 size={16} /> Share
          </button>
        </div>
      </div>

      <div ref={printRef} className="receipt-page mx-auto" style={{
        maxWidth: 320,
        width: '100%',
        background: '#fff',
        color: '#000',
        fontFamily: "'Courier New', 'Lucida Console', monospace",
        fontSize: 12,
        lineHeight: 1.5,
        padding: 16,
        boxSizing: 'border-box',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <img
            src="/karehspalogo.jpeg"
            alt="Kareh's Spa"
            style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginBottom: 6 }}
          />
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>KAREH'S SPA</div>
          <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>Payment Receipt</div>
        </div>

        <div style={{ borderTop: '1px dashed #999', borderBottom: '1px dashed #999', padding: '8px 0', marginBottom: 8, fontSize: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#555' }}>Session</span>
            <span style={{ fontWeight: 600 }}>{data.session_code}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#555' }}>Date</span>
            <span>{formatDate(data.paid_at)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#555' }}>Customer</span>
            <span>{data.customer_name}</span>
          </div>
        </div>

        <div style={{ fontWeight: 600, fontSize: 11, marginBottom: 4 }}>SERVICES</div>
        <div style={{ borderTop: '1px solid #ccc', marginBottom: 4 }} />

        {allLines.length === 0 && (
          <div style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>No service items</div>
        )}

        {allLines.map((li, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{li.name}</span>
            <span style={{ marginLeft: 8, whiteSpace: 'nowrap' }}>KES {formatCurrency(li.amount)}</span>
          </div>
        ))}

        <div style={{ borderTop: '2px solid #000', marginTop: 6, paddingTop: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 13 }}>
            <span>TOTAL</span>
            <span>KES {formatCurrency(data.total_amount)}</span>
          </div>
        </div>

        <div style={{ borderTop: '1px dashed #999', marginTop: 8, paddingTop: 8, fontSize: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#555' }}>Payment</span>
            <span>{data.payment_method || 'M-Pesa'}</span>
          </div>
          {data.payment_method !== 'CASH' && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#555' }}>M-Pesa Code</span>
              {data.payment_transaction_code ? (
                <span style={{ fontWeight: 600 }}>{data.payment_transaction_code}</span>
              ) : (
                <span style={{ color: '#999', fontStyle: 'italic', fontSize: 10 }}>Confirming...</span>
              )}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#555', borderTop: '1px dashed #999', paddingTop: 12 }}>
          <div style={{ fontWeight: 600, color: '#000', marginBottom: 4 }}>Thank you for choosing Kareh's Spa!</div>
          <div>We look forward to serving you again.</div>
          <div style={{ marginTop: 8, fontSize: 9, color: '#999' }}>karehspa.co.ke</div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 9, color: '#ccc', letterSpacing: 2 }}>
          - - - - - - - - - - - - - - - - -
        </div>
      </div>
    </>
  );
};

export default Receipt;
