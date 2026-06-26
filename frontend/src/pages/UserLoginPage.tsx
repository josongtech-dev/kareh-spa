import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';

const UserLoginPage = () => {
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
      const response = await authApi.login({ identifier, password });
      const token = response.data?.token;
      const user = response.data?.user;
      if (!token || !user) {
        throw new Error('Invalid login response');
      }
      localStorage.setItem('token', token);
      localStorage.setItem('member_user', JSON.stringify(user));
      setLoading(false);
      navigate('/member/offers');
    } catch (error: any) {
      console.error('Member login failed:', error);
      setErrorMessage(error?.response?.data?.message || 'Invalid email/phone or password.');
      setLoading(false);
    }
  };

  return (
    <div className="user-login-container position-relative overflow-hidden d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="mesh-glow" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-4 p-md-5 rounded-4 shadow-lg position-relative"
        style={{ maxWidth: '400px', width: '90%', zIndex: 10 }}
      >
        <div className="text-center mb-5">
          <img src="/karehspalogo.jpeg" alt="Kareh's Spa" height="80" className="mb-3" style={{ objectFit: 'cover', borderRadius: '50%', aspectRatio: '1 / 1' }} />
          <div className="brand-title h2 mb-2 text-gradient">KAREH MEMBER</div>
          <div className="text-secondary small">LOG INTO YOUR ACCOUNT</div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="form-label small text-secondary mb-2 ms-1">EMAIL OR PHONE</label>
            <div className="position-relative">
              <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary">
                <FiUser />
              </span>
              <input 
                type="text" 
                className="form-control bg-dark border-0 text-white p-3 ps-5 rounded-3 glass-input"
                placeholder="Enter email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
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

          <div className="d-flex justify-content-between mb-4 px-1">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="rememberMe" style={{ backgroundColor: 'transparent', borderColor: 'var(--border)' }} />
              <label className="form-check-label small text-secondary" htmlFor="rememberMe">Remember me</label>
            </div>
                <Link to="/forgot-password" className="small text-gold text-decoration-none">Forgot Password?</Link>
          </div>

          {errorMessage && (
            <div className="alert alert-danger border-0 rounded-3 py-2 small">
              {errorMessage}
            </div>
          )}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="btn-purple w-100 py-3 rounded-3 fw-bold"
            disabled={loading}
          >
            {loading ? <span className="spinner-border spinner-border-sm" /> : 'SIGN IN'}
          </motion.button>
        </form>

        <div className="text-center mt-5 pt-3 border-top border-secondary border-opacity-10">
          <p className="text-secondary small mb-3">New to Kareh Spa?</p>
          <Link to="/register" className="btn-gold d-inline-block py-2 px-4 rounded-pill text-decoration-none small text-dark fw-bold mb-4">CREATE ACCOUNT</Link>
          <div className="d-flex justify-content-center gap-4">
            <Link to="/" className="text-secondary text-decoration-none small hover-text-gold transition-all">&larr; Back to Home</Link>
            <Link to="/services" className="text-secondary text-decoration-none small hover-text-gold transition-all">Explore Services &rarr;</Link>
          </div>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass-input {
          background: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          color: white !important;
        }
        .glass-input:focus {
          border-color: var(--bright-purple) !important;
        }
        .hover-text-gold:hover {
          color: var(--gold) !important;
        }
      `}} />
    </div>
  );
};

export default UserLoginPage;
