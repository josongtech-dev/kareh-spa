import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`navbar navbar-expand-lg navbar-dark fixed-top ${scrolled ? 'py-2 mt-0' : 'py-4 mt-2'}`}
      style={{ 
        background: scrolled ? 'rgba(10, 10, 10, 0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
      }}
    >
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="fs-3 fw-bold text-gradient brand-title m-0" style={{ letterSpacing: '3px' }}>KAREH&apos;S</span>
        </Link>
        <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center fw-medium text-uppercase" style={{ fontSize: '13px', letterSpacing: '2px' }}>
            {['Home', 'Services', 'Gallery', 'About'].map((item) => (
              <li className="nav-item px-lg-2" key={item}>
                <Link 
                  className={`nav-link position-relative text-white ${location.pathname === (item === 'Home' ? '/' : `/${item.toLowerCase()}`) ? 'active' : 'opacity-75'}`} 
                  to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                >
                  {item}
                  {location.pathname === (item === 'Home' ? '/' : `/${item.toLowerCase()}`) && (
                    <motion.div layoutId="nav-underline" className="position-absolute bottom-0 left-0 w-100 bg-warning" style={{ height: '1px' }} />
                  )}
                </Link>
              </li>
            ))}
            <li className="nav-item ms-lg-4 mt-3 mt-lg-0">
              <Link className="btn btn-gold py-2 px-4 shadow-sm" style={{ fontSize: '12px' }} to="/booking">
                BOOK EXPERIENCE
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
