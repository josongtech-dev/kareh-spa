import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import { sessionsApi } from '../api/sessions';
import Receipt from '../components/Receipt';

interface ReceiptData {
  session_id: number;
  session_code: string;
  customer_name: string;
  client_phone?: string;
  client_email?: string;
  service_lines: any[];
  addon_lines: any[];
  total_amount: number;
  payment_transaction_code: string;
  paid_at: string;
  payment_method: string;
}

const isInIframe = (): boolean => window !== window.top;

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'completed' | 'failed'>('checking');
  const [message, setMessage] = useState('Verifying payment...');
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    const orderTrackingId = searchParams.get('order_tracking_id') || searchParams.get('OrderTrackingId') || '';
    const merchantReference = searchParams.get('merchant_reference') || searchParams.get('OrderMerchantReference') || '';

    if (!orderTrackingId) {
      setStatus('failed');
      setMessage('No payment reference found.');
      return;
    }

    let attempts = 0;
    const maxAttempts = 20;

    const checkStatus = async () => {
      try {
        const res = await sessionsApi.checkPesapalStatus(orderTrackingId, merchantReference || undefined);
        const data = res?.data?.data;
        const desc = (data?.status || '').toLowerCase();

        if (desc === 'completed' || data?.payment_status === '1') {
          if (isInIframe()) {
            return;
          }
          if (data?.receipt) {
            setReceiptData(data.receipt);
          }
          setStatus('completed');
          setMessage('Payment completed successfully!');
          return;
        }

        if (desc === 'failed' || data?.payment_status === '3') {
          if (isInIframe()) return;
          setStatus('failed');
          setMessage('Payment was not completed.');
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000);
        } else {
          setStatus('failed');
          setMessage('Payment verification timed out. Please check session status in admin.');
        }
      } catch {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000);
        } else {
          setStatus('failed');
          setMessage('Could not verify payment. Please check session status in admin.');
        }
      }
    };

    checkStatus();
  }, [searchParams]);

  if (isInIframe()) {
    return null;
  }

  return (
    <div className="min-vh-100" style={{ background: '#f8f9fa' }}>
      {status === 'checking' && (
        <div className="d-flex align-items-center justify-content-center min-vh-100">
          <div className="card shadow-lg border-0 rounded-4 p-5 text-center" style={{ maxWidth: 480, width: '90%' }}>
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10 mb-4" style={{ width: 80, height: 80 }}>
              <FiLoader size={40} className="text-warning spinner-border" />
            </div>
            <h4 className="fw-bold mb-2">Verifying Payment</h4>
            <p className="text-secondary mb-4">{message}</p>
            <div className="progress rounded-pill" style={{ height: 6 }}>
              <div className="progress-bar progress-bar-striped progress-bar-animated bg-warning" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      )}

      {status === 'completed' && (
        <div className="py-4">
          {receiptData && <Receipt data={receiptData} />}

          <div className="d-flex gap-2 justify-content-center mt-3 no-print">
            <Link to="/" className="btn btn-outline-secondary rounded-pill px-4 py-2 d-flex align-items-center gap-2">
              <FiArrowLeft /> Home
            </Link>
            <Link to="/booking" className="btn btn-purple rounded-pill px-4 py-2 fw-bold shadow-lg d-flex align-items-center gap-2">
              <FiExternalLink /> Book Again
            </Link>
          </div>

          <div className="text-center mt-3 no-print" style={{ fontSize: 12, color: '#888' }}>
            <FiCheckCircle className="text-success me-1" size={14} />
            {message}
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="d-flex align-items-center justify-content-center min-vh-100">
          <div className="card shadow-lg border-0 rounded-4 p-5 text-center" style={{ maxWidth: 480, width: '90%' }}>
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 mb-4" style={{ width: 80, height: 80 }}>
              <FiXCircle size={40} className="text-danger" />
            </div>
            <h4 className="fw-bold text-danger mb-2">Payment Issue</h4>
            <p className="text-secondary mb-4">{message}</p>
            <div className="d-flex gap-2 justify-content-center">
              <Link to="/" className="btn btn-outline-secondary rounded-pill px-4 py-2">
                <FiArrowLeft className="me-1" /> Home
              </Link>
              <Link to="/booking" className="btn btn-purple rounded-pill px-4 py-2 fw-bold shadow-lg">
                Book Again
              </Link>
            </div>
            <p className="x-small text-muted mt-3 mb-0">
              Contact Kareh's Spa if you need assistance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentCallbackPage;
