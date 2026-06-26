import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await authApi.adminLogin({ identifier, password });
      const mustResetPassword = !!response.data?.must_reset_password;
      const resetToken = response.data?.reset_token;
      const token = response.data?.token;
      const user = response.data?.user;

      if (mustResetPassword) {
        if (!resetToken) {
          throw new Error('Missing password reset token');
        }
        sessionStorage.setItem('admin_reset_token', resetToken);
        setLoading(false);
        navigate('/admin/reset-password');
        return;
      }

      if (!token || !user) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      setLoading(false);
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Admin login failed:', error);
      const apiMessage =
        error?.response?.data?.message ||
        'Invalid login details. Please try again.';
      setErrorMessage(apiMessage);
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container position-relative overflow-hidden d-flex align-items-center justify-content-center min-vh-100 py-5">
      {/* Mesh Glow Background */}
      <div className="mesh-glow" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass-panel p-4 p-md-5 rounded-4 shadow-lg position-relative"
        style={{ maxWidth: '450px', width: '90%', zIndex: 10 }}
      >
        <div className="text-center mb-5">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="d-flex flex-column align-items-center gap-2"
          >
            <img src="/karehspalogo.jpeg" alt="Kareh's Spa" height="80" style={{ objectFit: 'cover', borderRadius: '50%', aspectRatio: '1 / 1' }} />
            <div className="brand-title h2 mb-0 text-gradient">KAREH SPA</div>
          </motion.div>
          <div className="text-secondary tracking-widest small">ADMIN PORTAL</div>
        </div>

        <form onSubmit={handleLogin}>

          {/* Identifier Input (Email/Phone/Username/ID) */}
          <div className="mb-4">
            <label className="form-label small text-secondary mb-2 ms-1">EMAIL, PHONE, USERNAME OR ID</label>
            <div className="position-relative">
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary">
                <FiUser />
              </span>
              <input 
                type="text" 
                className="form-control bg-dark border-0 text-white p-3 ps-5 rounded-3 glass-input"
                placeholder="Enter your identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          {errorMessage && (
            <div className="alert alert-danger border-0 rounded-3 py-2 small mb-4">
              {errorMessage}
            </div>
          )}

          {/* Password Input */}
          <div className="mb-5">
            <label className="form-label small text-secondary mb-2 ms-1">PASSWORD</label>
            <div className="position-relative">
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary">
                <FiLock />
              </span>
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control bg-dark border-0 text-white p-3 ps-5 rounded-3 glass-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span 
                className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer' }}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

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
              'SIGN INTO DASHBOARD'
            )}
          </motion.button>
        </form>

        <div className="text-center mt-4 d-flex flex-column gap-2">
          <a href="/" className="text-secondary text-decoration-none small transition-all hover-text-gold">
            &larr; Return to Website
          </a>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .role-option:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .glass-input {
          background: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          transition: all 0.3s ease;
        }
        .glass-input:focus {
          border-color: var(--bright-purple) !important;
          box-shadow: 0 0 15px rgba(157, 0, 255, 0.2) !important;
          background: rgba(255, 255, 255, 0.05) !important;
        }
        .rotate-180 {
          transform: rotate(180deg);
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .hover-text-gold:hover {
          color: var(--gold) !important;
        }
      `}} />
    </div>
  );
};

export default AdminLoginPage;
