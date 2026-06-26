import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must include uppercase, lowercase, and a digit.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/member-reset-password.php', { token, password });
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="text-center px-3" style={{ maxWidth: 420 }}>
          <h2 className="fw-bold mb-2">Invalid Link</h2>
          <p className="text-secondary mb-4">This reset link is missing or invalid.</p>
          <Link to="/forgot-password" className="btn btn-outline-secondary rounded-pill px-4">Request New Link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center py-5">
      <div className="w-100 px-3" style={{ maxWidth: 420 }}>
        <h2 className="fw-bold mb-2">Reset Password</h2>
        <p className="text-secondary mb-4">Choose a new password for your account.</p>

        {error && <div className="alert alert-danger border-0 rounded-4 py-2 small">{error}</div>}

        {done ? (
          <>
            <div className="alert alert-success border-0 rounded-4 py-3">
              Your password has been reset successfully.
            </div>
            <Link to="/login" className="btn btn-purple w-100">Go to Login</Link>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small">New Password</label>
              <input
                type="password"
                className="form-control bg-dark text-white border-white border-opacity-10"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small">Confirm Password</label>
              <input
                type="password"
                className="form-control bg-dark text-white border-white border-opacity-10"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
              />
            </div>
            <button className="btn btn-purple w-100" type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
