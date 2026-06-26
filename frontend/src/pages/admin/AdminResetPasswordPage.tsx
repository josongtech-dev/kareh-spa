import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';

const AdminResetPasswordPage = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const resetToken = sessionStorage.getItem('admin_reset_token');
    if (!resetToken) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const resetToken = sessionStorage.getItem('admin_reset_token');
      if (!resetToken) {
        throw new Error('Password reset session expired');
      }

      const response = await authApi.adminResetPassword({
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      const token = response.data?.token;
      const user = response.data?.user;
      if (!token || !user) {
        throw new Error('Invalid reset response');
      }

      sessionStorage.removeItem('admin_reset_token');
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      setLoading(false);
      navigate('/admin/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Admin password reset failed:', error);
      const apiMessage =
        error?.response?.data?.message ||
        'Failed to reset password. Please try again.';
      setErrorMessage(apiMessage);
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container position-relative overflow-hidden d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="mesh-glow" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass-panel p-4 p-md-5 rounded-4 shadow-lg position-relative"
        style={{ maxWidth: '450px', width: '90%', zIndex: 10 }}
      >
        <div className="text-center mb-5">
          <div className="brand-title h2 mb-2 text-gradient">KAREH SPA</div>
          <div className="text-secondary tracking-widest small">
            SET YOUR NEW PASSWORD
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="alert alert-warning border-0 rounded-3 small mb-4">
            You logged in using an activation password. Set a new password to continue.
          </div>

          <div className="mb-4">
            <label className="form-label small text-secondary mb-2 ms-1">NEW PASSWORD</label>
            <div className="position-relative">
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary">
                <FiLock />
              </span>
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="form-control bg-dark border-0 text-white p-3 ps-5 rounded-3 glass-input"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary cursor-pointer"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{ cursor: 'pointer' }}
              >
                {showNewPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small text-secondary mb-2 ms-1">CONFIRM PASSWORD</label>
            <div className="position-relative">
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary">
                <FiLock />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-control bg-dark border-0 text-white p-3 ps-5 rounded-3 glass-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ cursor: 'pointer' }}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="alert alert-danger border-0 rounded-3 py-2 small mb-4">
              {errorMessage}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn-purple w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            ) : (
              'SAVE PASSWORD & CONTINUE'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminResetPasswordPage;
