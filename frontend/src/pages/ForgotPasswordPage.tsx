import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/member-forgot-password.php', { email });
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center py-5">
      <div className="w-100 px-3" style={{ maxWidth: 420 }}>
        <h2 className="fw-bold mb-2">Forgot Password</h2>
          <p className="text-secondary mb-4">Enter your email and we'll send you a reset link.</p>

          {error && <div className="alert alert-danger border-0 rounded-4 py-2 small">{error}</div>}

          {sent ? (
            <div className="alert alert-success border-0 rounded-4 py-3">
              If the email is registered, a reset link has been sent. Please check your inbox.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small">Email address</label>
                <input
                  type="email"
                  className="form-control bg-dark text-white border-white border-opacity-10"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <button className="btn btn-purple w-100 mb-3" type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="text-center small mb-0">
            <Link to="/login" className="text-gold text-decoration-none">Back to Login</Link>
          </p>
      </div>
    </div>
  );
}
