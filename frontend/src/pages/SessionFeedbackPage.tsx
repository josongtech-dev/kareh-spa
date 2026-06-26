import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sessionFeedbackApi, type SessionFeedbackContext } from '../api/sessionFeedback';

const SessionFeedbackPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [context, setContext] = useState<SessionFeedbackContext | null>(null);
  const [serviceRating, setServiceRating] = useState(5);
  const [billingRating, setBillingRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    const loadContext = async () => {
      if (!token) {
        setError('Feedback link is missing a token.');
        setLoading(false);
        return;
      }
      try {
        const response = await sessionFeedbackApi.getContext(token);
        const payload = response.data?.data || response.data;
        setContext(payload as SessionFeedbackContext);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Feedback link is invalid or expired.');
      } finally {
        setLoading(false);
      }
    };

    loadContext();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    setError('');
    try {
      await sessionFeedbackApi.submit({
        token,
        service_rating: serviceRating,
        billing_rating: billingRating,
        feedback_text: feedbackText.trim(),
      });
      setSuccess('Thank you for your feedback.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to submit feedback right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-black min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="glass-panel rounded-5 p-4 p-md-5">
          <h1 className="Oswald display-6 mb-3">Session Feedback</h1>
          {loading && <p className="mb-0 opacity-75">Loading your session details...</p>}
          {!loading && error && <div className="alert alert-danger mb-0">{error}</div>}
          {!loading && !error && context && !success && (
            <form onSubmit={handleSubmit}>
              <p className="opacity-75 mb-2">Hi {context.customer_name || 'there'}, thank you for visiting Kareh&apos;s Spa.</p>
              <div className="d-flex align-items-center gap-3 mb-4">
                <p className="small opacity-75 mb-0">
                  Session <strong>{context.session_code}</strong>
                </p>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Rate the service experience</label>
                <select className="form-select" value={serviceRating} onChange={(e) => setServiceRating(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>{value} / 5</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Rate the billing experience</label>
                <select className="form-select" value={billingRating} onChange={(e) => setBillingRating(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>{value} / 5</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Additional feedback (optional)</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us how we can improve your experience."
                />
              </div>

              <button type="submit" className="btn btn-purple w-100" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}
          {!loading && success && <div className="alert alert-success mb-0">{success}</div>}
        </div>
      </div>
    </div>
  );
};

export default SessionFeedbackPage;
