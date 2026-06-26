import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowLeft } from 'react-icons/fi';
import { sessionsApi } from '../api/sessions';

const isInIframe = (): boolean => window !== window.top;

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'completed' | 'failed'>('checking');
  const [message, setMessage] = useState('Verifying payment...');

  useEffect(() => {
    const orderTrackingId = searchParams.get('order_tracking_id') || searchParams.get('OrderTrackingId') || '';
    const merchantReference = searchParams.get('merchant_reference') || searchParams.get('OrderMerchantReference') || '';

    if (!orderTrackingId) {
      setStatus('failed');
      setMessage('No payment reference found.');
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const checkStatus = async () => {
      try {
        const res = await sessionsApi.checkPesapalStatus(orderTrackingId, merchantReference || undefined);
        const data = res?.data?.data;
        const desc = (data?.status || '').toLowerCase();

        if (desc === 'completed' || data?.payment_status === '1') {
          if (isInIframe()) {
            return;
          }
          setStatus('completed');
          setMessage('Payment completed successfully!');
          return;
        }

        if (desc === 'failed' || data?.payment_status === '3') {
          if (isInIframe()) {
            return;
          }
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

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <div className="card shadow-lg border-0 rounded-4 p-5 text-center" style={{ maxWidth: 480, width: '90%' }}>
        {status === 'checking' && (
          <>
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10 mb-4" style={{ width: 80, height: 80 }}>
              <FiLoader size={40} className="text-warning spinner-border" />
            </div>
              <h4 className="fw-bold mb-2">Verifying Payment</h4>
              <p className="text-secondary mb-4">{message}</p>
            <div className="progress rounded-pill" style={{ height: 6 }}>
              <div className="progress-bar progress-bar-striped progress-bar-animated bg-warning" style={{ width: '100%' }} />
            </div>
          </>
        )}

        {status === 'completed' && (
          <>
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 mb-4" style={{ width: 80, height: 80 }}>
              <FiCheckCircle size={40} className="text-success" />
            </div>
            <h4 className="fw-bold text-success mb-2">Payment Successful</h4>
            <p className="text-secondary mb-4">{message}</p>
            <div className="d-flex gap-2 justify-content-center">
              <Link to="/" className="btn btn-outline-secondary rounded-pill px-4 py-2">
                <FiArrowLeft className="me-1" /> Home
              </Link>
              <Link to="/services" className="btn btn-purple rounded-pill px-4 py-2 fw-bold shadow-lg">
                Our Services
              </Link>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
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
            {!isInIframe() && (
              <p className="x-small text-muted mt-3 mb-0">
                Contact Kareh's Spa if you need assistance.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
