import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import { memberApi } from '../api/members';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await memberApi.create({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      setLoading(false);
      navigate('/login');
    } catch (error: any) {
      console.error('Member registration failed:', error);
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Registration failed. Please try again.';
      setErrorMessage(apiMessage);
      setLoading(false);
    }
  };

  return (
    <div className="register-container position-relative overflow-hidden d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="mesh-glow" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-4 p-md-5 rounded-4 shadow-lg position-relative"
        style={{ maxWidth: '500px', width: '95%', zIndex: 10 }}
      >
        <div className="text-center mb-5">
          <img src="/karehspalogo.jpeg" alt="Kareh's Spa" height="80" className="mb-3" style={{ objectFit: 'cover', borderRadius: '50%', aspectRatio: '1 / 1' }} />
          <div className="brand-title h2 mb-2 text-gradient">JOIN KAREH SPA</div>
          <div className="text-secondary small">CREATE YOUR MEMBERSHIP ACCOUNT</div>
        </div>

        <form onSubmit={handleRegister}>
          <div className="row g-3">
            {/* Full Name */}
            <div className="col-12 mb-2">
              <label className="form-label small text-secondary mb-2 ms-1">FULL NAME</label>
              <div className="position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary">
                  <FiUser />
                </span>
                <input 
                  type="text" 
                  name="fullName"
                  className="form-control bg-dark border-0 text-white p-3 ps-5 rounded-3 glass-input"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="col-md-6 mb-2">
              <label className="form-label small text-secondary mb-2 ms-1">EMAIL ADDRESS</label>
              <div className="position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary">
                  <FiMail />
                </span>
                <input 
                  type="email" 
                  name="email"
                  className="form-control bg-dark border-0 text-white p-3 ps-5 rounded-3 glass-input"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="col-md-6 mb-2">
              <label className="form-label small text-secondary mb-2 ms-1">PHONE NUMBER</label>
              <div className="position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary">
                  <FiPhone />
                </span>
                <input 
                  type="tel" 
                  name="phone"
                  className="form-control bg-dark border-0 text-white p-3 ps-5 rounded-3 glass-input"
                  placeholder="0700 000 000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="col-12 mb-2">
              <label className="form-label small text-secondary mb-2 ms-1">CREATE PASSWORD</label>
              <div className="position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary">
                  <FiLock />
                </span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  className="form-control bg-dark border-0 text-white p-3 ps-5 rounded-3 glass-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
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
            {/* Confirm Password */}
            <div className="col-12 mb-2">
              <label className="form-label small text-secondary mb-2 ms-1">CONFIRM PASSWORD</label>
              <div className="position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary">
                  <FiLock />
                </span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="confirmPassword"
                  className="form-control bg-dark border-0 text-white p-3 ps-5 rounded-3 glass-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
          </div>

          <div className="form-check my-4 px-1">
            <input className="form-check-input" type="checkbox" id="terms" required style={{ backgroundColor: 'transparent', borderColor: 'var(--border)' }} />
            <label className="form-check-label small text-secondary" htmlFor="terms">
              I agree to the <a href="/terms" className="text-gold text-decoration-none">Terms & Conditions</a> and <a href="/privacy" className="text-gold text-decoration-none">Privacy Policy</a>
            </label>
          </div>

          {errorMessage && (
            <div className="alert alert-danger py-2 small border-0 rounded-3">
              {errorMessage}
            </div>
          )}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="btn-purple w-100 py-3 rounded-3 fw-bold mt-2"
            disabled={loading}
          >
            {loading ? <span className="spinner-border spinner-border-sm" /> : 'CREATE ACCOUNT'}
          </motion.button>
        </form>

        <div className="text-center mt-5 pt-3 border-top border-secondary border-opacity-10">
          <p className="text-secondary small mb-3">
            Already a member? <Link to="/login" className="text-gold fw-bold text-decoration-none ms-1">LOGIN HERE</Link>
          </p>
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
          font-size: 0.9rem;
        }
        .glass-input:focus {
          border-color: var(--bright-purple) !important;
          box-shadow: 0 0 15px rgba(157, 0, 255, 0.1) !important;
        }
      `}} />
    </div>
  );
};

export default RegisterPage;
